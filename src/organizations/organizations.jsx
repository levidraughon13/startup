import React from 'react';

export function Organizations() {
  return (
    <main className="container py-5">
		<section className="text-center mb-5">
			<h1 className="display-5 fw-bold">Organizations</h1>
			<p className="lead">
				Find and connect with your workplace or favorite business.
			</p>
		</section>

		<section
			aria-labelledby="organization-search-heading"
			className="mb-4"
		>


			<form className="row g-3">
				<div className="col-12 col-md-8">
					<label htmlFor="organization-search" className="form-label">
						Search Organizations
					</label>

					<input
						type="search"
						id="organization-search"
						name="organization-search"
						className="form-control"
						placeholder="Search organizations"
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
							<caption
								id="organization-list-heading"
								className="caption-top px-4 pt-3"
							>
								Registered organizations
							</caption>

							<thead>
								<tr>
									<th scope="col">Organization Name</th>
									<th scope="col">Address</th>
									<th scope="col">Directions</th>
								</tr>
							</thead>

							<tbody>
								<tr>
									<td>Example Organization</td>
									<td>123 Main Street</td>
									<td>
										<a
											className="btn btn-primary btn-sm"
											href="https://www.google.com/maps/dir/?api=1&destination=123%20Main%20Street"
											target="_blank"
											rel="noopener noreferrer"
										>
											Get directions
										</a>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</section>
	</main>
  );
}