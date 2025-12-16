import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Wrench, Loader2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { useServiceSchedules, useDeleteServiceSchedule, useCompleteServiceSchedule } from '../api/service-schedules';
import { ServiceScheduleFormDialog } from './ServiceScheduleFormDialog';
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

const statusVariants: Record<string, 'success' | 'warning' | 'secondary'> = {
    SCHEDULED: 'warning',
    IN_PROGRESS: 'secondary',
    COMPLETED: 'success',
    CANCELLED: 'secondary',
};

const statusLabels: Record<string, string> = {
    SCHEDULED: 'Scheduled',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

const typeLabels: Record<string, string> = {
    ROUTINE: 'Routine',
    REPAIR: 'Repair',
    OIL_CHANGE: 'Oil Change',
    TIRE_ROTATION: 'Tire Rotation',
    BRAKE_SERVICE: 'Brake Service',
    FULL_SERVICE: 'Full Service',
    OTHER: 'Other',
};

export function ServiceSchedulesPage() {
    const { data: schedules, isLoading, refetch } = useServiceSchedules();
    const deleteSchedule = useDeleteServiceSchedule();
    const completeSchedule = useCompleteServiceSchedule();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editSchedule, setEditSchedule] = useState<any>(null);

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await deleteSchedule.mutateAsync(deleteId);
                toast.success('Service schedule deleted successfully');
                setDeleteId(null);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to delete schedule');
            }
        }
    };

    const handleComplete = async (id: number) => {
        try {
            await completeSchedule.mutateAsync(id);
            toast.success('Service marked as completed');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to complete');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            id: 'vehicle',
            header: 'Vehicle',
            cell: ({ row }) => (
                <div className="font-medium">
                    {row.original.vehiclePlate} <span className="text-gray-500">- {row.original.vehicleBrand} {row.original.vehicleModel}</span>
                </div>
            ),
        },
        {
            accessorKey: 'type',
            header: 'Service Type',
            cell: ({ row }) => (
                <Badge variant="outline">
                    {typeLabels[row.original.type] || row.original.type}
                </Badge>
            ),
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => <div className="max-w-[200px] truncate">{row.original.description}</div>,
        },
        {
            accessorKey: 'scheduledDate',
            header: 'Date',
            cell: ({ row }) => format(new Date(row.original.scheduledDate), 'dd MMM yyyy'),
        },
        {
            accessorKey: 'cost',
            header: () => <div className="text-right">Cost</div>,
            cell: ({ row }) => <div className="text-right">{row.original.cost ? formatCurrency(row.original.cost) : '-'}</div>,
        },
        {
            accessorKey: 'odometerReading',
            header: () => <div className="text-right">Odometer</div>,
            cell: ({ row }) => <div className="text-right">{row.original.odometerReading?.toLocaleString() ? `${row.original.odometerReading.toLocaleString()} km` : '-'}</div>,
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
        {
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
                        {row.original.status !== 'COMPLETED' && (
                            <DropdownMenuItem
                                className="text-green-600 focus:text-green-600"
                                onClick={() => handleComplete(row.original.id)}
                            >
                                Mark Complete
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setEditSchedule(row.original)}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeleteId(row.original.id)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [deleteSchedule.isPending, completeSchedule.isPending]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Service Schedules</h1>
                    <p className="text-gray-500 mt-1">Manage vehicle maintenance and repairs</p>
                </div>
                <ServiceScheduleFormDialog onSuccess={() => refetch()} />
            </div>

            {/* Edit Dialog */}
            {editSchedule && (
                <ServiceScheduleFormDialog
                    schedule={editSchedule}
                    open={true}
                    onOpenChange={(open) => !open && setEditSchedule(null)}
                    onSuccess={() => {
                        setEditSchedule(null);
                        refetch();
                    }}
                />
            )}

            {schedules?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Wrench className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>No service schedules yet. Schedule your first service!</p>
                </div>
            ) : (
                <DataTable columns={columns} data={schedules || []} />
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the service schedule.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Schedule
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
