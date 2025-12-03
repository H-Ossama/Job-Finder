'use client';
import { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children, user, profile }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dashboard-wrapper">
            <DashboardSidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
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

            {/* Floating Action Button */}
            <Link href="/cv-builder/create" className="fab" title="Create New CV">
                <Plus className="w-6 h-6" />
            </Link>
        </div>
    );
}
