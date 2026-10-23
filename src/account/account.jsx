import React from 'react';
import { getOrganizationMembers } from '../organizations/organizationUtils';

function loadOrganizations() {
    try {
        const saved = JSON.parse(localStorage.getItem('organizations') || '[]');
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

export function Account() {
    const [username] = React.useState(localStorage.getItem('username') || null);
    const [organizations, setOrganizations] = React.useState(loadOrganizations);
    const [organizationToDelete, setOrganizationToDelete] = React.useState(null);

    React.useEffect(() => {
        localStorage.setItem('organizations', JSON.stringify(organizations));
    }, [organizations]);

    const userOrganizations = organizations.flatMap(organization => {
        const member = getOrganizationMembers(organization).find(
            item => item.username === username
        );
        return member ? [{ organization, role: member.role }] : [];
    });

    function handleLeave(organizationId) {
        setOrganizations(current =>
            current.map(organization => {
                if (organization.id !== organizationId) {
                    return organization;
                }

                return {
                    ...organization,
                    members: getOrganizationMembers(organization).filter(
                        member => member.username !== username
                    ),
                };
            })
        );
    }

    function handleDelete() {
        setOrganizations(current =>
            current.filter(
                organization => organization.id !== organizationToDelete.id
            )
        );
        setOrganizationToDelete(null);
    }

  return (
    <main className="container py-5">
        <section className="mb-4">
            <h1 className="display-6 fw-bold mb-1">Account</h1>
            <p className="lead mb-0">Welcome, {username}!</p>
        </section>

        <section
            className="card shadow-sm mb-4"
            aria-labelledby="announcements-title"
        >
            <div className="card-header bg-transparent">
                <h2 id="announcements-title" className="h4 mb-0">
                    Your Organizations
                </h2>
            </div>

            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle mb-0">
                        <caption className="visually-hidden">
                            Organizations you are a member of
                        </caption>

                        <thead className="table-light">
                            <tr>
                                <th scope="col">Organization</th>
                                <th scope="col">Role</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {userOrganizations.length === 0 ? (
                                <tr>
                                    <td colSpan={3}>No organizations.</td>
                                </tr>
                            ) : (
                                userOrganizations.map(({ organization, role }) => (
                                    <tr key={organization.id}>
                                        <td>{organization.name}</td>
                                        <td>{role}</td>
                                        <td>
                                            {role === 'admin' ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() =>
                                                        setOrganizationToDelete(organization)
                                                    }
                                                >
                                                    Delete Organization
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() =>
                                                        handleLeave(organization.id)
                                                    }
                                                >
                                                    Leave
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        {organizationToDelete && (
            <>
                <div className="modal-backdrop fade show" />
                <div
                    className="modal fade show"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-organization-title"
                    style={{ display: 'block' }}
                    tabIndex="-1"
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2
                                    id="delete-organization-title"
                                    className="modal-title fs-5"
                                >
                                    Delete Organization
                                </h2>
                            </div>
                            <div className="modal-body">
                                Are you sure you want to delete this organization?
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setOrganizationToDelete(null)}
                                >
                                    No
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                >
                                    Yes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )}
    </main>
  );
}