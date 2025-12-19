'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import { departmentsService } from '@/services/api/departments.service';
import { positionsService } from '@/services/api/positions.service';
import { changeRequestsService } from '@/services/api/changeRequests.service';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    departments: 0,
    positions: 0,
    pendingRequests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [departments, positions, changeRequests] = await Promise.all([
        departmentsService.getAllDepartments(),
        positionsService.getAllPositions(),
        changeRequestsService.getAllChangeRequests(),
      ]);

      setStats({
        departments: departments.length,
        positions: positions.length,
        pendingRequests: changeRequests.filter((cr) => cr.status === 'PENDING').length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading dashboard..." />;
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <h1 className="card-title">Dashboard</h1>
        <p className="card-subtitle text-muted">
          Overview of Organization Structure, Employee Profiles, and Performance
        </p>
      </div>

      {/* Top summary stats - Organization */}
      {(hasPermission(user?.role || '', 'canViewDepartments') || 
        hasPermission(user?.role || '', 'canViewPositions') || 
        hasPermission(user?.role || '', 'canViewChangeRequests')) && (
        <div className="metrics-grid" style={{ marginBottom: '24px' }}>
          {hasPermission(user?.role || '', 'canViewDepartments') && (
            <Link href={ROUTES.DEPARTMENTS} style={{ textDecoration: 'none' }}>
              <div className="metric-card">
                <div style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }}>🏢</div>
                <div className="metric-value" style={{ textAlign: 'center' }}>{stats.departments}</div>
                <div className="metric-label" style={{ textAlign: 'center', marginTop: '4px' }}>Departments</div>
              </div>
            </Link>
          )}

          {hasPermission(user?.role || '', 'canViewPositions') && (
            <Link href={ROUTES.POSITIONS} style={{ textDecoration: 'none' }}>
              <div className="metric-card">
                <div style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }}>💼</div>
                <div className="metric-value" style={{ textAlign: 'center' }}>{stats.positions}</div>
                <div className="metric-label" style={{ textAlign: 'center', marginTop: '4px' }}>Positions</div>
              </div>
            </Link>
          )}

          {hasPermission(user?.role || '', 'canViewChangeRequests') && (
            <Link href={ROUTES.CHANGE_REQUESTS} style={{ textDecoration: 'none' }}>
              <div className="metric-card">
                <div style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }}>📝</div>
                <div className="metric-value" style={{ textAlign: 'center', color: '#fbbf24' }}>{stats.pendingRequests}</div>
                <div className="metric-label" style={{ textAlign: 'center', marginTop: '4px' }}>Pending Requests</div>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Three domain sections: Organization, Employee Profile, Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Organization Structure Section */}
        {(hasPermission(user?.role || '', 'canViewDepartments') || 
          hasPermission(user?.role || '', 'canViewPositions') || 
          hasPermission(user?.role || '', 'canViewOrgChart') || 
          hasPermission(user?.role || '', 'canViewChangeRequests')) && (
          <Card title="Organization Structure">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {hasPermission(user?.role || '', 'canViewDepartments') && (
                <Link
                  href={ROUTES.DEPARTMENTS}
                  style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(29, 155, 240, 0.1)',
                    border: '1px solid rgba(29, 155, 240, 0.3)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                  }}
                >
                  <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Manage Departments</h4>
                  <p className="text-muted" style={{ fontSize: '12px' }}>Create and update departments</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewPositions') && (
                <Link
                  href={ROUTES.POSITIONS}
                  style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(29, 155, 240, 0.1)',
                    border: '1px solid rgba(29, 155, 240, 0.3)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                  }}
                >
                  <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Manage Positions</h4>
                  <p className="text-muted" style={{ fontSize: '12px' }}>Create, delimit, and deactivate positions</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewOrgChart') && (
                <Link
                  href={ROUTES.ORG_CHART}
                  style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(29, 155, 240, 0.1)',
                    border: '1px solid rgba(29, 155, 240, 0.3)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                  }}
                >
                  <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>View Org Chart</h4>
                  <p className="text-muted" style={{ fontSize: '12px' }}>Visualize hierarchy</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewChangeRequests') && (
                <Link
                  href={ROUTES.CHANGE_REQUESTS}
                  style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(29, 155, 240, 0.1)',
                    border: '1px solid rgba(29, 155, 240, 0.3)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                  }}
                >
                  <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Change Requests</h4>
                  <p className="text-muted" style={{ fontSize: '12px' }}>Submit and approve structural changes</p>
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Employee Profile Section */}
        {(hasPermission(user?.role || '', 'canCreateEmployee') || 
          hasPermission(user?.role || '', 'canSearchEmployee') || 
          hasPermission(user?.role || '', 'canViewChangeRequests') || 
          hasPermission(user?.role || '', 'canViewManagerTeam')) && (
          <Card title="Employee Profile">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {hasPermission(user?.role || '', 'canCreateEmployee') && (
                <Link
                  href="/employee-profile/new"
                  style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(29, 155, 240, 0.1)',
                    border: '1px solid rgba(29, 155, 240, 0.3)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                  }}
                >
                  <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Create Employee</h4>
                  <p className="text-muted" style={{ fontSize: '12px' }}>Create employee master record</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canSearchEmployee') && (
                <Link
                  href="/employee-profile/search-by-number"
                  style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(29, 155, 240, 0.1)',
                    border: '1px solid rgba(29, 155, 240, 0.3)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                  }}
                >
                  <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Search Employee</h4>
                  <p className="text-muted" style={{ fontSize: '12px' }}>Find employees by number</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewChangeRequests') && (
                <Link
                  href="/employee-profile/change-requests"
                  style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(29, 155, 240, 0.1)',
                    border: '1px solid rgba(29, 155, 240, 0.3)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                  }}
                >
                  <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Profile Change Requests</h4>
                  <p className="text-muted" style={{ fontSize: '12px' }}>Review profile update requests</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewManagerTeam') && (
                <Link
                  href="/employee-profile/manager-team-demo"
                  style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(29, 155, 240, 0.1)',
                    border: '1px solid rgba(29, 155, 240, 0.3)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                  }}
                >
                  <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Manager Team View</h4>
                  <p className="text-muted" style={{ fontSize: '12px' }}>View your team's profiles</p>
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Performance Management Section */}
        {(hasPermission(user?.role || '', 'canViewTemplates') || 
          hasPermission(user?.role || '', 'canViewCycles') || 
          hasPermission(user?.role || '', 'canViewRecords') || 
          hasPermission(user?.role || '', 'canViewDisputes')) && (
          <Card title="Performance Management">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {hasPermission(user?.role || '', 'canViewTemplates') && (
                <Link
                  href="/performance/templates"
                  style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(29, 155, 240, 0.1)',
                    border: '1px solid rgba(29, 155, 240, 0.3)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                  }}
                >
                  <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Appraisal Templates</h4>
                  <p className="text-muted" style={{ fontSize: '12px' }}>Define templates and criteria</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewCycles') && (
                <Link
                  href="/performance/cycles"
                  style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(29, 155, 240, 0.1)',
                    border: '1px solid rgba(29, 155, 240, 0.3)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                  }}
                >
                  <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Appraisal Cycles</h4>
                  <p className="text-muted" style={{ fontSize: '12px' }}>Plan and monitor cycles</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewRecords') && (
                <Link
                  href="/performance/records"
                  style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(29, 155, 240, 0.1)',
                    border: '1px solid rgba(29, 155, 240, 0.3)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                  }}
                >
                  <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Appraisal Records</h4>
                  <p className="text-muted" style={{ fontSize: '12px' }}>Manager and employee appraisals</p>
                </Link>
              )}
              {hasPermission(user?.role || '', 'canViewDisputes') && (
                <Link
                  href="/performance/disputes"
                  style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(29, 155, 240, 0.1)',
                    border: '1px solid rgba(29, 155, 240, 0.3)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                  }}
                >
                  <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Disputes</h4>
                  <p className="text-muted" style={{ fontSize: '12px' }}>Track and resolve appraisal disputes</p>
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Time Management Section */}
        <Card title="Time Management">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              href="/time-management/attendance"
              style={{
                display: 'block',
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(29, 155, 240, 0.1)',
                border: '1px solid rgba(29, 155, 240, 0.3)',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
              }}
            >
              <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>My Attendance</h4>
              <p className="text-muted" style={{ fontSize: '12px' }}>Clock in/out and view today's status</p>
            </Link>
            <Link
              href="/time-management/attendance/history"
              style={{
                display: 'block',
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(29, 155, 240, 0.1)',
                border: '1px solid rgba(29, 155, 240, 0.3)',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
              }}
            >
              <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Attendance History</h4>
              <p className="text-muted" style={{ fontSize: '12px' }}>View past attendance records</p>
            </Link>
            <Link
              href="/time-management/attendance/correction"
              style={{
                display: 'block',
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(29, 155, 240, 0.1)',
                border: '1px solid rgba(29, 155, 240, 0.3)',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
              }}
            >
              <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Correction Requests</h4>
              <p className="text-muted" style={{ fontSize: '12px' }}>Request corrections to attendance records</p>
            </Link>
            {(hasPermission(user?.role || '', 'canViewManagerTeam') || 
              (user?.role && (user.role.toLowerCase().includes('manager') || user.role.toLowerCase().includes('hr') || user.role.toLowerCase().includes('admin')))) && (
              <>
                <Link
                  href="/time-management/manager/attendance"
                  style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(29, 155, 240, 0.1)',
                    border: '1px solid rgba(29, 155, 240, 0.3)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                  }}
                >
                  <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Manager Attendance</h4>
                  <p className="text-muted" style={{ fontSize: '12px' }}>View team attendance</p>
                </Link>
                <Link
                  href="/time-management/manager/approvals"
                  style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(29, 155, 240, 0.1)',
                    border: '1px solid rgba(29, 155, 240, 0.3)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                  }}
                >
                  <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Approvals</h4>
                  <p className="text-muted" style={{ fontSize: '12px' }}>Review correction requests</p>
                </Link>
              </>
            )}
          </div>
        </Card>

        {/* Leaves Section */}
        <Card title="Leaves">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              href="/leaves/request"
              style={{
                display: 'block',
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(29, 155, 240, 0.1)',
                border: '1px solid rgba(29, 155, 240, 0.3)',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
              }}
            >
              <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Request Leave</h4>
              <p className="text-muted" style={{ fontSize: '12px' }}>Submit a new leave request</p>
            </Link>
            <Link
              href="/leaves/history"
              style={{
                display: 'block',
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(29, 155, 240, 0.1)',
                border: '1px solid rgba(29, 155, 240, 0.3)',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
              }}
            >
              <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Leave History</h4>
              <p className="text-muted" style={{ fontSize: '12px' }}>View your leave request history</p>
            </Link>
          </div>
        </Card>

        {/* Payroll Configuration Section */}
        {(hasPermission(user?.role || '', 'canAssignRoles') || 
          (user?.role && (user.role.toLowerCase().includes('admin') || user.role.toLowerCase().includes('hr') || user.role.toLowerCase().includes('payroll')))) && (
          <Card title="Payroll Configuration">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                href="/payroll-configuration/company-settings"
                style={{
                  display: 'block',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(29, 155, 240, 0.1)',
                  border: '1px solid rgba(29, 155, 240, 0.3)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                }}
              >
                <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Company Settings</h4>
                <p className="text-muted" style={{ fontSize: '12px' }}>Configure default payroll settings</p>
              </Link>
              <Link
                href="/payroll-configuration/paygrades"
                style={{
                  display: 'block',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(29, 155, 240, 0.1)',
                  border: '1px solid rgba(29, 155, 240, 0.3)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                }}
              >
                <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Pay Grades</h4>
                <p className="text-muted" style={{ fontSize: '12px' }}>Manage pay grade structures</p>
              </Link>
              <Link
                href="/payroll-configuration/pay-types"
                style={{
                  display: 'block',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(29, 155, 240, 0.1)',
                  border: '1px solid rgba(29, 155, 240, 0.3)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                }}
              >
                <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Pay Types</h4>
                <p className="text-muted" style={{ fontSize: '12px' }}>Configure payment types</p>
              </Link>
              <Link
                href="/payroll-configuration/approvals"
                style={{
                  display: 'block',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(29, 155, 240, 0.1)',
                  border: '1px solid rgba(29, 155, 240, 0.3)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(29, 155, 240, 0.3)';
                }}
              >
                <h4 style={{ fontWeight: '500', color: '#60a5fa', marginBottom: '4px' }}>Approvals</h4>
                <p className="text-muted" style={{ fontSize: '12px' }}>Review payroll configuration approvals</p>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}