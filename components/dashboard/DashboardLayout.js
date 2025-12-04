'use client';
import { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

export default function DashboardLayout({ children, user, profile, cvCount = 0 }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dashboard-wrapper">
            <DashboardSidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)}
                cvCount={cvCount}
            />
            
            <DashboardHeader 
                user={user}
                profile={profile}
                onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
            />
            
            <main className="dashboard-main">
                <div className="dashboard-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
