import React from 'react';

export function Login() {
  return (
    <main className="container py-5">
		<section id="home" className="text-center py-5 mb-5">
			<h1 className="display-5 fw-bold">Welcome to CrewComms</h1>
			<p className="lead">
				The place to keep your team connected and informed.
			</p>
		</section>

		<section id="login" className="row justify-content-center">
			<div className="col-12 col-sm-10 col-md-7 col-lg-5">
				<div className="card shadow-sm">
					<div className="card-body p-4">
						<h2 className="card-title text-center mb-4">Login</h2>

						<form>
							<div className="mb-3">
								<label for="username" className="form-label">
									Username
								</label>
								<input
									type="text"
									id="username"
									name="username"
									className="form-control"
									placeholder="Username"
								/>
							</div>

							<div className="mb-3">
								<label for="password" className="form-label">
									Password
								</label>
								<input
									type="password"
									id="password"
									name="password"
									className="form-control"
									placeholder="Password"
								/>
							</div>

							<button type="submit" className="btn btn-primary w-100">
								Log In
							</button>
						</form>
					</div>
				</div>
			</div>
		</section>
	</main>
  );
}