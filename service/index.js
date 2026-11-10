const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();

const authCookieName = 'token';

// Organizations and users are saved in memory and disappear whenever the service is restarted.
let users = [];
let organizations = [];

const port = process.argv.length > 2 ? process.argv[2] : 4000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

app.use(express.static('public'));

const apiRouter = express.Router();
app.use('/api', apiRouter);

// Register a new user
apiRouter.post('/auth/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password) {
    throw httpError(400, 'Username and password are required');
  }

  if (await findUser('username', username.trim())) {
    throw httpError(409, 'Existing user');
  }

  const user = await createUser(username.trim(), password);
  setAuthCookie(res, user.token);
  res.status(201).send({ username: user.username });
});

// Log in an existing user
apiRouter.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password) {
    throw httpError(400, 'Username and password are required');
  }

  const user = await findUser('username', username.trim());
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw httpError(401, 'Unauthorized');
  }

  user.token = uuid.v4();
  setAuthCookie(res, user.token);
  res.send({ username: user.username });
});

// Log out the current user
apiRouter.delete('/auth/logout', (req, res) => {
  const token = req.cookies[authCookieName];
  const user = users.find(existingUser => existingUser.token === token);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Get the current user
apiRouter.get('/auth/me', verifyAuth, (req, res) => {
  res.send({ username: req.user.username });
});

// Create an organization
apiRouter.post('/organizations', verifyAuth, async (req, res) => {
  const { name, address } = req.body || {};
  if (typeof name !== 'string' || !name.trim() ||
      typeof address !== 'string' || !address.trim()) {
    throw httpError(400, 'Name and address are required');
  }

  const organization = createOrganization(req.user.username, name, address);
  res.status(201).send(organization);
});

// Delete an organization
apiRouter.delete('/organizations/:organizationId', verifyAuth, async (req, res) => {
  const { organizationId } = req.params;
  await deleteOrganization(organizationId, req.user.username);
  res.status(204).end();
});

// Get all organizations
apiRouter.get('/organizations', async (req, res) => {
  res.send(organizations.map(({ id, name, address }) => ({ id, name, address })));
});

// Get organizations that the current user belongs to
apiRouter.get('/organizations/mine', verifyAuth, (req, res) => {
  const userOrganizations = organizations.flatMap(organization => {
    const member = organization.members.find(
      existingMember => existingMember.username === req.user.username
    );
    return member
      ? [{
          id: organization.id,
          name: organization.name,
          address: organization.address,
          role: member.role,
        }]
      : [];
  });
  res.send(userOrganizations);
});

// Get a specific organization
apiRouter.get('/organizations/:organizationId', verifyAuth, async (req, res) => {
  const organization = await requireOrganization(req.params.organizationId);
  res.send(organization);
});

// Join an organization
apiRouter.post('/organizations/:organizationId/members', verifyAuth, async (req, res) => {
  const { organizationId } = req.params;
  const member = await joinOrganization(organizationId, req.user.username);
  res.status(201).send(member);
});

// Leave an organization
apiRouter.delete('/organizations/:organizationId/members', verifyAuth, async (req, res) => {
  const { organizationId } = req.params;
  await leaveOrganization(organizationId, req.user.username);
  res.status(204).end();
});

// Create an item for an organization
apiRouter.post('/organizations/:organizationId/items', verifyAuth, async (req, res) => {
  const { organizationId } = req.params;
  const { collectionName, item } = req.body || {};
  await addOrganizationItem(organizationId, collectionName, item, req.user.username);
  res.status(201).send({ msg: 'Item added successfully' });
});

// Edit an item for an organization
apiRouter.put('/organizations/:organizationId/items/:itemId', verifyAuth, async (req, res) => {
  const { organizationId, itemId } = req.params;
  const { collectionName, updatedItem } = req.body || {};
  await editOrganizationItem(organizationId, collectionName, itemId, updatedItem, req.user.username);
  res.send({ msg: 'Item updated successfully' });
});

// Delete an item for an organization
apiRouter.delete('/organizations/:organizationId/items/:itemId', verifyAuth, async (req, res) => {
  const { organizationId, itemId } = req.params;
  const { collectionName } = req.body || {};
  await deleteOrganizationItem(organizationId, collectionName, itemId, req.user.username);
  res.status(204).end();
});

// Add a feedback report for an organization
apiRouter.post('/organizations/:organizationId/feedback', async (req, res) => {
  const { organizationId } = req.params;
  await addFeedbackReport(organizationId, req.body);
  res.status(201).send({ msg: 'Feedback report added successfully' });
});

// Delete a feedback report for an organization
apiRouter.delete('/organizations/:organizationId/feedback/:reportId', verifyAuth, async (req, res) => {
  const { organizationId, reportId } = req.params;
  await deleteFeedbackReport(organizationId, reportId, req.user.username);
  res.status(204).end();
});

// Edit specific member's role for an organization
apiRouter.put('/organizations/:organizationId/members/:memberUsername', verifyAuth, async (req, res) => {
  const { organizationId, memberUsername } = req.params;
  const { newRole } = req.body || {};
  await editMemberRole(organizationId, memberUsername, newRole, req.user.username);
  res.send({ msg: 'Member role updated successfully' });
});

// Return endpoint errors in a consistent JSON shape.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error.status >= 500 || !error.status) {
    console.error(error);
  }
  res.status(error.status || 500).send({
    msg: error.status && error.status < 500 ? error.message : 'Internal server error',
  });
});

// Middleware to verify that the user is authorized to call an endpoint.
async function verifyAuth(req, res, next) {
  const user = await findUser('token', req.cookies?.[authCookieName]);
  if (user) {
    req.user = user;
    next();
  } else {
    next(httpError(401, 'Unauthorized'));
  }
}










async function createUser(username, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    username: username,
    password: passwordHash,
    token: uuid.v4(),
  };
  users.push(user);

  return user;
}

async function findUser(field, value) {
  if (!value) return null;

  return users.find((u) => u[field] === value);
}

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  });
}

function createOrganization(admin, name, address) {
  const organization = {
    id: crypto.randomUUID(),
    name: name.trim(),
    address: address.trim(),
    admin,
    members: [{ username: admin, role: 'admin' }],
    announcements: [],
    maintenanceRequests: [],
    feedbackReports: [],
  };
  organizations.push(organization);
  return organization;
}

async function deleteOrganization(organizationId, username) {
  const organization = await requireOrganization(organizationId);
  requireAdmin(organization, username, 'delete the organization');
  organizations = organizations.filter(item => item.id !== organizationId);
}

async function joinOrganization(organizationId, username) {
  const organization = await requireOrganization(organizationId);
  if (!Array.isArray(organization.members)) {
    throw httpError(500, 'Organization member list is invalid');
  }
  if (organization.members.some(member => member.username === username)) {
    throw httpError(409, 'Already a member of this organization');
  }

  const member = { username, role: 'viewer' };
  organization.members.push(member);
  return member;
}

async function leaveOrganization(organizationId, username) {
  const organization = await requireOrganization(organizationId);
  if (!Array.isArray(organization.members)) {
    throw httpError(500, 'Organization member list is invalid');
  }

  const memberIndex = organization.members.findIndex(
    member => member.username === username
  );
  if (memberIndex === -1) {
    throw httpError(404, 'Organization member not found');
  }

  const member = organization.members[memberIndex];
  if (member.role === 'admin') {
    throw httpError(403, 'Admins cannot leave their organization');
  }

  organization.members.splice(memberIndex, 1);
}

async function findOrganization(field, value) {
  if (!value) return null;
  return organizations.find((o) => o[field] === value);
}

async function requireOrganization(organizationId) {
  const organization = await findOrganization('id', organizationId);
  if (!organization) {
    throw httpError(404, 'Organization not found');
  }
  return organization;
}

function requireAdmin(organization, username, action) {
  const members = Array.isArray(organization.members) ? organization.members : [];
  const isAdmin = members.some(
    member => member.username === username && member.role === 'admin'
  );
  if (!isAdmin) {
    throw httpError(403, `Only the organization admin can ${action}`);
  }
}

function requireOrganizationCollection(organization, collectionName) {
  if (!['announcements', 'maintenanceRequests'].includes(collectionName)) {
    throw httpError(400, `Unknown organization collection: ${collectionName}`);
  }
  const collection = organization[collectionName];
  if (!Array.isArray(collection)) {
    throw httpError(500, `Organization collection is invalid: ${collectionName}`);
  }
  return collection;
}

function requireObject(value, message) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw httpError(400, message);
  }
}

async function addOrganizationItem(organizationId, collectionName, item, username) {
  const organization = await requireOrganization(organizationId);
  requireAdmin(organization, username, 'add items');
  requireObject(item, 'Item must be an object');
  if (typeof item.id !== 'string' || !item.id) {
    throw httpError(400, 'Item id is required');
  }
  requireOrganizationCollection(organization, collectionName).push(item);
}

async function editOrganizationItem(organizationId, collectionName, itemId, updatedItem, username) {
  const organization = await requireOrganization(organizationId);
  requireAdmin(organization, username, 'edit items');
  requireObject(updatedItem, 'Updated item must be an object');
  const collection = requireOrganizationCollection(organization, collectionName);
  const itemIndex = collection.findIndex(item => item.id === itemId);
  if (itemIndex === -1) {
    throw httpError(404, 'Item not found');
  }
  collection[itemIndex] = {
    ...collection[itemIndex],
    ...updatedItem,
    id: collection[itemIndex].id,
  };
}

async function deleteOrganizationItem(organizationId, collectionName, itemId, username) {
  const organization = await requireOrganization(organizationId);
  requireAdmin(organization, username, 'delete items');
  const collection = requireOrganizationCollection(organization, collectionName);
  const itemIndex = collection.findIndex(item => item.id === itemId);
  if (itemIndex === -1) {
    throw httpError(404, 'Item not found');
  }
  collection.splice(itemIndex, 1);
}

async function addFeedbackReport(organizationId, report) {
  const organization = await requireOrganization(organizationId);
  requireObject(report, 'Feedback report must be an object');
  if (typeof report.id !== 'string' || !report.id) {
    throw httpError(400, 'Feedback report id is required');
  }
  if (!Array.isArray(organization.feedbackReports)) {
    throw httpError(500, 'Organization feedback collection is invalid');
  }
  organization.feedbackReports.push(report);
}

async function deleteFeedbackReport(organizationId, reportId, username) {
  const organization = await requireOrganization(organizationId);
  requireAdmin(organization, username, 'delete feedback reports');
  const reports = organization.feedbackReports;
  if (!Array.isArray(reports)) {
    throw httpError(500, 'Organization feedback collection is invalid');
  }
  const reportIndex = reports.findIndex(report => report.id === reportId);
  if (reportIndex === -1) {
    throw httpError(404, 'Feedback report not found');
  }
  reports.splice(reportIndex, 1);
}

async function editMemberRole(organizationId, memberUsername, newRole, username) {
  const organization = await requireOrganization(organizationId);
  requireAdmin(organization, username, 'edit member roles');
  if (!['admin', 'employee', 'viewer'].includes(newRole)) {
    throw httpError(400, 'Invalid member role');
  }
  if (!Array.isArray(organization.members)) {
    throw httpError(500, 'Organization member list is invalid');
  }
  const member = organization.members.find(item => item.username === memberUsername);
  if (!member) {
    throw httpError(404, 'Organization member not found');
  }
  const adminCount = organization.members.filter(item => item.role === 'admin').length;
  if (member.role === 'admin' && newRole !== 'admin' && adminCount === 1) {
    throw httpError(400, 'The organization must have at least one admin');
  }
  member.role = newRole;
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

app.listen(port, () => {
  console.log(`Service listening on port ${port}`);
});
