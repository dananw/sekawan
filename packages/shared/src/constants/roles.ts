export const UserRole = {
  ADMIN: 'ADMIN',
  APPROVER_L1: 'APPROVER_L1',
  APPROVER_L2: 'APPROVER_L2',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserRoleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  APPROVER_L1: 'Approver Level 1',
  APPROVER_L2: 'Approver Level 2',
};
