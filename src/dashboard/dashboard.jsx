import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getOrganizationMembers } from '../organizations/organizationUtils';

function loadOrganizations() {
  try {
    const saved = JSON.parse(localStorage.getItem('organizations') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const organizationId = location.state?.organizationId;
  const [organizations, setOrganizations] = React.useState(loadOrganizations);
  const [entryType, setEntryType] = React.useState('announcement');
  const [entryTitle, setEntryTitle] = React.useState('');
  const [entryDate, setEntryDate] = React.useState('');
  const [entryDetails, setEntryDetails] = React.useState('');
  const [entryStatus, setEntryStatus] = React.useState('');
  const [memberToEdit, setMemberToEdit] = React.useState(null);
  const [memberRole, setMemberRole] = React.useState('');
  const [roleError, setRoleError] = React.useState('');
  const [itemToEdit, setItemToEdit] = React.useState(null);
  const organization = organizations.find(item => item.id === organizationId);

  React.useEffect(() => {
    localStorage.setItem('organizations', JSON.stringify(organizations));
  }, [organizations]);

  function deleteOrganizationItem(listName, itemIndex) {
    if (!isAdmin) {
      return;
    }

    setOrganizations(current =>
      current.map(item => {
        if (item.id !== organizationId) {
          return item;
        }

        const list = Array.isArray(item[listName]) ? item[listName] : [];
        return {
          ...item,
          [listName]: list.filter((_, index) => index !== itemIndex),
        };
      })
    );
  }

  function handleAddEntry(event) {
    event.preventDefault();

    const listName =
      entryType === 'announcement' ? 'announcements' : 'maintenanceRequests';
    const newEntry =
      entryType === 'announcement'
        ? {
            id: crypto.randomUUID(),
            title: entryTitle.trim(),
            date: entryDate,
            details: entryDetails.trim(),
          }
        : {
            id: crypto.randomUUID(),
            issue: entryTitle.trim(),
            date: entryDate,
            status: entryStatus.trim(),
          };

    setOrganizations(current =>
      current.map(item => {
        if (item.id !== organizationId) {
          return item;
        }

        const entries = Array.isArray(item[listName]) ? item[listName] : [];
        return { ...item, [listName]: [...entries, newEntry] };
      })
    );
    setEntryTitle('');
    setEntryDate('');
    setEntryDetails('');
    setEntryStatus('');
  }

  function handleSaveMemberRole(event) {
    event.preventDefault();
    if (!isAdmin) {
      return;
    }

    const targetMember = members.find(
      member => member.username === memberToEdit
    );
    const adminCount = members.filter(member => member.role === 'admin').length;
    if (
      targetMember?.role === 'admin' &&
      memberRole !== 'admin' &&
      adminCount === 1
    ) {
      setRoleError('The organization must have at least one admin.');
      return;
    }

    setOrganizations(current =>
      current.map(item =>
        item.id === organizationId
          ? {
              ...item,
              members: getOrganizationMembers(item).map(member =>
                member.username === memberToEdit
                  ? { ...member, role: memberRole }
                  : member
              ),
            }
          : item
      )
    );
    setMemberToEdit(null);
    setRoleError('');
  }

  function handleSaveEditedItem(event) {
    event.preventDefault();
    if (!isAdmin || !itemToEdit) {
      return;
    }

    setOrganizations(current =>
      current.map(item => {
        if (item.id !== organizationId) {
          return item;
        }

        const entries = Array.isArray(item[itemToEdit.listName])
          ? item[itemToEdit.listName]
          : [];
        return {
          ...item,
          [itemToEdit.listName]: entries.map((entry, index) =>
            index === itemToEdit.index
              ? itemToEdit.listName === 'announcements'
                ? {
                    ...entry,
                    title: itemToEdit.title.trim(),
                    date: itemToEdit.date,
                    details: itemToEdit.details.trim(),
                  }
                : {
                    ...entry,
                    issue: itemToEdit.title.trim(),
                    date: itemToEdit.date,
                    status: itemToEdit.status.trim(),
                  }
              : entry
          ),
        };
      })
    );
    setItemToEdit(null);
  }

  const announcements = Array.isArray(organization?.announcements)
    ? organization.announcements
    : [];
  const maintenanceRequests = Array.isArray(organization?.maintenanceRequests)
    ? organization.maintenanceRequests
    : [];
  const feedbackReports = Array.isArray(organization?.feedbackReports)
    ? organization.feedbackReports
    : [];
  const members = organization ? getOrganizationMembers(organization) : [];
  const currentUser = localStorage.getItem('username');
  const isAdmin = members.some(
    member => member.username === currentUser && member.role === 'admin'
  );
  const isEmployee = members.some(
    member => member.username === currentUser && (member.role === 'admin' || member.role === 'employee')
  );

  return (
    <main className="container py-5" data-organization-id={organizationId}>
		<section className="mb-4">
			<h1 className="display-6 fw-bold mb-1">Dashboard: {organization?.name || 'Organization not found'}</h1>
			<button
				type="button"
				className="btn btn-primary mt-3"
				onClick={() =>
					navigate('/report', { state: { organizationId } })
				}
			>
				Report an Issue
			</button>
			
		</section>
		<section className="mb-4">
			<p className="mb-0">
				<strong>Address:</strong> {organization?.address || 'N/A'}
			</p>
		</section>
		<section className="mb-4">
			<h2 className="h5 fw-bold mb-1">Your Role</h2>
			<p className="mb-0">
				{isAdmin
					? 'Admin'
					: isEmployee
					? 'Employee'
					: 'Viewer - You do not have permission to see workplace announcements or maintenance issues.'}
			</p>
		</section>

		{ isEmployee && (<section
			className="card shadow-sm mb-4"
			aria-labelledby="announcements-title"
		>
			<div className="card-header bg-transparent">
				<h2 id="announcements-title" className="h4 mb-0">
					Announcements
				</h2>
			</div>

			<div className="card-body p-0">
				<div className="table-responsive">
					<table className="table table-striped table-hover align-middle mb-0">
						<caption className="visually-hidden">
							Organization announcements
						</caption>

						<thead className="table-light">
							<tr>
								<th scope="col">Title</th>
								<th scope="col">Date</th>
								<th scope="col">Details</th>
								<th scope="col">Actions - Admin only</th>
							</tr>
						</thead>

						<tbody>
							{announcements.length === 0 ? (
								<tr>
									<td colSpan={4}>No announcements.</td>
								</tr>
							) : (
								announcements.map((announcement, index) => (
									<tr key={announcement.id || index}>
										<td>{announcement.title}</td>
										<td>{announcement.date}</td>
										<td>{announcement.details}</td>
										<td>
											{isAdmin && (
												<>
													<button
														type="button"
														className="btn btn-outline-primary btn-sm me-1"
														onClick={() =>
															setItemToEdit({
																listName: 'announcements',
																index,
																title: announcement.title || '',
																date: announcement.date || '',
																details: announcement.details || '',
															})
														}
														aria-label={`Edit announcement: ${announcement.title}`}
													>
														Edit
													</button>
													<button
														type="button"
														className="btn btn-outline-danger btn-sm"
														onClick={() =>
															deleteOrganizationItem('announcements', index)
														}
														aria-label={`Delete announcement: ${announcement.title}`}
													>
														Delete
													</button>
												</>
											)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</section>)}

		{isEmployee && (
			<section
				className="card shadow-sm"
				aria-labelledby="maintenance-title"
			>
				<div className="card-header bg-transparent">
					<h2 id="maintenance-title" className="h4 mb-0">
						Maintenance Issues
					</h2>
				</div>

				<div className="card-body p-0">
					<div className="table-responsive">
						<table className="table table-striped table-hover align-middle mb-0">
							<caption className="visually-hidden">
								Organization maintenance issues
							</caption>

							<thead className="table-light">
								<tr>
									<th scope="col">Issue</th>
									<th scope="col">Date</th>
									<th scope="col">Status</th>
									<th scope="col">Actions - Admin only</th>
								</tr>
							</thead>

							<tbody>
								{maintenanceRequests.length === 0 ? (
									<tr>
										<td colSpan={4}>No maintenance issues.</td>
									</tr>
								) : (
									maintenanceRequests.map((request, index) => (
										<tr key={request.id || index}>
											<td>{request.issue}</td>
											<td>{request.date}</td>
											<td>{request.status}</td>
											<td>
												{isAdmin && (
													<>
														<button
															type="button"
															className="btn btn-outline-primary btn-sm me-1"
															onClick={() =>
																setItemToEdit({
																	listName: 'maintenanceRequests',
																	index,
																	title: request.issue || '',
																	date: request.date || '',
																	status: request.status || '',
																})
															}
															aria-label={`Edit maintenance issue: ${request.issue}`}
														>
															Edit
														</button>
														<button
															type="button"
															className="btn btn-outline-danger btn-sm"
															onClick={() =>
																deleteOrganizationItem('maintenanceRequests', index)
															}
															aria-label={`Delete maintenance issue: ${request.issue}`}
														>
															Delete
														</button>
													</>
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
		)}

		{isAdmin && (
			<section
				className="card shadow-sm mt-4"
				aria-labelledby="feedback-reports-title"
			>
				<div className="card-header bg-transparent">
					<h2 id="feedback-reports-title" className="h4 mb-0">
						Feedback Reports
					</h2>
				</div>
				<div className="card-body p-0">
					<div className="table-responsive">
						<table className="table table-striped table-hover align-middle mb-0">
							<caption className="visually-hidden">
								Feedback reports submitted for this organization
							</caption>
							<thead className="table-light">
								<tr>
									<th scope="col">Date</th>
									<th scope="col">Name</th>
									<th scope="col">Contact</th>
									<th scope="col">Report Type</th>
									<th scope="col">Reporter Type</th>
									<th scope="col">Description</th>
									<th scope="col">Actions</th>
								</tr>
							</thead>
							<tbody>
								{feedbackReports.length === 0 ? (
									<tr>
										<td colSpan={7}>No feedback reports.</td>
									</tr>
								) : (
									feedbackReports.map((report, index) => (
										<tr key={report.id || index}>
											<td>
												{report.date
													? new Date(report.date).toLocaleDateString()
													: 'Not given'}
											</td>
											<td>{report.name || 'Not given'}</td>
											<td>{report.contact || 'Not given'}</td>
											<td>{report.reportType || 'Not given'}</td>
											<td>{report.reporterType || 'Not given'}</td>
											<td>{report.description || 'Not given'}</td>
											<td>
												<button
													type="button"
													className="btn btn-outline-danger btn-sm"
													onClick={() =>
														deleteOrganizationItem('feedbackReports', index)
													}
													aria-label={`Delete feedback report from ${report.name || 'unknown reporter'}`}
												>
													Delete
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</section>
		)}

		{isAdmin && (
			<section
				className="card shadow-sm mt-4"
				aria-labelledby="members-title"
			>
				<div className="card-header bg-transparent">
					<h2 id="members-title" className="h4 mb-0">
						Members
					</h2>
				</div>

				<div className="card-body p-0">
					<div className="table-responsive">
						<table className="table table-striped table-hover align-middle mb-0">
							<caption className="visually-hidden">
								Organization members and their roles
							</caption>

							<thead className="table-light">
								<tr>
									<th scope="col">Member</th>
									<th scope="col">Role</th>
									<th scope="col">Actions</th>
								</tr>
							</thead>

							<tbody>
								{members.length === 0 ? (
									<tr>
										<td colSpan={3}>No members.</td>
									</tr>
								) : (
									members.map((member, index) => (
										<tr key={member.username || index}>
											<td>{member.username}</td>
											<td>{member.role}</td>
											<td>
												<button
													type="button"
													className="btn btn-outline-primary btn-sm"
													onClick={() => {
														setMemberToEdit(member.username);
														setMemberRole(member.role);
														setRoleError('');
													}}
												>
													Change Role
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</section>
		)}

		{isAdmin && (
			<section
				className="card shadow-sm mt-4"
				aria-labelledby="add-entry-title"
			>
				<div className="card-header bg-transparent">
					<h2 id="add-entry-title" className="h4 mb-0">
						Add Announcement or Maintenance Issue
					</h2>
				</div>
				<div className="card-body">
					<form className="row g-3" onSubmit={handleAddEntry}>
						<div className="col-12">
							<label htmlFor="entry-type" className="form-label">
								What would you like to add?
							</label>
							<select
								id="entry-type"
								className="form-select"
								value={entryType}
								onChange={event => setEntryType(event.target.value)}
							>
								<option value="announcement">Announcement</option>
								<option value="maintenance">Maintenance</option>
							</select>
						</div>
						<div className="col-12 col-md-6">
							<label htmlFor="entry-title" className="form-label">
								{entryType === 'announcement' ? 'Title' : 'Issue'}
							</label>
							<input
								id="entry-title"
								type="text"
								className="form-control"
								value={entryTitle}
								onChange={event => setEntryTitle(event.target.value)}
								required
							/>
						</div>
						<div className="col-12 col-md-6">
							<label htmlFor="entry-date" className="form-label">
								Date
							</label>
							<input
								id="entry-date"
								type="date"
								className="form-control"
								value={entryDate}
								onChange={event => setEntryDate(event.target.value)}
								required
							/>
						</div>
						{entryType === 'announcement' ? (
							<div className="col-12">
								<label htmlFor="entry-details" className="form-label">
									Details
								</label>
								<textarea
									id="entry-details"
									className="form-control"
									value={entryDetails}
									onChange={event => setEntryDetails(event.target.value)}
									required
								/>
							</div>
						) : (
							<div className="col-12">
								<label htmlFor="entry-status" className="form-label">
									Status
								</label>
								<input
									id="entry-status"
									type="text"
									className="form-control"
									value={entryStatus}
									onChange={event => setEntryStatus(event.target.value)}
									required
								/>
							</div>
						)}
						<div className="col-12">
							<button type="submit" className="btn btn-primary">
								Add {entryType === 'announcement' ? 'Announcement' : 'Maintenance Issue'}
							</button>
						</div>
					</form>
				</div>
			</section>
		)}
		{isAdmin && (
			<>
				{memberToEdit && (
					<>
						<div className="modal-backdrop fade show" />
						<div
							className="modal fade show"
							role="dialog"
							aria-modal="true"
							aria-labelledby="change-member-role-title"
							style={{ display: 'block' }}
							tabIndex="-1"
						>
							<div className="modal-dialog modal-dialog-centered">
								<div className="modal-content">
									<form onSubmit={handleSaveMemberRole}>
										<div className="modal-header">
											<h2 id="change-member-role-title" className="modal-title fs-5">
												Change Role for {memberToEdit}
											</h2>
										</div>
										<div className="modal-body">
											<label htmlFor="member-role" className="form-label">
												Role
											</label>
											<select
												id="member-role"
												className="form-select"
												value={memberRole}
												onChange={event => setMemberRole(event.target.value)}
											>
												<option value="admin">Admin</option>
												<option value="employee">Employee</option>
												<option value="viewer">Viewer</option>
											</select>
											{roleError && (
												<p className="text-danger mt-2 mb-0" role="alert">
													{roleError}
												</p>
											)}
										</div>
										<div className="modal-footer">
											<button
												type="button"
												className="btn btn-secondary"
												onClick={() => setMemberToEdit(null)}
											>
												Cancel
											</button>
											<button type="submit" className="btn btn-primary">
												Save Role
											</button>
										</div>
									</form>
								</div>
							</div>
						</div>
					</>
				)}
				{itemToEdit && (
					<>
						<div className="modal-backdrop fade show" />
						<div
							className="modal fade show"
							role="dialog"
							aria-modal="true"
							aria-labelledby="edit-organization-item-title"
							style={{ display: 'block' }}
							tabIndex="-1"
						>
							<div className="modal-dialog modal-dialog-centered">
								<div className="modal-content">
									<form onSubmit={handleSaveEditedItem}>
										<div className="modal-header">
											<h2 id="edit-organization-item-title" className="modal-title fs-5">
												Edit {itemToEdit.listName === 'announcements' ? 'Announcement' : 'Maintenance Issue'}
											</h2>
										</div>
										<div className="modal-body">
											<label htmlFor="edit-entry-title" className="form-label">
												{itemToEdit.listName === 'announcements' ? 'Title' : 'Issue'}
											</label>
											<input
												id="edit-entry-title"
												type="text"
												className="form-control mb-3"
												value={itemToEdit.title}
												onChange={event =>
													setItemToEdit(current => ({
														...current,
														title: event.target.value,
													}))
												}
												required
											/>
											<label htmlFor="edit-entry-date" className="form-label">
												Date
											</label>
											<input
												id="edit-entry-date"
												type="date"
												className="form-control mb-3"
												value={itemToEdit.date}
												onChange={event =>
													setItemToEdit(current => ({
														...current,
														date: event.target.value,
													}))
												}
												required
											/>
											{itemToEdit.listName === 'announcements' ? (
												<>
													<label htmlFor="edit-entry-details" className="form-label">
														Details
													</label>
													<textarea
														id="edit-entry-details"
														className="form-control"
														value={itemToEdit.details}
														onChange={event =>
															setItemToEdit(current => ({
																...current,
																details: event.target.value,
															}))
														}
														required
													/>
												</>
											) : (
												<>
													<label htmlFor="edit-entry-status" className="form-label">
														Status
													</label>
													<input
														id="edit-entry-status"
														type="text"
														className="form-control"
														value={itemToEdit.status}
														onChange={event =>
															setItemToEdit(current => ({
																...current,
																status: event.target.value,
															}))
														}
														required
													/>
												</>
											)}
										</div>
										<div className="modal-footer">
											<button
												type="button"
												className="btn btn-secondary"
												onClick={() => setItemToEdit(null)}
											>
												Cancel
											</button>
											<button type="submit" className="btn btn-primary">
												Save Changes
											</button>
										</div>
									</form>
								</div>
							</div>
						</div>
					</>
				)}
			</>
		)}
	</main>
  );
}