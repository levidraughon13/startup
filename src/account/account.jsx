import React from 'react';

export function Account() {
    const [username, setUsername] = React.useState(localStorage.getItem('username') || null);
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
                            <tr>
                                <td colspan="2">
                                    No organizations.
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        disabled
                                        aria-label="Leave organization"
                                    >
                                        Leave
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