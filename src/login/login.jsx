import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api';

export function Login({ onLogin }) {
  const [userName, setUserName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [displayError, setDisplayError] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    const action = event.nativeEvent.submitter?.value;
    await loginOrRegister(action === 'register' ? registerUser : loginUser);
  }

  async function loginOrRegister(authenticate) {
    setDisplayError(null);
    setIsSubmitting(true);

    try {
      const user = await authenticate(userName.trim(), password);
      onLogin(user.username);
      navigate('/account');
    } catch (error) {
      console.error('Login or registration request failed:', error);
      setDisplayError(error.message || 'Unable to connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function loginTextChange(event) {
    setUserName(event.target.value);
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

              <form onSubmit={handleSubmit}>
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
                    autoComplete="username"
                    required
                    value={userName}
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
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={passwordTextChange}
                  />
                </div>

                <div className="account-buttons">
                  <button
                    type="submit"
                    name="authAction"
                    value="login"
                    disabled={isSubmitting || !userName.trim() || !password}
                    className="btn btn-primary w-100"
                  >
                    Log In
                  </button>
                  <button
                    type="submit"
                    name="authAction"
                    value="register"
                    disabled={isSubmitting || !userName.trim() || !password}
                    className="btn btn-primary w-100"
                  >
                    Register
                  </button>
                </div>
              </form>

              {displayError && (
                <p className="small text-danger mt-2 mb-0" role="alert">
                  {displayError}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}