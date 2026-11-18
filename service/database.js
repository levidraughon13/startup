const { MongoClient } = require('mongodb');
const config = require('../dbConfig.json');

const url = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;

const client = new MongoClient(url);
const db = client.db('crewcomms');
const orgsCollection = db.collection('organizations');
const userCollection = db.collection('users');


// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log(`Connect to database`);
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();


async function createUser(userOrUsername, password) {
  const user = typeof userOrUsername === 'string'
    ? { username: userOrUsername, password }
    : userOrUsername;

  if (!user || typeof user !== 'object') {
    throw new Error('User must be an object');
  }

  await userCollection.insertOne(user);
  return user;
}

async function findUser(field, value) {
  if (!field || !value) return null;
  return userCollection.findOne({ [field]: value });
}

async function getUser(field, value) {
  return findUser(field, value);
}

async function getUserByUsername(username) {
  return findUser('username', username);
}

async function getUserByToken(token) {
  return findUser('token', token);
}

async function updateUser(field, value, updates) {
  if (!field || !value) return null;

  if (typeof updates !== 'object' || updates === null || Array.isArray(updates)) {
    throw new Error('User updates must be an object');
  }

  const update = Object.prototype.hasOwnProperty.call(updates, '$set')
    ? updates
    : { $set: updates };

  const result = await userCollection.findOneAndUpdate(
    { [field]: value },
    update,
    { returnDocument: 'after' }
  );
  return result;
}

async function deleteUser(field, value) {
  if (!field || !value) return null;
  return userCollection.deleteOne({ [field]: value });
}


async function createOrganization(adminOrOrganization, name, address) {
  const organization = typeof adminOrOrganization === 'string'
    ? {
        id: globalThis.crypto?.randomUUID?.() ?? require('crypto').randomUUID(),
        name: name?.trim(),
        address: address?.trim(),
        admin: adminOrOrganization,
        members: [{ username: adminOrOrganization, role: 'admin' }],
        announcements: [],
        maintenanceRequests: [],
        feedbackReports: [],
      }
    : adminOrOrganization;

  if (!organization || typeof organization !== 'object') {
    throw new Error('Organization must be an object');
  }

  await orgsCollection.insertOne(organization);
  return organization;
}

async function findOrganization(field, value) {
  if (!field || !value) return null;
  return orgsCollection.findOne({ [field]: value });
}

async function getOrganization(fieldOrId, value) {
  if (arguments.length === 1) return findOrganization('id', fieldOrId);
  return findOrganization(fieldOrId, value);
}

async function getOrganizations(filter = {}) {
  return orgsCollection.find(filter).toArray();
}

async function getAllOrganizations() {
  return getOrganizations();
}

async function getOrganizationsForUser(username) {
  if (!username) return [];
  return orgsCollection.find({ 'members.username': username }).toArray();
}

async function deleteOrganization(organizationId) {
  return orgsCollection.deleteOne({ id: organizationId });
}

async function updateOrganization(organizationId, updates) {
  if (!organizationId) return null;
  if (typeof updates !== 'object' || updates === null || Array.isArray(updates)) {
    throw new Error('Organization updates must be an object');
  }

  const update = Object.prototype.hasOwnProperty.call(updates, '$set')
    || Object.prototype.hasOwnProperty.call(updates, '$unset')
    || Object.prototype.hasOwnProperty.call(updates, '$push')
    || Object.prototype.hasOwnProperty.call(updates, '$pull')
    ? updates
    : { $set: updates };

  const result = await orgsCollection.findOneAndUpdate(
    { id: organizationId },
    update,
    { returnDocument: 'after' }
  );
  return result;
}

async function joinOrganization(organizationId, member) {
  if (!organizationId || !member || typeof member !== 'object') return null;
  const result = await orgsCollection.findOneAndUpdate(
    { id: organizationId },
    { $push: { members: member } },
    { returnDocument: 'after' }
  );
  return result;
}

async function leaveOrganization(organizationId, username) {
  if (!organizationId || !username) return null;
  const result = await orgsCollection.findOneAndUpdate(
    { id: organizationId },
    { $pull: { members: { username } } },
    { returnDocument: 'after' }
  );
  return result;
}

async function editMemberRole(organizationId, memberUsername, newRole) {
  if (!organizationId || !memberUsername) return null;
  const result = await orgsCollection.findOneAndUpdate(
    { id: organizationId, 'members.username': memberUsername },
    { $set: { 'members.$.role': newRole } },
    { returnDocument: 'after' }
  );
  return result;
}


async function addOrganizationItem(organizationId, collectionName, item) {
  if (!organizationId || !collectionName || !item) return null;
  if (!['announcements', 'maintenanceRequests'].includes(collectionName)) {
    throw new Error(`Unknown organization collection: ${collectionName}`);
  }

  const result = await orgsCollection.findOneAndUpdate(
    { id: organizationId },
    { $push: { [collectionName]: item } },
    { returnDocument: 'after' }
  );
  return result;
}

async function editOrganizationItem(organizationId, collectionName, itemId, updatedItem) {
  if (!organizationId || !collectionName || !itemId || !updatedItem) return null;
  if (!['announcements', 'maintenanceRequests'].includes(collectionName)) {
    throw new Error(`Unknown organization collection: ${collectionName}`);
  }

  const organization = await getOrganization(organizationId);
  if (!organization) return null;
  const items = organization[collectionName];
  if (!Array.isArray(items)) return null;

  const itemIndex = items.findIndex(item => item.id === itemId);
  if (itemIndex === -1) return null;

  items[itemIndex] = {
    ...items[itemIndex],
    ...updatedItem,
    id: items[itemIndex].id,
  };

  return orgsCollection.findOneAndUpdate(
    { id: organizationId },
    { $set: { [collectionName]: items } },
    { returnDocument: 'after' }
  );
}

async function updateOrganizationItem(organizationId, collectionName, itemId, updatedItem) {
  return editOrganizationItem(organizationId, collectionName, itemId, updatedItem);
}

async function deleteOrganizationItem(organizationId, collectionName, itemId) {
  if (!organizationId || !collectionName || !itemId) return null;
  if (!['announcements', 'maintenanceRequests'].includes(collectionName)) {
    throw new Error(`Unknown organization collection: ${collectionName}`);
  }

  const organization = await getOrganization(organizationId);
  if (!organization) return null;
  const items = organization[collectionName];
  if (!Array.isArray(items)) return null;

  const updatedItems = items.filter(item => item.id !== itemId);
  return orgsCollection.findOneAndUpdate(
    { id: organizationId },
    { $set: { [collectionName]: updatedItems } },
    { returnDocument: 'after' }
  );
}

async function addFeedbackReport(organizationId, report) {
  if (!organizationId || !report) return null;
  const result = await orgsCollection.findOneAndUpdate(
    { id: organizationId },
    { $push: { feedbackReports: report } },
    { returnDocument: 'after' }
  );
  return result;
}

async function deleteFeedbackReport(organizationId, reportId) {
  if (!organizationId || !reportId) return null;
  const organization = await getOrganization(organizationId);
  if (!organization) return null;
  const reports = organization.feedbackReports;
  if (!Array.isArray(reports)) return null;

  const updatedReports = reports.filter(report => report.id !== reportId);
  return orgsCollection.findOneAndUpdate(
    { id: organizationId },
    { $set: { feedbackReports: updatedReports } },
    { returnDocument: 'after' }
  );
}



module.exports = {
  createUser,
  findUser,
  getUser,
  getUserByUsername,
  getUserByToken,
  updateUser,
  deleteUser,

  createOrganization,
  findOrganization,
  getOrganization,
  getOrganizations,
  getAllOrganizations,
  getOrganizationsForUser,
  deleteOrganization,
  updateOrganization,
  joinOrganization,
  leaveOrganization,
  editMemberRole,

  addOrganizationItem,
  editOrganizationItem,
  updateOrganizationItem,
  deleteOrganizationItem,
  addFeedbackReport,
  deleteFeedbackReport,
};