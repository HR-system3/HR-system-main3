'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getUserFromToken, isManager } from '@/lib/utils/auth';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const userData = getUserFromToken();
    if (userData) {
      setUser({ name: userData.name, role: userData.role });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if API call fails
      router.push('/login');
    }
  };

  // Don't show navbar on login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  const isManagerUser = isManager();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                HR System
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {isManagerUser ? (
                <>
                  <Link
                    href="/manager/attendance"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === '/manager/attendance'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Team Attendance
                  </Link>
                  <Link
                    href="/manager/approvals"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === '/manager/approvals'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Approvals
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/attendance"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === '/attendance'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Attendance
                  </Link>
                  <Link
                    href="/attendance/history"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === '/attendance/history'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    History
                  </Link>
                  <Link
                    href="/attendance/correction"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === '/attendance/correction'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Corrections
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user?.name} ({user?.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {showMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {showMenu && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {isManagerUser ? (
              <>
                <Link
                  href="/manager/attendance"
                  className="block pl-3 pr-4 py-2 border-l-4 border-blue-500 text-base font-medium text-gray-900 bg-blue-50"
                >
                  Team Attendance
                </Link>
                <Link
                  href="/manager/approvals"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  Approvals
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/attendance"
                  className="block pl-3 pr-4 py-2 border-l-4 border-blue-500 text-base font-medium text-gray-900 bg-blue-50"
                >
                  Attendance
                </Link>
                <Link
                  href="/attendance/history"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  History
                </Link>
                <Link
                  href="/attendance/correction"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  Corrections
                </Link>
              </>
            )}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-4 text-sm text-gray-700">
                {user?.name} ({user?.role})
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 block w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

