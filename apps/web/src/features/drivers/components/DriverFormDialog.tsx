import { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
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
import { useCreateDriver, useUpdateDriver, type Driver, type CreateDriverInput } from '../api/drivers';
import { z } from 'zod';

const driverSchema = z.object({
    name: z.string().min(1, 'Full Name is required'),
    licenseNumber: z.string().min(1, 'License Number is required'),
    phone: z.string().min(1, 'Phone Number is required').regex(/^\d+$/, 'Phone number must contain only digits'),
    regionId: z.string().min(1, 'Region is required'),
});

interface DriverFormDialogProps {
    driver?: Driver;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

export function DriverFormDialog({ driver, trigger, open: controlledOpen, onOpenChange: setControlledOpen, onSuccess }: DriverFormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEdit = !!driver;

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
    const createDriver = useCreateDriver();
    const updateDriver = useUpdateDriver();

    const form = useForm({
        defaultValues: {
            name: driver?.name || '',
            licenseNumber: driver?.licenseNumber || '',
            phone: driver?.phone || '',
            regionId: driver?.regionId?.toString() || '',
        },
        onSubmit: async ({ value }) => {
            setError(null);
            try {
                const payload: CreateDriverInput = {
                    name: value.name,
                    licenseNumber: value.licenseNumber,
                    phone: value.phone,
                    regionId: parseInt(value.regionId),
                };

                if (isEdit && driver) {
                    await updateDriver.mutateAsync({ id: driver.id, data: payload });
                } else {
                    await createDriver.mutateAsync(payload);
                }

                setOpen(false);
                form.reset();
                onSuccess?.();
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to save driver');
            }
        },
    });

    // Reset form when driver changes or dialog opens
    useEffect(() => {
        if (open && driver) {
            form.setFieldValue('name', driver.name);
            form.setFieldValue('licenseNumber', driver.licenseNumber);
            form.setFieldValue('phone', driver.phone);
            form.setFieldValue('regionId', driver.regionId?.toString() || '');
        }
    }, [open, driver]);

    const defaultTrigger = isEdit ? (
        <Button variant="ghost" size="sm">
            <Pencil className="w-4 h-4" />
        </Button>
    ) : (
        <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Driver
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update driver information.' : 'Fill in the details to add a new driver.'}
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
                            onChange: driverSchema.shape.name,
                        }}
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>Full Name</FieldLabel>
                                <FieldContent>
                                    <Input
                                        placeholder="e.g., Ahmad Suryadi"
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
                        name="licenseNumber"
                        validators={{
                            onChange: driverSchema.shape.licenseNumber,
                        }}
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>License Number</FieldLabel>
                                <FieldContent>
                                    <Input
                                        placeholder="e.g., SIM-123456789"
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
                        name="phone"
                        validators={{
                            onChange: driverSchema.shape.phone,
                        }}
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>Phone Number</FieldLabel>
                                <FieldContent>
                                    <Input
                                        placeholder="e.g., 081234567890"
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
                        name="regionId"
                        validators={{
                            onChange: driverSchema.shape.regionId,
                        }}
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>Region</FieldLabel>
                                <FieldContent>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(value) => field.handleChange(value)}
                                    >
                                        <SelectTrigger className={field.state.meta.errors.length ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select region" />
                                        </SelectTrigger>
                                        <SelectContent>
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
                            disabled={createDriver.isPending || updateDriver.isPending}
                        >
                            {(createDriver.isPending || updateDriver.isPending) ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                isEdit ? 'Save Changes' : 'Add Driver'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
