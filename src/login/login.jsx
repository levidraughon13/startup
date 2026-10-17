import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Login({ onLogin }) {
	const [name, setName] = React.useState('');
	const [password, setPassword] = React.useState('');
	const navigate = useNavigate();

	function handleLogin(event) {
		event.preventDefault();
		// Handle login logic here
		localStorage.setItem('username', name);
		localStorage.setItem('password', password);
		onLogin(name);
		navigate('/account');
	}

	function handleRegister(event) {
		event.preventDefault();
		localStorage.setItem('username', name);
		localStorage.setItem('password', password);
		onLogin(name);
		navigate('/account');
	}
	function loginTextChange(event) {
		setName(event.target.value);
	}

	function passwordTextChange(event) {
		setPassword(event.target.value);
	}


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
								<label htmlFor="username" className="form-label">
									Username
								</label>
								<input
									type="text"
									id="username"
									name="username"
									className="form-control"
									placeholder="Username"
									onChange={loginTextChange}
								/>
							</div>

							<div className="mb-3">
								<label htmlFor="password" className="form-label">
									Password
								</label>
								<input
									type="password"
									id="password"
									name="password"
									className="form-control"
									placeholder="Password"
									onChange={passwordTextChange}
								/>
							</div>

							<div className="account-buttons">
								<button onClick={handleLogin} type="submit" className="btn btn-primary w-100">
									Log In
								</button>
								<button onClick={handleRegister} type="submit" className="btn btn-primary w-100">
									Register
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