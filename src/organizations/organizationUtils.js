import {
  createOrganization,
  getMyOrganizations,
  joinOrganization,
  leaveOrganization,
  listOrganizations,
} from '../api';

export async function loadOrganizationDirectory(username) {
  const [organizations, memberships] = await Promise.all([
    listOrganizations(),
    username ? getMyOrganizations() : Promise.resolve([]),
  ]);
  return { organizations, memberships };
}

export { createOrganization, joinOrganization, leaveOrganization };

export function getOrganizationMembers(organization) {
  if (Array.isArray(organization.members)) {
    return organization.members;
  }

  return organization.admin
    ? [{ username: organization.admin, role: 'admin' }]
    : [];
}
