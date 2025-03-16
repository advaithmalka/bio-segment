import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4">BioSegment</h3>
            <p className="text-gray-400">
              Advanced AI solutions for biological image analysis.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-emerald-400 transition">Features</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition">Models</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-emerald-400 transition">Documentation</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition">API Reference</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition">Examples</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-emerald-400 transition">About</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition">Blog</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
          <p>© 2025 BioSegment. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;