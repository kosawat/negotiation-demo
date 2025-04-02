import Link from "next/link";
import React from "react";

const NavBar = () => {
  return (
    /* Navigation Bar */
    <nav className="bg-white shadow-md py-4">
      <div className="container flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          Negotiation Shop
        </Link>
        <Link
          href="/"
          className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
        >
          Home
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
