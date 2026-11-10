import React from 'react';
import { useLocation } from 'react-router-dom';
import { addFeedbackReport } from '../api';

export function Report() {
  const location = useLocation();
  const organizationId = location.state?.organizationId;
  const [submissionMessage, setSubmissionMessage] = React.useState('');
  const [submissionError, setSubmissionError] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!organizationId) {
      setSubmissionError(true);
      setSubmissionMessage('Unable to submit report: no organization was selected.');
      return;
    }

    const form = event.currentTarget;
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

    setIsSubmitting(true);
    setSubmissionError(false);
    setSubmissionMessage('');
    try {
      await addFeedbackReport(organizationId, report);
      form.reset();
      setSubmissionMessage('Report submitted successfully.');
    } catch (error) {
      console.error('Error submitting feedback report:', error);
      setSubmissionError(true);
      setSubmissionMessage(error.message || 'Unable to submit report.');
    } finally {
      setIsSubmitting(false);
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
              {submissionMessage && (
                <p
                  className={`small mt-3 mb-0 ${submissionError ? 'text-danger' : 'text-success'}`}
                  role={submissionError ? 'alert' : 'status'}
                >
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