"use client";
import { useEffect, useState } from "react";
import { LoadingSkeleton, CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { toast } from "@/components/ui/Toast";
import ErrorModal from "@/components/ui/ErrorModal";
import { leavesService } from "@/services/api/leaves.service";

export default function TeamDashboardPage() {
  const [teamData, setTeamData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const data = await leavesService.getManagerRequests();
      // Group by employee
      const grouped = data.reduce((acc: any, req: any) => {
        const empId = req.employeeId?._id || req.employeeId;
        if (!acc[empId]) {
          acc[empId] = {
            employee: req.employeeId,
            requests: [],
            totalDays: 0,
          };
        }
        acc[empId].requests.push(req);
        acc[empId].totalDays += req.totalDays;
        return acc;
      }, {});
      setTeamData(Object.values(grouped));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load team data");
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Team Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Team Dashboard</h1>

      {error && (
        <ErrorModal
          isOpen={!!error}
          onClose={() => setError(null)}
          message={error}
          onRetry={fetchTeamData}
        />
      )}

      {teamData.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">No team data available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamData.map((member: any) => (
            <div key={member.employee?._id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold mb-2">
                {member.employee?.name || "Unknown Employee"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Total Leave Days: <span className="font-medium">{member.totalDays}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Requests: <span className="font-medium">{member.requests.length}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

