import { FileCheck, Check, X, Loader2, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePendingApprovals } from '../api/approvals';
import { useApproveBooking } from '@/features/bookings/api/bookings';

import { jwtDecode } from 'jwt-decode';

export function ApprovalsPage() {
    const { data: approvals, isLoading, error } = usePendingApprovals();
    const approveBooking = useApproveBooking();

    // Simple way to get user role from localStorage since we don't have a global auth context exposed easily yet
    const getUserRole = () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const decoded: any = jwtDecode(token);
                return decoded.role;
            }
        } catch (e) {
            console.error('Failed to decode token', e);
        }
        return null;
    };

    const userRole = getUserRole();
    const isAdmin = userRole === 'ADMIN';

    const handleApprove = async (bookingId: number) => {
        await approveBooking.mutateAsync({ id: bookingId, action: 'APPROVED' });
    };

    const handleReject = async (bookingId: number) => {
        await approveBooking.mutateAsync({ id: bookingId, action: 'REJECTED', notes: 'Rejected by approver' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-600 p-4">
                Error loading approvals. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
                <p className="text-gray-500 mt-1">Pending booking requests awaiting your approval</p>
            </div>

            {isAdmin && (
                <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Admin Read-Only Mode</AlertTitle>
                    <AlertDescription className="text-blue-600">
                        You are viewing all pending approvals as an Administrator. You cannot approve or reject requests directly.
                    </AlertDescription>
                </Alert>
            )}

            {approvals?.length === 0 ? (
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-12 text-center">
                        <FileCheck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No pending approvals</h3>
                        <p className="text-gray-500 mt-1">All booking requests have been processed</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {approvals?.map((approval) => (
                        <Card key={approval.approvalId} className="border-0 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Booking #{approval.bookingId}</CardTitle>
                                    <Badge variant="warning">Level {approval.level} Approval</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Vehicle</p>
                                        <p className="font-medium">{approval.vehiclePlate}</p>
                                        <p className="text-sm text-gray-400">{approval.vehicleBrand} {approval.vehicleModel}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Driver</p>
                                        <p className="font-medium">{approval.driverName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Purpose</p>
                                        <p className="font-medium">{approval.purpose}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date Range</p>
                                        <p className="font-medium">
                                            {format(new Date(approval.startDate), 'dd MMM yyyy')} - {format(new Date(approval.endDate), 'dd MMM yyyy')}
                                        </p>
                                    </div>
                                </div>
                                {!isAdmin && (
                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button
                                            variant="default"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => handleApprove(approval.bookingId)}
                                            disabled={approveBooking.isPending}
                                        >
                                            <Check className="w-4 h-4 mr-1" />
                                            Approve
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleReject(approval.bookingId)}
                                            disabled={approveBooking.isPending}
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
