import DashboardLayout from '@/components/layout/DashboardLayout';

export default function PayrollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

