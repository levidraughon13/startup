import React from 'react';

export function Dashboard() {
  return (
    <main className="container py-5">
		<section className="mb-4">
			<h1 className="display-6 fw-bold mb-1">Dashboard</h1>
			<p className="lead mb-0">[Organization name]</p>
		</section>

		<section
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
								<th scope="col">Actions</th>
							</tr>
						</thead>

						<tbody>
							<tr>
								<td colspan="3">
									No announcements.
								</td>
								<td>
									<button
										type="button"
										className="btn btn-outline-danger btn-sm"
										disabled
										aria-label="Delete announcement"
									>
										Delete
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</section>

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
								<th scope="col">Status</th>
								<th scope="col">Date</th>
								<th scope="col">Actions</th>
							</tr>
						</thead>

						<tbody>
							<tr>
								<td colspan="3">
									No maintenance issues.
								</td>
								<td>
									<button
										type="button"
										className="btn btn-outline-danger btn-sm"
										disabled
										aria-label="Delete maintenance issue"
									>
										Delete
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</section>
	</main>
  );
}