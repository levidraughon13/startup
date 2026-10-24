import React from 'react';
import { useLocation } from 'react-router-dom';

export function Report() {
  const location = useLocation();
  const organizationId = location.state?.organizationId;
  const [submissionMessage, setSubmissionMessage] = React.useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (!organizationId) {
      setSubmissionMessage('Unable to submit report: no organization was selected.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const report = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      name: formData.get('name'),
      contact: formData.get('contact'),
      reportType: formData.get('report-type'),
      reporterType: formData.get('reporter-type'),
      description: formData.get('description'),
    };

    try {
      const organizations = JSON.parse(
        localStorage.getItem('organizations') || '[]'
      );
      if (!Array.isArray(organizations)) {
        throw new Error('Saved organizations data is invalid.');
      }

      const organizationIndex = organizations.findIndex(
        organization => organization.id === organizationId
      );
      if (organizationIndex === -1) {
        setSubmissionMessage('Unable to submit report: organization not found.');
        return;
      }

      const organization = organizations[organizationIndex];
      const feedbackReports = Array.isArray(organization.feedbackReports)
        ? organization.feedbackReports
        : [];
      organizations[organizationIndex] = {
        ...organization,
        feedbackReports: [...feedbackReports, report],
      };
      localStorage.setItem('organizations', JSON.stringify(organizations));
      event.currentTarget.reset();
      setSubmissionMessage('Report submitted successfully.');
    } catch (error) {
      setSubmissionMessage(`Unable to submit report: ${error.message}`);
    }
  }

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

						<form action="#" method="post" className="row g-3" onSubmit={handleSubmit}>
							<div className="col-12 col-md-6">
								<label htmlFor="name" className="form-label">
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
								<label htmlFor="contact" className="form-label">
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
								<label htmlFor="report-type" className="form-label">
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
											htmlFor="employee"
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
											htmlFor="customer"
										>
											Customer
										</label>
									</div>
								</div>
							</fieldset>

							<div className="col-12">
								<label htmlFor="description" className="form-label">
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
						{submissionMessage && (
							<p className="small mt-3 mb-0" role="status">
								{submissionMessage}
							</p>
						)}
					</div>
				</div>
			</div>
		</section>
	</main>
  );
}