import { useState, useMemo } from 'react';
import { CalendarCheck, Loader2, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBookings, useCancelBooking } from '../api/bookings';
import { BookingFormDialog } from './BookingFormDialog';
import { useAuthStore } from '@/lib/auth';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusVariants: Record<string, 'success' | 'warning' | 'secondary' | 'destructive' | 'info'> = {
    PENDING_L1: 'warning',
    PENDING_L2: 'warning',
    APPROVED: 'success',
    REJECTED: 'destructive',
    COMPLETED: 'secondary',
    CANCELLED: 'secondary',
};

const statusLabels: Record<string, string> = {
    PENDING_L1: 'Pending L1',
    PENDING_L2: 'Pending L2',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

export function BookingsPage() {
    const { data: bookings, isLoading, error, refetch } = useBookings();
    const cancelBooking = useCancelBooking();
    const { user } = useAuthStore();
    const [cancelId, setCancelId] = useState<number | null>(null);
    const [editBooking, setEditBooking] = useState<any>(null);

    const handleCancel = async () => {
        if (cancelId) {
            try {
                await cancelBooking.mutateAsync(cancelId);
                toast.success('Booking cancelled successfully');
                setCancelId(null);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to cancel booking');
            }
        }
    };

    const canEdit = (booking: any) => {
        return booking.requesterId === user?.id && ['PENDING_L1'].includes(booking.status);
    };

    const canCancel = (booking: any) => {
        return booking.requesterId === user?.id && !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(booking.status);
    };

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => <span className="font-medium">#{row.original.id}</span>,
        },
        {
            accessorKey: 'vehiclePlate',
            header: 'Vehicle',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.vehiclePlate}</p>
                    <p className="text-xs text-gray-400">{row.original.vehicleBrand} {row.original.vehicleModel}</p>
                </div>
            ),
        },
        {
            accessorKey: 'driverName',
            header: 'Driver',
            cell: ({ row }) => row.original.driverName || '-',
        },
        {
            accessorKey: 'purpose',
            header: 'Purpose',
            cell: ({ row }) => <p className="max-w-[200px] truncate">{row.original.purpose}</p>,
        },
        {
            id: 'dateRange',
            header: 'Date Range',
            cell: ({ row }) => (
                <div className="text-sm">
                    <p>{format(new Date(row.original.startDate), 'dd MMM yyyy')}</p>
                    <p className="text-gray-400">to {format(new Date(row.original.endDate), 'dd MMM yyyy')}</p>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={statusVariants[row.original.status] || 'secondary'}>
                    {statusLabels[row.original.status] || row.original.status}
                </Badge>
            ),
        },
        ...(user?.role === 'ADMIN' ? [{
            id: 'actions',
            cell: ({ row }: { row: any }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {canEdit(row.original) && (
                            <DropdownMenuItem onClick={() => setEditBooking(row.original)}>
                                Edit
                            </DropdownMenuItem>
                        )}
                        {canCancel(row.original) && (
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setCancelId(row.original.id)}
                            >
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }] : []),
    ], [user, cancelBooking.isPending]);

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
                Error loading bookings. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
                    <p className="text-gray-500 mt-1">Vehicle booking requests</p>
                </div>
                {user?.role === 'ADMIN' && <BookingFormDialog onSuccess={() => refetch()} />}
            </div>

            {/* Edit Dialog - controlled by state */}
            {editBooking && (
                <BookingFormDialog
                    booking={editBooking}
                    open={true}
                    onOpenChange={(open) => !open && setEditBooking(null)}
                    onSuccess={() => {
                        setEditBooking(null);
                        refetch();
                    }}
                />
            )}

            {bookings?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <CalendarCheck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>No bookings yet. Create your first booking!</p>
                </div>
            ) : (
                <DataTable columns={columns} data={bookings || []} />
            )}

            <AlertDialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will cancel your booking request. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Yes, Cancel Booking
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
