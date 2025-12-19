import { IrregularitySeverity } from './enums';

export interface Irregularity {
  id: string;
  runId: string;
  employeeId: string;
  title: string;
  description?: string;
  severity: IrregularitySeverity;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}
