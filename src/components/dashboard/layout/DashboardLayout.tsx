import React from 'react';
import Sidebar from './Sidebar';
import Navbar from '../../layout/Navbar';
import Footer from '../../layout/Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col selection:bg-blue-500/30 transition-colors duration-300">
      {/* Unified Global Header with Dashboard Actions */}
      <Navbar />
      
      <div className="flex flex-1 pt-20">
        {/* Navigation Sidebar */}
        <Sidebar />
        
        {/* Dashboard Work Area & Footer */}
        <div className="flex-1 ml-72 flex flex-col min-h-[calc(100vh-80px)]">
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
