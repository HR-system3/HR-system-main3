export enum ConfigStatus {
    DRAFT = 'DRAFT',
    PENDING_MANAGER_APPROVAL = 'PENDING_MANAGER_APPROVAL',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export enum PolicyType {
    DEDUCTION = "Deduction",
    ALLOWANCE = "Allowance",
    BENEFIT = "Benefit",
    MISCONDUCT = "Misconduct",
    LEAVE = "Leave",
}


export enum Applicability {
    AllEmployees = "All Employees",
    FULL_TIME = "Full Time Employees",
    PART_TIME = "Part Time Employees",
    CONTRACTORS = "Contractors",
}