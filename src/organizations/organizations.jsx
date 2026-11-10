import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createOrganization,
  joinOrganization,
  leaveOrganization,
  loadOrganizationDirectory,
} from './organizationUtils';

export function Organizations({ userName, authLoading }) {
  const [organizations, setOrganizations] = React.useState([]);
  const [memberships, setMemberships] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMembershipUpdating, setIsMembershipUpdating] = React.useState(false);
  const [loadError, setLoadError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [name, setName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [authMessage, setAuthMessage] = React.useState('');
  const [membershipMessage, setMembershipMessage] = React.useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    let isActive = true;

    if (authLoading) {
      return () => {
        isActive = false;
      };
    }

    setIsLoading(true);
    setLoadError('');
    async function loadDirectory() {
      try {
        const data = await loadOrganizationDirectory(userName);
        if (!isActive) {
          return;
        }

        const membershipById = new Map(
          data.memberships.map(membership => [membership.id, membership])
        );
        setOrganizations(
          data.organizations.map(organization => {
            const membership = membershipById.get(organization.id);
            return {
              ...organization,
              members:
                membership && userName
                  ? [{ username: userName, role: membership.role }]
                  : [],
            };
          })
        );
        setMemberships(data.memberships);
      } catch (error) {
        console.error('Error loading organizations:', error);
        if (isActive) {
          setLoadError(error.message || 'Unable to load organizations.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadDirectory();
    return () => {
      isActive = false;
    };
  }, [userName, authLoading]);

  async function handleAddOrganization(event) {
    event.preventDefault();

    if (!userName) {
      setAuthMessage('You must be logged in to add an organization.');
      return;
    }

    setAuthMessage('');
    try {
      const organization = await createOrganization(name.trim(), address.trim());
      setOrganizations(current => [
        ...current,
        { ...organization, members: [{ username: userName, role: 'admin' }] },
      ]);
      setMemberships(current => [
        ...current,
        { ...organization, role: 'admin' },
      ]);
      setName('');
      setAddress('');
    } catch (error) {
      console.error('Error adding organization:', error);
      setAuthMessage(error.message || 'Unable to add organization.');
    }
  }

  function handleAddClick(event) {
    if (!userName) {
      event.preventDefault();
      setAuthMessage('You must be logged in to add an organization.');
    }
  }

  async function handleMembershipToggle(organizationId) {
    if (!userName) {
      navigate('/login');
      return;
    }

    const organization = organizations.find(item => item.id === organizationId);
    if (!organization) {
      return;
    }

    const membership = memberships.find(item => item.id === organizationId);
    if (membership?.role === 'admin') {
      setMembershipMessage('Admins cannot leave organizations.');
      return;
    }

    setMembershipMessage('');
    setIsMembershipUpdating(true);
    try {
      let updatedMemberships;
      if (membership) {
        await leaveOrganization(organizationId);
        updatedMemberships = memberships.filter(
          item => item.id !== organizationId
        );
      } else {
        const member = await joinOrganization(organizationId);
        updatedMemberships = [
          ...memberships,
          { ...organization, role: member.role },
        ];
      }

      setMemberships(updatedMemberships);
      setOrganizations(current =>
        current.map(item => {
          if (item.id !== organizationId) {
            return item;
          }

          const members = (item.members || []).filter(
            member => member.username !== userName
          );
          const updatedMembership = updatedMemberships.find(
            entry => entry.id === organizationId
          );
          if (updatedMembership) {
            members.push({
              username: userName,
              role: updatedMembership.role,
            });
          }
          return { ...item, members };
        })
      );
    } catch (error) {
      console.error('Error updating organization membership:', error);
      setMembershipMessage(error.message || 'Unable to update membership.');
    } finally {
      setIsMembershipUpdating(false);
    }
  }

  const filteredOrganizations = organizations.filter(organization =>
    `${organization.name} ${organization.address}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  return (
    <main className="container py-5">
      <section className="text-center mb-5">
        <h1 className="display-5 fw-bold">Organizations</h1>
        <p className="lead">
          Find and connect with your workplace or favorite business.
        </p>
      </section>

      <section aria-labelledby="add-organization-heading" className="mb-5">
        <h2 id="add-organization-heading" className="h4">
          Add an Organization
        </h2>

        <form className="row g-3" onSubmit={handleAddOrganization}>
          <div className="col-12 col-md-5">
            <label htmlFor="new-organization-name" className="visually-hidden">
              Organization name
            </label>
            <input
              type="text"
              id="new-organization-name"
              name="organizationName"
              className="form-control"
              placeholder="Organization Name"
              value={name}
              onChange={event => setName(event.target.value)}
              required
            />
          </div>

          <div className="col-12 col-md-5">
            <label
              htmlFor="new-organization-address"
              className="visually-hidden"
            >
              Organization address
            </label>
            <input
              type="text"
              id="new-organization-address"
              name="organizationAddress"
              className="form-control"
              placeholder="Organization Address"
              value={address}
              onChange={event => setAddress(event.target.value)}
              required
            />
          </div>

          <div className="col-12 col-md-2 d-flex align-items-end">
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isLoading || authLoading}
              onClick={handleAddClick}
            >
              Add
            </button>
          </div>
        </form>
        {authMessage && (
          <p className="small text-danger mt-2 mb-0" role="alert">
            {authMessage}
          </p>
        )}
      </section>

      <section aria-labelledby="organization-search-heading" className="mb-4">
        <h2 id="organization-search-heading" className="visually-hidden">
          Search organizations
        </h2>

        <form
          className="row g-3"
          onSubmit={event => event.preventDefault()}
        >
          <div className="col-12 col-md-8">
            <input
              type="search"
              id="organization-search"
              name="organization-search"
              className="form-control"
              placeholder="Search organizations"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>

          <div className="col-12 col-md-4 d-flex align-items-end">
            <button type="submit" className="btn btn-primary w-100">
              Search
            </button>
          </div>
        </form>
      </section>
      <section aria-labelledby="organization-list-heading">
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">Organization Name</th>
                    <th scope="col">Address</th>
                    <th scope="col">Location</th>
                    <th scope="col">Membership</th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4}>Loading organizations...</td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={4} className="text-danger">
                        {loadError}
                      </td>
                    </tr>
                  ) : filteredOrganizations.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        {organizations.length === 0
                          ? 'No organizations have been added.'
                          : 'No organizations match your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredOrganizations.map(organization => (
                      <tr key={organization.id}>
                        <td>{organization.name}</td>
                        <td>{organization.address}</td>
                        <td>
                          <a
                            className="btn btn-primary btn-sm"
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              organization.address
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View location
                          </a>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm me-1"
                            onClick={() =>
                              navigate('/dashboard', {
                                state: { organizationId: organization.id },
                              })
                            }
                          >
                            Dashboard
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled={
                              isMembershipUpdating || authLoading
                            }
                            onClick={() =>
                              handleMembershipToggle(organization.id)
                            }
                          >
                            {userName &&
                            memberships.some(
                              membership => membership.id === organization.id
                            )
                              ? 'Leave'
                              : 'Join'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {membershipMessage && (
          <p className="small text-danger mt-2 mb-0" role="alert">
            {membershipMessage}
          </p>
        )}
      </section>
    </main>
  );
}