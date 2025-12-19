import React from 'react';
import { 
  Dashboard as DashboardIcon, 
  PostAdd as PostAddIcon, 
  Work as WorkIcon, 
  People as PeopleIcon, 
  FlightTakeoff as FlightTakeoffIcon, 
  ExitToApp as ExitToAppIcon 
} from '@mui/icons-material';

export default function RecruitmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-xl hidden md:flex flex-col z-10">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">HR</div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            HR System
          </h2>
        </div>
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
             <SidebarItem href="/recruitment" label="Dashboard" icon={<DashboardIcon />} />
             <SidebarItem href="/recruitment/admin/jobs/new" label="Post a New Job" icon={<PostAddIcon />} />
             <SidebarItem href="/recruitment/jobs" label="Jobs" icon={<WorkIcon />} />
             <SidebarItem href="/recruitment/admin/applications" label="Application Tracker" icon={<PeopleIcon />} />
             <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Workflows</p>
             </div>
             {/* <SidebarItem href="/recruitment/admin/onboarding" label="Onboarding Checklist" icon={<FlightTakeoffIcon />} /> */}
             <SidebarItem href="/recruitment/admin/offboarding" label="Offboarding Checklist" icon={<ExitToAppIcon />} />
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">HR</div>
                <div>
                    <p className="text-xs font-semibold text-gray-700">HR Admin</p>
                </div>
            </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-100">
             <h1 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">✨</span> Recruitment Portal
             </h1>
             <div className="flex items-center space-x-4">
                <button className="text-sm text-gray-600 hover:text-blue-600 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full font-medium">
                    Need Help?
                </button>
             </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
    return (
        <li>
            <a href={href} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition-all group">
                <span className="text-xl group-hover:scale-110 transition-transform text-gray-400 group-hover:text-blue-600">
                    {icon}
                </span>
                <span className="font-medium">{label}</span>
            </a>
        </li>
    );
}
