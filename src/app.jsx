import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Organizations } from './organizations/organizations';
import { Report } from './report/report';
import { Account } from './account/account';
import { getCurrentUser, logoutUser } from './api';

export default function App() {
  const [userName, setUsername] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [authError, setAuthError] = React.useState('');

  React.useEffect(() => {
    let isActive = true;

    getCurrentUser()
      .then(user => {
        if (isActive) {
          setUsername(user.username);
        }
      })
      .catch(error => {
        if (isActive && error.status !== 401) {
          console.error('Error checking the current session:', error);
          setAuthError('Unable to verify your sign-in status.');
        }
      })
      .finally(() => {
        if (isActive) {
          setAuthLoading(false);
          localStorage.removeItem('username');
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  function handleLogin(username) {
    setUsername(username);
    setAuthError('');
  }

  async function logout() {
    setAuthError('');
    try {
      await logoutUser();
      localStorage.removeItem('username');
      setUsername(null);
    } catch (error) {
      console.error('Error logging out:', error);
      setAuthError(error.message || 'Unable to log out. Please try again.');
    }
  }

  return (
    <BrowserRouter>
      <div className="body">
        <header className="site-header">
          <NavLink className="site-brand" to="/" aria-label="CrewComms home">
            <img
              className="site-logo"
              src="CrewCommsLogo.png"
              alt="CrewComms"
            />
          </NavLink>
          <nav className="site-nav" aria-label="Main navigation">
            <NavLink className="nav-link" to="organizations">
              Organizations
            </NavLink>
            {!authLoading && userName && (
              <NavLink className="nav-link" to="account">
                Account
              </NavLink>
            )}
            {!authLoading && userName && (
              <NavLink
                to="/login"
                onClick={event => {
                  event.preventDefault();
                  logout();
                }}
                className="nav-link"
              >
                Logout
              </NavLink>
            )}
            {!authLoading && !userName && (
              <NavLink className="nav-link" to="/login">
                Login
              </NavLink>
            )}
            {authLoading && <span className="nav-link">Checking session...</span>}
          </nav>
        </header>

        {authError && (
          <div className="container mt-3">
            <p className="text-danger" role="alert">{authError}</p>
          </div>
        )}

        <Routes>
          <Route
            path="/organizations"
            element={
              <Organizations userName={userName} authLoading={authLoading} />
            }
          />
          <Route path="/report" element={<Report />} />
          <Route
            path="/dashboard"
            element={
              authLoading ? (
                <Loading />
              ) : userName ? (
                <Dashboard userName={userName} />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/login"
            element={
              authLoading ? <Loading /> : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/account"
            element={
              authLoading ? (
                <Loading />
              ) : userName ? (
                <Account userName={userName} />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          {authLoading ? (
            <Route path="/" element={<Loading />} />
          ) : userName ? (
            <Route path="/" element={<Account userName={userName} />} />
          ) : (
            <Route path="/" element={<Login onLogin={handleLogin} />} />
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer className="site-footer">
          <p>&copy; 2026 CrewComms</p>
          <p>
            Levi Draughon{' '}
            <a href="https://github.com/levidraughon13/startup/tree/main">
              GitHub
            </a>
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function Loading() {
  return (
    <main className="container py-5" role="status">
      Loading...
    </main>
  );
}

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center">
      404: Return to sender. Address unknown.
    </main>
  );
}
