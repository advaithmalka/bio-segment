import React from 'react';

const Navbar = () => {
  return (
    <header className="w-full bg-gray-900 py-6 top-0 sticky shadow-sm z-50">
    <nav className="container mx-auto px-4 flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-2xl font-bold text-emerald-400">BioSegment</span>
      </div>
      <div className="hidden md:flex space-x-8">
        <a href="#features" className="text-gray-300 hover:text-emerald-400 transition">Features</a>
        <a href="#models" className="text-gray-300 hover:text-emerald-400 transition">Models</a>
        <a href="#docs" className="text-gray-300 hover:text-emerald-400 transition">Documentation</a>
        <a href="#about" className="text-gray-300 hover:text-emerald-400 transition">About</a>
      </div>
      <div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition">
          Get Started
        </button>
      </div>
    </nav>
  </header>
  );
}

export default Navbar;