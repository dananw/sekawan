import { useState, useMemo } from 'react';
import { Loader2, Shield, MoreHorizontal } from 'lucide-react';
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
import { useUsers, useDeleteUser } from '../api/users';
import { UserFormDialog } from './UserFormDialog';
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

const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    APPROVER_L1: 'bg-blue-100 text-blue-800',
    APPROVER_L2: 'bg-purple-100 text-purple-800',
};

const roleLabels: Record<string, string> = {
    ADMIN: 'Admin',
    APPROVER_L1: 'Approver L1',
    APPROVER_L2: 'Approver L2',
};

export function UsersPage() {
    const { data: users, isLoading, error, refetch } = useUsers();
    const deleteUser = useDeleteUser();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editUser, setEditUser] = useState<any>(null);

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await deleteUser.mutateAsync(deleteId);
                toast.success('User deleted successfully');
                setDeleteId(null);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: ({ row }) => (
                <Badge className={roleColors[row.original.role]}>
                    {roleLabels[row.original.role] || row.original.role}
                </Badge>
            ),
        },
        {
            accessorKey: 'regionName',
            header: 'Region',
            cell: ({ row }) => row.original.regionName || '-',
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
                        <DropdownMenuItem onClick={() => setEditUser(row.original)}>
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
    ], [deleteUser.isPending]);

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
                Error loading users. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-500 mt-1">Manage system users and their roles</p>
                </div>
                <UserFormDialog onSuccess={() => refetch()} />
            </div>

            {/* Edit Dialog */}
            {editUser && (
                <UserFormDialog
                    user={editUser}
                    open={true}
                    onOpenChange={(open) => !open && setEditUser(null)}
                    onSuccess={() => {
                        setEditUser(null);
                        refetch();
                    }}
                />
            )}

            {users?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>No users found. Add your first user!</p>
                </div>
            ) : (
                <DataTable columns={columns} data={users || []} />
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            from the system and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
