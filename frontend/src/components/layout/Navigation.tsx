'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';
import { performanceFeatureAccess } from '@/lib/performanceRoles';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  permission?: string;
}

interface NavSection {
  section: string;
}

type NavItemType = NavItem | NavSection;

const allNavItems: NavItemType[] = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: '📊' },
  
  // Organization Structure Section
  { section: 'Organization Structure' },
  { name: 'Departments', href: ROUTES.DEPARTMENTS, icon: '🏢', permission: 'canViewDepartments' },
  { name: 'Positions', href: ROUTES.POSITIONS, icon: '💼', permission: 'canViewPositions' },
  { name: 'Change Requests', href: ROUTES.CHANGE_REQUESTS, icon: '📝', permission: 'canViewChangeRequests' },
  { name: 'Org Chart', href: ROUTES.ORG_CHART, icon: '🌳', permission: 'canViewOrgChart' },
  
  // Employee Profile Section
  { section: 'Employee Profile' },
  { name: 'Create Employee', href: '/employee-profile/new', icon: '➕', permission: 'canCreateEmployee' },
  { name: 'Search Employee', href: '/employee-profile/search-by-number', icon: '🔍', permission: 'canSearchEmployee' },
  { name: 'Employees Directory', href: '/employee-profile/employees', icon: '👥', permission: 'canViewAllEmployees' },
  { name: 'Profile Change Requests', href: '/employee-profile/change-requests', icon: '📋', permission: 'canViewChangeRequests' },
  { name: 'Process Requests', href: '/employee-profile/change-requests/process', icon: '✅', permission: 'canProcessChangeRequests' },
  { name: 'Self-Service Demo', href: '/employee-profile/self-demo', icon: '👨‍💼', permission: 'canViewSelfService' },
  { name: 'Manager Team Demo', href: '/employee-profile/manager-team-demo', icon: '👥', permission: 'canViewManagerTeam' },
  
  // Performance Management Section
  { section: 'Performance Management' },
  { name: 'Templates', href: ROUTES.PERFORMANCE_TEMPLATES, icon: '📋', permission: 'canViewTemplates' },
  { name: 'Cycles', href: ROUTES.PERFORMANCE_CYCLES, icon: '🔄', permission: 'canViewCycles' },
  { name: 'Assignments', href: ROUTES.PERFORMANCE_ASSIGNMENTS, icon: '📝', permission: 'canViewAssignments' },
  { name: 'Records', href: ROUTES.PERFORMANCE_RECORDS, icon: '📊', permission: 'canViewRecords' },
  { name: 'Disputes', href: ROUTES.PERFORMANCE_DISPUTES, icon: '⚖️', permission: 'canViewDisputes' },
  
  // Personal
  { section: 'Personal' },
  { name: 'My Team', href: ROUTES.MY_TEAM, icon: '👥', permission: 'canViewManagerTeam' },
  { name: 'Profile', href: ROUTES.PROFILE, icon: '👤' },

  // Time Management
  { section: 'Time Management' },
  { name: 'My Attendance', href: '/time-management/attendance', icon: '⏰' },
  { name: 'Attendance History', href: '/time-management/attendance/history', icon: '📅' },
  { name: 'Correction Requests', href: '/time-management/attendance/correction', icon: '✏️' },
  { name: 'Manager Attendance', href: '/time-management/manager/attendance', icon: '👔', permission: 'canViewManagerTeam' },
  { name: 'Approvals', href: '/time-management/manager/approvals', icon: '✅', permission: 'canViewManagerTeam' },
  
  // Payroll Configuration
  { section: 'Payroll Configuration' },
  { name: 'Company Settings', href: '/payroll-configuration/company-settings', icon: '⚙️' },
  { name: 'Pay Grades', href: '/payroll-configuration/paygrades', icon: '💰' },
  { name: 'Pay Types', href: '/payroll-configuration/pay-types', icon: '💵' },
  { name: 'Allowances', href: '/payroll-configuration/allowances', icon: '🎁' },
  { name: 'Signing Bonus', href: '/payroll-configuration/signing-bonus', icon: '🎉' },
  { name: 'Insurance', href: '/payroll-configuration/insurance', icon: '🛡️' },
  { name: 'Taxes', href: '/payroll-configuration/taxes', icon: '📊' },
  { name: 'Termination Benefits', href: '/payroll-configuration/termination-benefits', icon: '👋' },
  { name: 'Approvals', href: '/payroll-configuration/approvals', icon: '✅' },
  
  // System Admin
  { section: 'System Administration' },
  { name: 'Create Auth User', href: '/system-admin/users/create', icon: '🛠️', permission: 'canAssignRoles' },
  { name: 'User Management', href: '/users', icon: '👥', permission: 'canAssignRoles' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Filter nav items based on user role and permissions
  let navItems = allNavItems.filter((item) => {
    if ('section' in item) {
      return true; // Always show section headers initially
    }
    
    // If no permission required, show to all authenticated users
    if (!item.permission) {
      return true;
    }
    
    // Special handling for Performance Management items
    if (item.href.startsWith('/performance/')) {
      if (!user?.role) {
        return false;
      }
      
      // Use performance-specific role checks
      if (item.href === ROUTES.PERFORMANCE_TEMPLATES) {
        return performanceFeatureAccess.canViewTemplates(user.role);
      }
      if (item.href === ROUTES.PERFORMANCE_CYCLES) {
        return performanceFeatureAccess.canViewCycles(user.role);
      }
      if (item.href === ROUTES.PERFORMANCE_ASSIGNMENTS) {
        return performanceFeatureAccess.canViewAssignments(user.role);
      }
      if (item.href === ROUTES.PERFORMANCE_RECORDS) {
        return performanceFeatureAccess.canViewRecords(user.role);
      }
      if (item.href === ROUTES.PERFORMANCE_DISPUTES) {
        return performanceFeatureAccess.canViewDisputes(user.role);
      }
    }
    
    // Special handling for Payroll Configuration items
    if (item.href.startsWith('/payroll-configuration/')) {
      if (!user?.role) {
        return false;
      }
      // Show payroll pages to HR, Admin, Payroll roles
      const roleLower = user.role.toLowerCase();
      return (
        roleLower.includes('admin') ||
        roleLower.includes('hr') ||
        roleLower.includes('payroll') ||
        roleLower === 'system admin'
      );
    }
    
    // Check if user has the required permission for other items
    if (!user?.role) {
      return false;
    }
    
    return hasPermission(user.role, item.permission as any);
  });
  
  // Filter out empty sections (section headers with no items after them)
  navItems = navItems.filter((item, index, array) => {
    if ('section' in item) {
      // Check if there are any non-section items after this section header
      const hasItemsAfter = array.slice(index + 1).some(nextItem => !('section' in nextItem));
      return hasItemsAfter;
    }
    return true;
  });

  return (
    <nav className="h-full w-full p-4 overflow-y-auto" style={{ paddingTop: '60px' }}>
      <ul className="space-y-1">
        {navItems.map((item, index) => {
          if ('section' in item) {
            return (
              <li key={`section-${index}`} className="pt-4 pb-2 px-2">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {item.section}
                </p>
              </li>
            );
          }

          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm',
                  isActive
                    ? 'font-medium'
                    : ''
                )}
                style={{
                  color: isActive ? '#e5f0ff' : 'var(--text-muted)',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}