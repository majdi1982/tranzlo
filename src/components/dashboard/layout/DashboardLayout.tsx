import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from '../../layout/Navbar';
import Footer from '../../layout/Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col selection:bg-blue-500/30 transition-colors duration-300">
      {/* Unified Global Header with Dashboard Actions */}
      <Navbar />
      
      <div className="flex flex-1 pt-20">
        {/* Navigation Sidebar */}
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        
        {/* Dashboard Work Area & Footer */}
        <div className={`flex-1 flex flex-col min-h-[calc(100vh-80px)] transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-72'}`}>
          <main className="p-8 flex-1">
            {children}
          </main>
          
          {/* Global B2B footer placed inside dashboard layout */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
