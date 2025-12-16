import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Users, Loader2, MoreHorizontal } from 'lucide-react';
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
import { useDrivers, useDeleteDriver } from '../api/drivers';
import { DriverFormDialog } from './DriverFormDialog';
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
    ON_DUTY: 'warning',
    OFF: 'secondary',
};

const statusLabels: Record<string, string> = {
    AVAILABLE: 'Available',
    ON_DUTY: 'On Duty',
    OFF: 'Off',
};

export function DriversPage() {
    const { data: drivers, isLoading, error, refetch } = useDrivers();
    const deleteDriver = useDeleteDriver();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editDriver, setEditDriver] = useState<any>(null);

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await deleteDriver.mutateAsync(deleteId);
                toast.success('Driver deleted successfully');
                setDeleteId(null);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to delete driver');
            }
        }
    };

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <Link
                    to="/drivers/$id"
                    params={{ id: row.original.id.toString() }}
                    className="hover:text-blue-600 hover:underline font-medium"
                >
                    {row.original.name}
                </Link>
            ),
        },
        {
            accessorKey: 'licenseNumber',
            header: 'License Number',
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
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
                        <DropdownMenuItem onClick={() => setEditDriver(row.original)}>
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
    ], [deleteDriver.isPending]);

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
                Error loading drivers. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
                    <p className="text-gray-500 mt-1">Manage your driver workforce</p>
                </div>
                <DriverFormDialog onSuccess={() => refetch()} />
            </div>

            {/* Edit Dialog */}
            {editDriver && (
                <DriverFormDialog
                    driver={editDriver}
                    open={true}
                    onOpenChange={(open) => !open && setEditDriver(null)}
                    onSuccess={() => {
                        setEditDriver(null);
                        refetch();
                    }}
                />
            )}

            {drivers?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>No drivers yet. Add your first driver!</p>
                </div>
            ) : (
                <DataTable columns={columns} data={drivers || []} />
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the driver
                            from the system and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Driver
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
