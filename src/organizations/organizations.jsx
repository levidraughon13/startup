import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getOrganizationMembers,
  loadOrganizations,
} from './organizationUtils';

export function Organizations() {
  const [organizations, setOrganizations] = React.useState(loadOrganizations);
  const [search, setSearch] = React.useState('');
  const [name, setName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [authMessage, setAuthMessage] = React.useState('');
  const [membershipMessage, setMembershipMessage] = React.useState('');
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('username');

  React.useEffect(() => {
    localStorage.setItem('organizations', JSON.stringify(organizations));
  }, [organizations]);

  function handleAddOrganization(event) {
    event.preventDefault();

    const admin = localStorage.getItem('username');
    if (!admin) {
      setAuthMessage('You must be logged in to add an organization.');
      return;
    }

    const newOrganization = {
      id: crypto.randomUUID(),
      name: name.trim(),
      address: address.trim(),
      admin,
      members: [{ username: admin, role: 'admin' }],
      announcements: [],
      maintenanceRequests: [],
      feedbackReports: [],
    };

    setOrganizations(current => [...current, newOrganization]);
    setName('');
    setAddress('');
    setAuthMessage('');
  }

  function handleAddClick(event) {
    if (!localStorage.getItem('username')) {
      event.preventDefault();
      setAuthMessage('You must be logged in to add an organization.');
    }
  }

  function handleMembershipToggle(organizationId) {
    const username = localStorage.getItem('username');
    if (!username) {
      navigate('/login');
      return;
    }

    const organization = organizations.find(item => item.id === organizationId);
    if (!organization) {
      return;
    }

    const members = getOrganizationMembers(organization);
    const currentMember = members.find(member => member.username === username);
    if (currentMember?.role === 'admin') {
      setMembershipMessage('Admins cannot leave organizations.');
      return;
    }

    setMembershipMessage('');
    setOrganizations(current =>
      current.map(item => {
        if (item.id !== organizationId) {
          return item;
        }

        const currentMembers = getOrganizationMembers(item);
        const isMember = currentMembers.some(
          member => member.username === username
        );

        return {
          ...item,
          members: isMember
            ? currentMembers.filter(member => member.username !== username)
            : [...currentMembers, { username, role: 'viewer' }],
        };
      })
    );
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
                  {filteredOrganizations.length === 0 ? (
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
                            onClick={() =>
                              handleMembershipToggle(organization.id)
                            }
                          >
                            {currentUser &&
                            getOrganizationMembers(organization).some(
                              member => member.username === currentUser
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