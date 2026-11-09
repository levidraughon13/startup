import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Organizations } from './organizations/organizations';
import { Report } from './report/report';
import { Account } from './account/account';

export default function App() {
  const [userName, setUsername] = React.useState(
    localStorage.getItem('username') || null
  );

  function logout() {
    fetch('/api/auth/logout', {
      method: 'delete',
    })
      .catch(error => {
        console.error('Error logging out:', error);
      })
      .finally(() => {
        localStorage.removeItem('username');
        setUsername(null);
      });
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
            {/* <NavLink className="nav-link" to="dashboard">Dashboard</NavLink>
            <NavLink className="nav-link" to="report">Report an Issue</NavLink> */}
            {userName && (
              <NavLink className="nav-link" to="account">
                Account
              </NavLink>
            )}
            {userName && (
              <NavLink
                onClick={logout}
                className="nav-link"
                to="/login"
              >
                Logout
              </NavLink>
            )}
            {!userName && (
              <NavLink className="nav-link" to="/login">
                Login
              </NavLink>
            )}
          </nav>
        </header>

        <Routes>
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/report" element={<Report />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login onLogin={setUsername} />} />
          <Route path="/account" element={<Account />} />
          {userName ? (
            <Route path="/" element={<Account />} />
          ) : (
            <Route path="/" element={<Login onLogin={setUsername} />} />
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

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center">
      404: Return to sender. Address unknown.
    </main>
  );
}
