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
import { useCreateVehicle, useUpdateVehicle, type Vehicle, type CreateVehicleInput } from '../api/vehicles';
import { z } from 'zod';

const vehicleSchema = z.object({
    plateNumber: z.string().min(1, 'Plate number is required'),
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().min(1, 'Model is required'),
    type: z.enum(['PASSENGER', 'CARGO'], { errorMap: () => ({ message: 'Type is required' }) }),
    ownership: z.enum(['COMPANY', 'RENTAL'], { errorMap: () => ({ message: 'Ownership is required' }) }),
    rentalCompany: z.string(),
    regionId: z.string().min(1, 'Region is required'),
}).refine((data) => {
    if (data.ownership === 'RENTAL' && !data.rentalCompany) {
        return false;
    }
    return true;
}, {
    message: 'Rental company is required when ownership is RENTAL',
    path: ['rentalCompany'],
});

interface VehicleFormDialogProps {
    vehicle?: Vehicle;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

export function VehicleFormDialog({ vehicle, trigger, open: controlledOpen, onOpenChange: setControlledOpen, onSuccess }: VehicleFormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEdit = !!vehicle;

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
    const createVehicle = useCreateVehicle();
    const updateVehicle = useUpdateVehicle();

    const form = useForm({
        defaultValues: {
            plateNumber: vehicle?.plateNumber || '',
            brand: vehicle?.brand || '',
            model: vehicle?.model || '',
            type: vehicle?.type || 'PASSENGER',
            ownership: vehicle?.ownership || 'COMPANY',
            rentalCompany: vehicle?.rentalCompany || '',
            regionId: vehicle?.regionId?.toString() || '',
        },
        validators: {
            onChange: vehicleSchema,
        },
        onSubmit: async ({ value }) => {
            setError(null);
            try {
                const payload: CreateVehicleInput = {
                    plateNumber: value.plateNumber,
                    brand: value.brand,
                    model: value.model,
                    type: value.type as 'PASSENGER' | 'CARGO',
                    ownership: value.ownership as 'COMPANY' | 'RENTAL',
                    rentalCompany: value.ownership === 'RENTAL' ? value.rentalCompany : undefined,
                    regionId: parseInt(value.regionId),
                };

                if (isEdit && vehicle) {
                    await updateVehicle.mutateAsync({ id: vehicle.id, data: payload });
                    toast.success('Vehicle updated successfully');
                } else {
                    await createVehicle.mutateAsync(payload);
                    toast.success('Vehicle added successfully');
                }

                setOpen(false);
                form.reset();
                onSuccess?.();
            } catch (err: any) {
                const message = err.response?.data?.message || 'Failed to save vehicle';
                setError(message);
                toast.error(message);
            }
        },
    });

    // Reset form when vehicle changes or dialog opens
    useEffect(() => {
        if (open && vehicle) {
            form.setFieldValue('plateNumber', vehicle.plateNumber);
            form.setFieldValue('brand', vehicle.brand);
            form.setFieldValue('model', vehicle.model);
            form.setFieldValue('type', vehicle.type);
            form.setFieldValue('ownership', vehicle.ownership);
            form.setFieldValue('rentalCompany', vehicle.rentalCompany || '');
            form.setFieldValue('regionId', vehicle.regionId?.toString() || '');
        }
    }, [open, vehicle]);

    const defaultTrigger = isEdit ? (
        <Button variant="ghost" size="sm">
            <Pencil className="w-4 h-4" />
        </Button>
    ) : (
        <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update vehicle information.' : 'Fill in the details to add a new vehicle.'}
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
                        name="plateNumber"
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>Plate Number</FieldLabel>
                                <FieldContent>
                                    <Input
                                        placeholder="e.g., B 1234 ABC"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className={field.state.meta.errors.length ? 'border-destructive' : ''}
                                    />
                                </FieldContent>
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-4">
                        <form.Field
                            name="brand"
                        >
                            {(field) => (
                                <Field>
                                    <FieldLabel>Brand</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            placeholder="e.g., Toyota"
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
                            name="model"
                        >
                            {(field) => (
                                <Field>
                                    <FieldLabel>Model</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            placeholder="e.g., Hilux"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className={field.state.meta.errors.length ? 'border-destructive' : ''}
                                        />
                                    </FieldContent>
                                    <FieldError errors={field.state.meta.errors} />
                                </Field>
                            )}
                        </form.Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <form.Field
                            name="type"
                        >
                            {(field) => (
                                <Field>
                                    <FieldLabel>Type</FieldLabel>
                                    <FieldContent>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={(value) => field.handleChange(value as 'PASSENGER' | 'CARGO')}
                                        >
                                            <SelectTrigger className={field.state.meta.errors.length ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PASSENGER">Passenger</SelectItem>
                                                <SelectItem value="CARGO">Cargo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FieldContent>
                                    <FieldError errors={field.state.meta.errors} />
                                </Field>
                            )}
                        </form.Field>

                        <form.Field
                            name="ownership"
                        >
                            {(field) => (
                                <Field>
                                    <FieldLabel>Ownership</FieldLabel>
                                    <FieldContent>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={(value) => field.handleChange(value as 'COMPANY' | 'RENTAL')}
                                        >
                                            <SelectTrigger className={field.state.meta.errors.length ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Select ownership" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="COMPANY">Company</SelectItem>
                                                <SelectItem value="RENTAL">Rental</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FieldContent>
                                    <FieldError errors={field.state.meta.errors} />
                                </Field>
                            )}
                        </form.Field>
                    </div>

                    <form.Subscribe selector={(state) => state.values.ownership}>
                        {(ownership) => ownership === 'RENTAL' && (
                            <form.Field
                                name="rentalCompany"
                            >
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Rental Company</FieldLabel>
                                        <FieldContent>
                                            <Input
                                                placeholder="e.g., PT Rental Jaya"
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
                    </form.Subscribe>

                    <form.Field
                        name="regionId"
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
                            disabled={createVehicle.isPending || updateVehicle.isPending}
                        >
                            {(createVehicle.isPending || updateVehicle.isPending) ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                isEdit ? 'Save Changes' : 'Add Vehicle'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
