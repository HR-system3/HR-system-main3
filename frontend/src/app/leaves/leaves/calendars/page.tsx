"use client";
import api from "@/lib/axios";
import { useState, useEffect } from "react";

interface Holiday {
  name: string;
  date: string;
  recurring?: boolean;
}

interface BlockedPeriod {
  start: string;
  end: string;
  reason?: string;
}

interface Calendar {
  _id: string;
  name: string;
  country?: string;
  year?: number;
  holidays: Holiday[];
  blockedPeriods: BlockedPeriod[];
  autoExcludeWeekends?: boolean; // REQ-010, BR 55
}

export default function HolidayCalendarManagementPage() {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    year: new Date().getFullYear(),
    autoExcludeWeekends: true, // REQ-010, BR 55
  });
  const [newHoliday, setNewHoliday] = useState({
    name: "",
    date: "",
    recurring: false,
  });
  const [newBlockedPeriod, setNewBlockedPeriod] = useState({
    start: "",
    end: "",
    reason: "",
  });

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      const response = await api.get("/leaves/hr/calendars");
      setCalendars(response.data || []);
    } catch (error) {
      console.error("Error fetching calendars:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/leaves/hr/calendars", formData);
      setShowForm(false);
      setFormData({ name: "", country: "", year: new Date().getFullYear(), autoExcludeWeekends: true });
      fetchCalendars();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create calendar");
    }
  };

  const handleAddHoliday = async (calendarId: string) => {
    if (!newHoliday.name || !newHoliday.date) {
      alert("Please fill in holiday name and date");
      return;
    }
    try {
      await api.post(`/leaves/hr/calendars/${calendarId}/holidays`, newHoliday);
      setNewHoliday({ name: "", date: "", recurring: false });
      fetchCalendars();
      if (selectedCalendar?._id === calendarId) {
        const updated = calendars.find((c) => c._id === calendarId);
        if (updated) setSelectedCalendar(updated);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add holiday");
    }
  };

  const handleAddBlockedPeriod = async (calendarId: string) => {
    if (!newBlockedPeriod.start || !newBlockedPeriod.end) {
      alert("Please fill in start and end dates");
      return;
    }
    try {
      await api.post(`/leaves/hr/calendars/${calendarId}/blocked-periods`, newBlockedPeriod);
      setNewBlockedPeriod({ start: "", end: "", reason: "" });
      fetchCalendars();
      if (selectedCalendar?._id === calendarId) {
        const updated = calendars.find((c) => c._id === calendarId);
        if (updated) setSelectedCalendar(updated);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add blocked period");
    }
  };

  const handleRemoveHoliday = async (calendarId: string, date: string) => {
    if (!confirm("Are you sure you want to remove this holiday?")) return;
    try {
      await api.post(`/leaves/hr/calendars/${calendarId}/holidays/remove`, { date });
      fetchCalendars();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to remove holiday");
    }
  };

  const handleRemoveBlockedPeriod = async (calendarId: string, start: string, end: string) => {
    if (!confirm("Are you sure you want to remove this blocked period?")) return;
    try {
      await api.post(`/leaves/hr/calendars/${calendarId}/blocked-periods/remove`, { start, end });
      fetchCalendars();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to remove blocked period");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Holiday Calendar Management</h1>
            <p className="text-gray-600 mt-2">Manage holidays and blocked periods</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Create Calendar"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Calendar</h2>
            <form onSubmit={handleCreateCalendar} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Calendar Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    id="year"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoExcludeWeekends"
                  checked={formData.autoExcludeWeekends}
                  onChange={(e) =>
                    setFormData({ ...formData, autoExcludeWeekends: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoExcludeWeekends" className="ml-2 text-sm text-gray-700">
                  Auto-Exclude Weekends (REQ-010, BR 55)
                </label>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Calendar
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {calendars.map((calendar) => (
            <div key={calendar._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{calendar.name}</h3>
                  {calendar.country && (
                    <p className="text-sm text-gray-500">Country: {calendar.country}</p>
                  )}
                  {calendar.year && (
                    <p className="text-sm text-gray-500">Year: {calendar.year}</p>
                  )}
                  {calendar.autoExcludeWeekends !== false && (
                    <p className="text-sm text-green-600">✓ Weekends Auto-Excluded</p>
                  )}
                </div>
                <button
                  onClick={() =>
                    setSelectedCalendar(selectedCalendar?._id === calendar._id ? null : calendar)
                  }
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {selectedCalendar?._id === calendar._id ? "Hide Details" : "View Details"}
                </button>
              </div>

              {selectedCalendar?._id === calendar._id && (
                <div className="space-y-6 mt-4">
                  {/* Upload Holidays Section */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Upload National Holidays (REQ-010)</h4>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800 mb-2">
                        You can upload a CSV file with holidays or add them manually below.
                      </p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Note: You may need to add POST /leaves/hr/calendars/:id/upload-holidays endpoint
                            const reader = new FileReader();
                            reader.onload = async (event) => {
                              try {
                                const csv = event.target?.result as string;
                                // Parse CSV and upload holidays
                                // This is a placeholder - implement CSV parsing based on your format
                                alert("CSV upload functionality needs backend endpoint: POST /leaves/hr/calendars/:id/upload-holidays");
                              } catch (error) {
                                alert("Failed to parse CSV file");
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Holidays Section */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Holidays</h4>
                    <div className="space-y-2 mb-4">
                      {calendar.holidays?.map((holiday, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <span className="font-medium">{holiday.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {new Date(holiday.date).toLocaleDateString()}
                            </span>
                            {holiday.recurring && (
                              <span className="text-xs text-blue-600 ml-2">(Recurring)</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveHoliday(calendar._id, holiday.date)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 p-3 bg-blue-50 rounded">
                      <input
                        type="text"
                        placeholder="Holiday name"
                        value={newHoliday.name}
                        onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="date"
                        value={newHoliday.date}
                        onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newHoliday.recurring}
                          onChange={(e) =>
                            setNewHoliday({ ...newHoliday, recurring: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                        <label className="ml-2 text-sm text-gray-700">Recurring</label>
                      </div>
                      <button
                        onClick={() => handleAddHoliday(calendar._id)}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 text-sm"
                      >
                        Add Holiday
                      </button>
                    </div>
                  </div>

                  {/* Blocked Periods Section */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Blocked Periods</h4>
                    <div className="space-y-2 mb-4">
                      {calendar.blockedPeriods?.map((period, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <span className="text-sm">
                              {new Date(period.start).toLocaleDateString()} -{" "}
                              {new Date(period.end).toLocaleDateString()}
                            </span>
                            {period.reason && (
                              <span className="text-xs text-gray-500 ml-2">({period.reason})</span>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveBlockedPeriod(calendar._id, period.start, period.end)
                            }
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 p-3 bg-yellow-50 rounded">
                      <input
                        type="date"
                        placeholder="Start date"
                        value={newBlockedPeriod.start}
                        onChange={(e) =>
                          setNewBlockedPeriod({ ...newBlockedPeriod, start: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="date"
                        placeholder="End date"
                        value={newBlockedPeriod.end}
                        onChange={(e) =>
                          setNewBlockedPeriod({ ...newBlockedPeriod, end: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Reason (optional)"
                        value={newBlockedPeriod.reason}
                        onChange={(e) =>
                          setNewBlockedPeriod({ ...newBlockedPeriod, reason: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <button
                        onClick={() => handleAddBlockedPeriod(calendar._id)}
                        className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 text-sm"
                      >
                        Add Blocked Period
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {calendars.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No calendars found. Create your first calendar.</p>
          </div>
        )}
      </div>
    </div>
  );
}

