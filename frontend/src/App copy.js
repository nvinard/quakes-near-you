import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Data from './pages/Data';
import About from './pages/About';
import { FaBars } from 'react-icons/fa'; // For burger icon

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <Router>
      <div className="app-container">
        {/* Navbar */}
        <nav className="navbar navbar-dark navbar-custom">
          <div className="container-fluid">
            <button className="navbar-brand" style={{ all: 'unset', cursor: 'pointer' }}>
              Earthquakes Near Me
            </button>
            <button className="burger-menu" onClick={toggleMenu}>
              <FaBars />
            </button>
          </div>
          {isMenuOpen && (
            <div className="menu-container">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/data" onClick={() => setIsMenuOpen(false)}>Data</Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
            </div>
          )}
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/data" element={<Data />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
