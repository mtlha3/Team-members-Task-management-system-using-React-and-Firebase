
import React from 'react';
import { Link } from 'react-router-dom';

const Nav = () => {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/home"><h1 className="text-white text-2xl font-bold">Team Management System</h1></Link> 
        <div>
          <Link to="/adminlogin" className="text-white px-4 py-2 hover:bg-blue-700 rounded transition duration-300">
            Login
          </Link>
          <Link to="/signup" className="text-white px-4 py-2 hover:bg-blue-700 rounded transition duration-300">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
