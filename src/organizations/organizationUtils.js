export function loadOrganizations() {
  try {
    const saved = JSON.parse(localStorage.getItem('organizations') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function getOrganizationMembers(organization) {
  if (Array.isArray(organization.members)) {
    return organization.members;
  }

  return organization.admin
    ? [{ username: organization.admin, role: 'admin' }]
    : [];
}
