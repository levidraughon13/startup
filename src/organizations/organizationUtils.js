export function getOrganizationMembers(organization) {
  if (Array.isArray(organization.members)) {
    return organization.members;
  }

  return organization.admin
    ? [{ username: organization.admin, role: 'admin' }]
    : [];
}
