import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Car, Loader2, MoreHorizontal } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
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
import { useVehicles, useDeleteVehicle } from '../api/vehicles';
import { VehicleFormDialog } from './VehicleFormDialog';
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
    AVAILABLE: 'success',
    IN_USE: 'warning',
    MAINTENANCE: 'secondary',
};

const statusLabels: Record<string, string> = {
    AVAILABLE: 'Available',
    IN_USE: 'In Use',
    MAINTENANCE: 'Maintenance',
};

export function VehiclesPage() {
    const { data: vehicles, isLoading, error, refetch } = useVehicles();
    const deleteVehicle = useDeleteVehicle();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editVehicle, setEditVehicle] = useState<any>(null);

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await deleteVehicle.mutateAsync(deleteId);
                toast.success('Vehicle deleted successfully');
                setDeleteId(null);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to delete vehicle');
            }
        }
    };

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'id',
            header: 'Plate Number',
            cell: ({ row }) => (
                <Link
                    to="/vehicles/$id"
                    params={{ id: row.original.id.toString() }}
                    className="hover:text-blue-600 hover:underline font-medium"
                >
                    {row.original.plateNumber}
                </Link>
            ),
        },
        {
            header: 'Vehicle',
            cell: ({ row }) => (
                <Link
                    to="/vehicles/$id"
                    params={{ id: row.original.id.toString() }}
                    className="group"
                >
                    <p className="font-medium group-hover:text-blue-600">{row.original.brand} {row.original.model}</p>
                </Link>
            ),
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <Badge variant="outline">
                    {row.original.type === 'PASSENGER' ? 'Passenger' : 'Cargo'}
                </Badge>
            ),
        },
        {
            accessorKey: 'ownership',
            header: 'Ownership',
            cell: ({ row }) => (
                <div>
                    <span className={row.original.ownership === 'COMPANY' ? 'text-blue-600' : 'text-purple-600'}>
                        {row.original.ownership === 'COMPANY' ? 'Company' : 'Rental'}
                    </span>
                    {row.original.rentalCompany && (
                        <p className="text-xs text-gray-400">{row.original.rentalCompany}</p>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'regionName',
            header: 'Region',
            cell: ({ row }) => row.original.regionName || '-',
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
                        <DropdownMenuItem onClick={() => setEditVehicle(row.original)}>
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
    ], [deleteVehicle.isPending]);

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
                Error loading vehicles. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
                    <p className="text-gray-500 mt-1">Manage your fleet of vehicles</p>
                </div>
                <VehicleFormDialog onSuccess={() => refetch()} />
            </div>

            {/* Edit Dialog */}
            {editVehicle && (
                <VehicleFormDialog
                    vehicle={editVehicle}
                    open={true}
                    onOpenChange={(open) => !open && setEditVehicle(null)}
                    onSuccess={() => {
                        setEditVehicle(null);
                        refetch();
                    }}
                />
            )}

            {vehicles?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Car className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>No vehicles yet. Add your first vehicle!</p>
                </div>
            ) : (
                <DataTable columns={columns} data={vehicles || []} />
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the vehicle
                            from the system and remove its data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Vehicle
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
