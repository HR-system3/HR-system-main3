"use client";

import React from "react";
import { PayrollRun } from "@/types/payroll-run.types";

type PayrollStatus = PayrollRun["status"];

interface Props {
  status: PayrollStatus;
}

const statusStyles: Record<string, string> = {
  DRAFT: "bg-gray-200 text-gray-800",
  PREVIEWED: "bg-blue-200 text-blue-800",
  LOCKED: "bg-yellow-200 text-yellow-800",
  APPROVED_BY_MANAGER: "bg-purple-200 text-purple-800",
  APPROVED_BY_FINANCE: "bg-green-200 text-green-800",
  REJECTED: "bg-red-200 text-red-800",
};

const PayrollRunStatus: React.FC<Props> = ({ status }) => {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        statusStyles[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
};

export default PayrollRunStatus;
