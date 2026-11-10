import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  deleteOrganization,
  getMyOrganizations,
  leaveOrganization,
} from '../api';

export function Account({ userName }) {
  const [organizations, setOrganizations] = React.useState([]);
  const [organizationToDelete, setOrganizationToDelete] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [busyOrganizationId, setBusyOrganizationId] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    let isActive = true;

    getMyOrganizations()
      .then(items => {
        if (isActive) {
          setOrganizations(items);
        }
      })
      .catch(error => {
        console.error('Error loading your organizations:', error);
        if (isActive) {
          setErrorMessage(error.message || 'Unable to load your organizations.');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleLeave(organizationId) {
    setErrorMessage('');
    setBusyOrganizationId(organizationId);
    try {
      await leaveOrganization(organizationId);
      setOrganizations(current =>
        current.filter(organization => organization.id !== organizationId)
      );
    } catch (error) {
      console.error('Error leaving organization:', error);
      setErrorMessage(error.message || 'Unable to leave organization.');
    } finally {
      setBusyOrganizationId(null);
    }
  }

  async function handleDelete() {
    const organizationId = organizationToDelete.id;
    setErrorMessage('');
    setBusyOrganizationId(organizationId);
    try {
      await deleteOrganization(organizationId);
      setOrganizations(current =>
        current.filter(organization => organization.id !== organizationId)
      );
      setOrganizationToDelete(null);
    } catch (error) {
      console.error('Error deleting organization:', error);
      setErrorMessage(error.message || 'Unable to delete organization.');
    } finally {
      setBusyOrganizationId(null);
    }
  }

  return (
    <main className="container py-5">
      <section className="mb-4">
        <h1 className="display-6 fw-bold mb-1">Account</h1>
        <p className="lead mb-0">Welcome, {userName}!</p>
      </section>
      {errorMessage && (
        <p className="text-danger" role="alert">{errorMessage}</p>
      )}

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
                {isLoading ? (
                  <tr>
                    <td colSpan={3}>Loading organizations...</td>
                  </tr>
                ) : errorMessage && organizations.length === 0 ? (
                  <tr>
                    <td colSpan={3}>Unable to load organizations.</td>
                  </tr>
                ) : organizations.length === 0 ? (
                  <tr>
                    <td colSpan={3}>No organizations.</td>
                  </tr>
                ) : (
                  organizations.map(organization => (
                    <tr key={organization.id}>
                      <td>{organization.name}</td>
                      <td>{organization.role}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm me-1"
                          onClick={() =>
                            navigate('/dashboard', {
                              state: {
                                organizationId: organization.id,
                              },
                            })
                          }
                        >
                          Dashboard
                        </button>
                        {organization.role === 'admin' ? (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            disabled={busyOrganizationId !== null}
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
                            disabled={busyOrganizationId !== null}
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
                    disabled={busyOrganizationId !== null}
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