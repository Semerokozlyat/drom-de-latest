import SideNav from 'app/ui/dashboard/sidenav';
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row md:overflow-hidden h-screen">
            <div className="w-full flex-none md:w-64">
                <SideNav />
            </div>
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
                {children}  {/* All underlying page.tsx files will be rendered here */}
            </div>
        </div>
    );
}