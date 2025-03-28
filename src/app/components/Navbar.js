"use client";
import React from 'react';
import Link from 'next/link'
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  return (
// Then in your JSX:
    <header className="w-full bg-gray-900 py-6 top-0 sticky shadow-sm z-50">
      <nav className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-emerald-400">BioSegment</Link>
        </div>
        <div className="hidden md:flex space-x-8">
          <Link 
            href="/mito-detect" 
            className={`${pathname === "/mito-detect" ? "text-emerald-400" : "text-gray-300 hover:text-emerald-400"} transition`}
          >
            Mito-Detect
          </Link>
          <Link 
            href="/analysis" 
            className={`${pathname === "/analysis" ? "text-emerald-400" : "text-gray-300 hover:text-emerald-400"} transition`}
          >
            SAM Mito Analysis
          </Link>
          <Link 
            href="/cristae-detect" 
            className={`${pathname === "/cristae-detect" ? "text-emerald-400" : "text-gray-300 hover:text-emerald-400"} transition`}
          >
            Cristae-Detect
          </Link>
        </div>
        <div className="w-[120px]"></div> {/* Spacer div */}
      </nav>
    </header>
  );
}

export default Navbar;