const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();

const authCookieName = 'token';

// The scores and users are saved in memory and disappear whenever the service is restarted.
let users = [];
let scores = [];
let organizations = [];


const port = process.argv.length > 2 ? process.argv[2] : 4000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

app.use(express.static('public'));

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// CreateAuth a new user
apiRouter.post('/auth/register', async (req, res) => {
  if (await findUser('username', req.body.username)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.username, req.body.password);

    setAuthCookie(res, user.token);
    res.send({ username: user.username });
  }
});

// GetAuth login an existing user
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('username', req.body.username);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      setAuthCookie(res, user.token);
      res.send({ username: user.username });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth logout a user
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Create an organization
//apiRouter.post('/organizations', verifyAuth, async (req, res) => {
  






// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};










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
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

async function createOrganization(name, address) { 
    const admin = localStorage.getItem('username');
    if (!admin) {
      setAuthMessage('You must be logged in to add an organization.');
      return;
    }

    const newOrganization = {
      id: crypto.randomUUID(),
      name: name.trim(),
      address: address.trim(),
      admin: admin,
      members: [{ username: admin, role: 'admin' }],
      announcements: [],
      maintenanceRequests: [],
      feedbackReports: [],
    };

    organizations.push(newOrganization);

    return newOrganization;
}

async function findOrganization(field, value) {
  if (!value) return null;
  return organizations.find((o) => o[field] === value);
}

async function addAnnouncement(organizationId, announcement) {
    const organization = await findOrganization('id', organizationId);
    if (!organization) {
        throw new Error('Organization not found');
    }
    organization.announcements.push(announcement);
}

async function addMaintenanceRequest(organizationId, request) {
    const organization = await findOrganization('id', organizationId);
    if (!organization) {
        throw new Error('Organization not found');
    }
    organization.maintenanceRequests.push(request);
}

async function addFeedbackReport(organizationId, report) {
    const organization = await findOrganization('id', organizationId);
    if (!organization) {
        throw new Error('Organization not found');
    }
    organization.feedbackReports.push(report);
}

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

app.listen(port, () => {
  console.log(`Service listening on port ${port}`);
});
