import { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Field,
    FieldLabel,
    FieldContent,
    FieldError,
} from '@/components/ui/field';
import { useRegions } from '@/features/regions/api/regions';
import { useCreateUser, useUpdateUser, type User, type CreateUserInput } from '../api/users';
import { z } from 'zod';

const userSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'APPROVER_L1', 'APPROVER_L2'], { errorMap: () => ({ message: 'Role is required' }) }),
    regionId: z.string(),
});

interface UserFormDialogProps {
    user?: User;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

export function UserFormDialog({ user, trigger, open: controlledOpen, onOpenChange: setControlledOpen, onSuccess }: UserFormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEdit = !!user;

    // Use controlled state if provided, otherwise internal state
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = (newOpen: boolean) => {
        if (isControlled) {
            setControlledOpen?.(newOpen);
        } else {
            setInternalOpen(newOpen);
        }
    };

    const { data: regions } = useRegions();
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();

    const form = useForm({
        defaultValues: {
            email: user?.email || '',
            password: '',
            name: user?.name || '',
            role: user?.role || 'APPROVER_L1',
            regionId: user?.regionId?.toString() || '',
        },
        onSubmit: async ({ value }) => {
            setError(null);
            try {
                if (isEdit && user) {
                    await updateUser.mutateAsync({
                        id: user.id,
                        data: {
                            name: value.name,
                            role: value.role as 'ADMIN' | 'APPROVER_L1' | 'APPROVER_L2',
                            regionId: value.regionId ? parseInt(value.regionId) : undefined,
                        },
                    });
                    toast.success('User updated successfully');
                } else {
                    const payload: CreateUserInput = {
                        email: value.email,
                        password: value.password,
                        name: value.name,
                        role: value.role as 'ADMIN' | 'APPROVER_L1' | 'APPROVER_L2',
                        regionId: value.regionId ? parseInt(value.regionId) : undefined,
                    };
                    await createUser.mutateAsync(payload);
                    toast.success('User created successfully');
                }

                setOpen(false);
                form.reset();
                onSuccess?.();
            } catch (err: any) {
                const message = err.response?.data?.message || 'Failed to save user';
                setError(message);
                toast.error(message);
            }
        },
    });

    useEffect(() => {
        if (open && user) {
            form.setFieldValue('email', user.email);
            form.setFieldValue('name', user.name);
            form.setFieldValue('role', user.role);
            form.setFieldValue('regionId', user.regionId?.toString() || '');
        }
    }, [open, user, form]);

    const defaultTrigger = isEdit ? (
        <Button variant="ghost" size="sm">
            <Pencil className="w-4 h-4" />
        </Button>
    ) : (
        <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add User
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update user information.' : 'Fill in the details to add a new user.'}
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form.Field
                        name="name"
                        validators={{
                            onChange: userSchema.shape.name,
                        }}
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>Full Name</FieldLabel>
                                <FieldContent>
                                    <Input
                                        placeholder="e.g., John Doe"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className={field.state.meta.errors.length ? 'border-destructive' : ''}
                                    />
                                </FieldContent>
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    </form.Field>

                    <form.Field
                        name="email"
                        validators={{
                            onChange: userSchema.shape.email,
                        }}
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>Email</FieldLabel>
                                <FieldContent>
                                    <Input
                                        type="email"
                                        placeholder="e.g., john@sekawan.com"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={isEdit}
                                        className={field.state.meta.errors.length ? 'border-destructive' : ''}
                                    />
                                </FieldContent>
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    </form.Field>

                    {!isEdit && (
                        <form.Field
                            name="password"
                            validators={{
                                onChange: userSchema.shape.password,
                            }}
                        >
                            {(field) => (
                                <Field>
                                    <FieldLabel>Password</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            type="password"
                                            placeholder="Enter password"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className={field.state.meta.errors.length ? 'border-destructive' : ''}
                                        />
                                    </FieldContent>
                                    <FieldError errors={field.state.meta.errors} />
                                </Field>
                            )}
                        </form.Field>
                    )}

                    <form.Field
                        name="role"
                        validators={{
                            onChange: userSchema.shape.role,
                        }}
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>Role</FieldLabel>
                                <FieldContent>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(value) => field.handleChange(value as 'ADMIN' | 'APPROVER_L1' | 'APPROVER_L2')}
                                    >
                                        <SelectTrigger className={field.state.meta.errors.length ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                            <SelectItem value="APPROVER_L1">Approver L1</SelectItem>
                                            <SelectItem value="APPROVER_L2">Approver L2</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldContent>
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    </form.Field>

                    <form.Field
                        name="regionId"
                        validators={{
                            onChange: userSchema.shape.regionId,
                        }}
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>Region (Optional)</FieldLabel>
                                <FieldContent>
                                    <Select
                                        value={field.state.value || 'undefined_region'}
                                        onValueChange={(value) => field.handleChange(value === 'undefined_region' ? '' : value)}
                                    >
                                        <SelectTrigger className={field.state.meta.errors.length ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="undefined_region">No region</SelectItem>
                                            {regions?.map((region) => (
                                                <SelectItem key={region.id} value={region.id.toString()}>
                                                    {region.name} ({region.type})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FieldContent>
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    </form.Field>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createUser.isPending || updateUser.isPending}
                        >
                            {(createUser.isPending || updateUser.isPending) ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                isEdit ? 'Save Changes' : 'Add User'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
