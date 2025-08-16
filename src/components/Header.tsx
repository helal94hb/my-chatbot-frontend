import React from 'react';
import type { FC } from 'react'; 
import TransactLogo from "./assets/Transact_logo.png"
interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void; // Add this prop
  onLogout: () => void;
}

const Header: FC<HeaderProps> = ({ isSidebarOpen, toggleSidebar, onLogout }) => {
  return (
    
    <header 
      // UPDATED: Added "justify-between" to push items to opposite ends
      className="h-16 bg-[#0a2647] flex items-center justify-between px-6 shadow-md flex-shrink-0"
    >
      {/* Company Logo (stays on the left) */}
      <div className="flex items-center gap-4">
          {/* --- ADD THE TOGGLE BUTTON HERE --- */}
        <button 
          onClick={toggleSidebar} 
          className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>
      <img
        src={TransactLogo}
        alt="Company Logo"
        className="h-8 object-contain"
      />
      </div>

      {/* --- NEW: Account Circle Placeholder (on the right) --- */}
      <div className="flex items-center gap-2">
      <button 
        className="w-9 h-9 bg-brandBlue hover:bg-blue-600 transition-colors duration-200 rounded-full flex items-center justify-center text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brandBlue"
        title="Account Settings" // Tooltip for accessibility
        onClick={() => { /* Add account logic here in the future */ }}
      >
        {/* Placeholder: You can replace this with user initials or an icon */}
        <span>H</span> 
      </button>
              <button
          onClick={onLogout} // Call the passed-in function
          title="Sign Out"
          className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
        </div>
    </header>
  );
};

export default Header;