export async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
  });
  let body = null;

  if (response.status !== 204) {
    const contentType = response.headers.get('content-type') || '';
    body = contentType.includes('application/json')
      ? await response.json()
      : await response.text();
  }

  if (!response.ok) {
    const message =
      typeof body === 'object' && body !== null
        ? body.msg
        : typeof body === 'string' && body
          ? body
          : `Request failed (${response.status})`;
    const error = new Error(message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return body;
}

export function getCurrentUser() {
  return apiRequest('/api/auth/me');
}

export function loginUser(username, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
}

export function registerUser(username, password) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
}

export function logoutUser() {
  return apiRequest('/api/auth/logout', { method: 'DELETE' });
}

export function listOrganizations() {
  return apiRequest('/api/organizations');
}

export function getMyOrganizations() {
  return apiRequest('/api/organizations/mine');
}

export function getOrganization(organizationId) {
  return apiRequest(`/api/organizations/${organizationId}`);
}

export function createOrganization(name, address) {
  return apiRequest('/api/organizations', {
    method: 'POST',
    body: JSON.stringify({ name, address }),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
}

export function deleteOrganization(organizationId) {
  return apiRequest(`/api/organizations/${organizationId}`, {
    method: 'DELETE',
  });
}

export function joinOrganization(organizationId) {
  return apiRequest(`/api/organizations/${organizationId}/members`, {
    method: 'POST',
  });
}

export function leaveOrganization(organizationId) {
  return apiRequest(`/api/organizations/${organizationId}/members`, {
    method: 'DELETE',
  });
}

export function addOrganizationItem(organizationId, collectionName, item) {
  return apiRequest(`/api/organizations/${organizationId}/items`, {
    method: 'POST',
    body: JSON.stringify({ collectionName, item }),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
}

export function updateOrganizationItem(
  organizationId,
  collectionName,
  itemId,
  updatedItem
) {
  return apiRequest(`/api/organizations/${organizationId}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ collectionName, updatedItem }),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
}

export function deleteOrganizationItem(organizationId, collectionName, itemId) {
  return apiRequest(`/api/organizations/${organizationId}/items/${itemId}`, {
    method: 'DELETE',
    body: JSON.stringify({ collectionName }),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
}

export function addFeedbackReport(organizationId, report) {
  return apiRequest(`/api/organizations/${organizationId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(report),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
}

export function deleteFeedbackReport(organizationId, reportId) {
  return apiRequest(
    `/api/organizations/${organizationId}/feedback/${reportId}`,
    { method: 'DELETE' }
  );
}

export function updateMemberRole(organizationId, username, newRole) {
  return apiRequest(
    `/api/organizations/${organizationId}/members/${encodeURIComponent(username)}`,
    {
      method: 'PUT',
      body: JSON.stringify({ newRole }),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }
  );
}
