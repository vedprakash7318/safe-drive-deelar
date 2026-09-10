import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      <Sidebar 
        mobileOpen={mobileOpen} 
        onCloseMobile={() => setMobileOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          onToggleSidebar={() => setMobileOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
