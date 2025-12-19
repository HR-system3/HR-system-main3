'use client';

import React from 'react';
import { SalaryComponent } from '@/types/payroll-calculation.types';
import Money from '../shared/Money';

interface StatutoryContributionsProps {
  taxes: SalaryComponent[];
  insurances: SalaryComponent[];
}

export default function StatutoryContributions({ taxes, insurances }: StatutoryContributionsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Taxes</h3>
        {taxes.length === 0 ? (
          <p className="text-sm text-gray-500">No taxes</p>
        ) : (
          <div className="space-y-2">
            {taxes.map((tax, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{tax.name}</span>
                <span className="text-gray-900">
                  <Money amount={tax.amount} />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Insurances</h3>
        {insurances.length === 0 ? (
          <p className="text-sm text-gray-500">No insurances</p>
        ) : (
          <div className="space-y-2">
            {insurances.map((insurance, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{insurance.name}</span>
                <span className="text-gray-900">
                  <Money amount={insurance.amount} />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
