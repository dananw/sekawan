import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Fuel, Loader2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFuelLogs, useDeleteFuelLog } from '../api/fuel-logs';
import { FuelLogFormDialog } from './FuelLogFormDialog';
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

export function FuelLogsPage() {
    const { data: fuelLogs, isLoading, refetch } = useFuelLogs();
    const deleteFuelLog = useDeleteFuelLog();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editLog, setEditLog] = useState<any>(null);

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await deleteFuelLog.mutateAsync(deleteId);
                toast.success('Fuel log deleted successfully');
                setDeleteId(null);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to delete');
            }
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
            accessorKey: 'loggedAt',
            header: 'Date',
            cell: ({ row }) => format(new Date(row.original.loggedAt), 'dd MMM yyyy'),
        },
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
            accessorKey: 'liters',
            header: () => <div className="text-right">Liters</div>,
            cell: ({ row }) => <div className="text-right">{row.original.liters.toFixed(2)} L</div>,
        },
        {
            accessorKey: 'cost',
            header: ({ column }) => <div className="text-right">Cost</div>,
            cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.cost)}</div>,
        },
        {
            accessorKey: 'odometer',
            header: ({ column }) => <div className="text-right">Odometer</div>,
            cell: ({ row }) => <div className="text-right">{row.original.odometer.toLocaleString()} km</div>,
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
                        <DropdownMenuItem onClick={() => setEditLog(row.original)}>
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
    ], [deleteFuelLog.isPending]);

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
                    <h1 className="text-2xl font-bold text-gray-900">Fuel Logs</h1>
                    <p className="text-gray-500 mt-1">Track vehicle fuel consumption</p>
                </div>
                <FuelLogFormDialog onSuccess={() => refetch()} />
            </div>

            {/* Edit Dialog */}
            {editLog && (
                <FuelLogFormDialog
                    fuelLog={editLog}
                    open={true}
                    onOpenChange={(open) => !open && setEditLog(null)}
                    onSuccess={() => {
                        setEditLog(null);
                        refetch();
                    }}
                />
            )}

            {fuelLogs?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Fuel className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>No fuel logs recorded yet.</p>
                </div>
            ) : (
                <DataTable columns={columns} data={fuelLogs || []} />
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the fuel log record.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Log
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
