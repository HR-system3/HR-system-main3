"use client";

import { useEffect, useState } from "react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { Settings, Calendar, Globe, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { payrollConfigurationService } from "@/services/api/payroll-configuration.service";

type CompanySettings = {
  payDate: number;
  timeZone: string;
  currency: string;
};

export default function CompanySettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>({
    payDate: 1,
    timeZone: "UTC",
    currency: "USD",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await payrollConfigurationService.getCompanySettings();
      if (data) {
        setSettings(data);
      }
    } catch (err: any) {
      console.error("Failed to load settings", err);
      setError(err.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await payrollConfigurationService.updateCompanySettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <Settings className="w-8 h-8 text-blue-600" />
            Company Settings
          </h1>
          <p className="text-gray-600 mt-2 font-medium">Configure global payroll settings</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 flex items-start gap-4">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-green-900">Settings saved successfully</p>
            <p className="text-green-700 text-sm mt-1.5">Your changes have been applied</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-red-700 text-sm mt-1.5">{error}</p>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <Card 
        title="Global Payroll Settings"
        description="Configure default settings that apply to all payroll operations"
      >
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg mt-1">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <Input
                  label="Pay Date"
                  type="number"
                  min="1"
                  max="31"
                  value={settings.payDate.toString()}
                  onChange={(e) => setSettings({ ...settings, payDate: parseInt(e.target.value) || 1 })}
                  required
                  helperText="Day of the month when employees receive their salary (1-31)"
                />
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg mt-1">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <Input
                  label="Time Zone"
                  value={settings.timeZone}
                  onChange={(e) => setSettings({ ...settings, timeZone: e.target.value })}
                  required
                  helperText="Default time zone for payroll calculations (e.g., UTC, America/New_York)"
                />
              </div>
            </div>

            <div className="flex items-start gap-4 md:col-span-2">
              <div className="p-3 bg-purple-100 rounded-lg mt-1">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <Input
                  label="Currency"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value.toUpperCase() })}
                  required
                  helperText="Default currency code (e.g., USD, EUR, GBP)"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <Button onClick={handleSave} isLoading={saving} disabled={saving}>
              Save Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
