import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Login({ onLogin }) {
  const [userName, setUserName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [displayError, setDisplayError] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    await loginOrRegister('/api/auth/login');
  }

  async function handleRegister() {
    await loginOrRegister('/api/auth/register');
  }

  async function loginOrRegister(endpoint) {
    setDisplayError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ username: userName, password }),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      });

      if (!res.ok) {
        const body = await res.json();
        setDisplayError(body.msg || `Request failed (${res.status})`);
        return;
      }

      localStorage.setItem('username', userName);
      onLogin(userName);
      navigate('/account');
    } catch (error) {
      console.error('Login or registration request failed:', error);
      setDisplayError('Unable to connect. Please try again.');
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

              <form onSubmit={handleLogin}>
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
                    disabled={isSubmitting || !userName.trim() || !password}
                    className="btn btn-primary w-100"
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={handleRegister}
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