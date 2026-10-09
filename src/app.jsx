import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return (
  <div className="body bg-dark text-light">
    <header className="site-header">
		<a className="site-brand" href="index.html" aria-label="CrewComms home">
			<img className="site-logo" src="CrewCommsLogo.png" alt="CrewComms" />
		</a>
		<nav className="site-nav" aria-label="Main navigation">
			<a className="nav-link" href="organizations.html">Organizations</a>
			<a className="nav-link" href="dashboard.html">Dashboard (temp)</a>
			<a className="nav-link" href="report.html">Report an Issue (temp)</a>
			<a className="nav-link" href="index.html">Login</a>
		</nav>
	</header>

	<main>
		App components go here
	</main>

	<footer className="site-footer">
		<p>&copy; 2026 CrewComms</p>
		<p>Levi Draughon <a href="https://github.com/levidraughon13/startup/tree/main">GitHub</a></p>
	</footer>
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>  
  </div>
  );
}