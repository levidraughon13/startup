import React from 'react';

export function Report() {
  return (
    <main className="container py-5">
		<section className="text-center mb-5">
			<h1 className="display-5 fw-bold">Report an Issue</h1>
			<p className="lead">
				Help this organization stay informed by reporting an issue.
			</p>
		</section>

		<section className="row justify-content-center">
			<div className="col-12 col-md-9 col-lg-7">
				<div className="card shadow-sm">
					<div className="card-body p-4 p-md-5">
						<h2 className="card-title text-center mb-4">
							Issue Details
						</h2>

						<form action="#" method="post" className="row g-3">
							<div className="col-12 col-md-6">
								<label for="name" className="form-label">
									Name <span className="text-muted">(optional)</span>
								</label>
								<input
									type="text"
									id="name"
									name="name"
									className="form-control"
								/>
							</div>

							<div className="col-12 col-md-6">
								<label for="contact" className="form-label">
									Contact Info
									<span className="text-muted">(optional)</span>
								</label>
								<input
									type="text"
									id="contact"
									name="contact"
									className="form-control"
									placeholder="Phone or email"
								/>
							</div>

							<div className="col-12">
								<label for="report-type" className="form-label">
									Report Type
								</label>
								<select
									id="report-type"
									name="report-type"
									className="form-select"
									required
								>
									<option value="">Select a report type</option>
									<option value="maintenance">
										Maintenance Report
									</option>
									<option value="complaint">
										Complaint
									</option>
								</select>
							</div>

							<fieldset className="col-12">
								<legend className="form-label fs-6">
									Reporter Type
								</legend>

								<div className="d-flex flex-wrap gap-3">
									<div className="form-check">
										<input
											className="form-check-input"
											type="radio"
											id="employee"
											name="reporter-type"
											value="employee"
											required
										/>
										<label
											className="form-check-label"
											for="employee"
										>
											Employee
										</label>
									</div>

									<div className="form-check">
										<input
											className="form-check-input"
											type="radio"
											id="customer"
											name="reporter-type"
											value="customer"
										/>
										<label
											className="form-check-label"
											for="customer"
										>
											Customer
										</label>
									</div>
								</div>
							</fieldset>

							<div className="col-12">
								<label for="description" className="form-label">
									Describe the issue
								</label>
								<textarea
									id="description"
									name="description"
									className="form-control"
									rows="6"
									required
								></textarea>
							</div>

							<div className="col-12">
								<button
									type="submit"
									className="btn btn-primary w-100"
								>
									Submit Report
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</section>
	</main>
  );
}