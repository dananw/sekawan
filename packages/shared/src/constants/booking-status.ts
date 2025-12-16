export const BookingStatus = {
  PENDING_L1: 'PENDING_L1',
  PENDING_L2: 'PENDING_L2',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const BookingStatusLabels: Record<BookingStatus, string> = {
  PENDING_L1: 'Pending Level 1 Approval',
  PENDING_L2: 'Pending Level 2 Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const ApprovalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ApprovalStatus = (typeof ApprovalStatus)[keyof typeof ApprovalStatus];
