import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Data from './pages/Data';
import About from './pages/About';
import Locations from './pages/Locations';
import logo from './quakes_near_me.JPG';
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
          <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
            <span style={{ color: 'white' }}>Earthquakes Near Me</span>
           </Link>
            <button className="burger-menu" onClick={toggleMenu}>
              <FaBars />
            </button>
          </div>
          {isMenuOpen && (
            <div className="menu-container">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/data" onClick={() => setIsMenuOpen(false)}>Data</Link>
              <Link to="/locations" onClick={() => setIsMenuOpen(false)}>Locations</Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
            </div>
          )}
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/data" element={<Data />} />
          <Route path="/about" element={<About />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/locations/:location" element={<Locations />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
