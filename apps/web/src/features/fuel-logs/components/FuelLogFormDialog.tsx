import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
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
import { useVehicles } from '@/features/vehicles/api/vehicles';
import { useCreateFuelLog, useUpdateFuelLog, type FuelLog, type CreateFuelLogInput } from '../api/fuel-logs';
import { z } from 'zod';

const fuelLogSchema = z.object({
    vehicleId: z.string().min(1, 'Vehicle is required'),
    date: z.string().min(1, 'Date is required'),
    liters: z.string().min(1, 'Liters is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Must be a positive number'),
    cost: z.string().min(1, 'Cost is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Must be a positive number'),
    odometerReading: z.string().min(1, 'Odometer is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Must be a positive number'),
});

interface FuelLogFormDialogProps {
    fuelLog?: FuelLog;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

export function FuelLogFormDialog({ fuelLog, trigger, open: controlledOpen, onOpenChange: setControlledOpen, onSuccess }: FuelLogFormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEdit = !!fuelLog;

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

    const { data: vehicles } = useVehicles();
    const createFuelLog = useCreateFuelLog();
    const updateFuelLog = useUpdateFuelLog();

    const form = useForm({
        defaultValues: {
            vehicleId: fuelLog?.vehicleId?.toString() || '',
            date: fuelLog?.loggedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
            liters: fuelLog?.liters?.toString() || '',
            cost: fuelLog?.cost?.toString() || '',
            odometerReading: fuelLog?.odometer?.toString() || '',
        },
        onSubmit: async ({ value }) => {
            setError(null);
            try {
                const payload: CreateFuelLogInput = {
                    vehicleId: parseInt(value.vehicleId),
                    date: value.date,
                    liters: parseFloat(value.liters),
                    cost: parseFloat(value.cost),
                    odometerReading: parseInt(value.odometerReading),
                };

                if (isEdit && fuelLog) {
                    await updateFuelLog.mutateAsync({ id: fuelLog.id, data: payload });
                    toast.success('Fuel log updated successfully');
                } else {
                    await createFuelLog.mutateAsync(payload);
                    toast.success('Fuel log added successfully');
                }

                setOpen(false);
                form.reset();
                onSuccess?.();
            } catch (err: any) {
                const message = err.response?.data?.message || 'Failed to save fuel log';
                setError(message);
                toast.error(message);
            }
        },
    });

    const defaultTrigger = isEdit ? (
        <Button variant="ghost" size="sm">
            <Pencil className="w-4 h-4" />
        </Button>
    ) : (
        <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Fuel Log
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Fuel Log' : 'Add Fuel Log'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update fuel log information.' : 'Record a new fuel fill-up.'}
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
                        name="vehicleId"
                        validators={{
                            onChange: fuelLogSchema.shape.vehicleId,
                        }}
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>Vehicle</FieldLabel>
                                <FieldContent>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(value) => field.handleChange(value)}
                                        disabled={isEdit}
                                    >
                                        <SelectTrigger className={field.state.meta.errors.length ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select vehicle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicles?.map((v) => (
                                                <SelectItem key={v.id} value={v.id.toString()}>
                                                    {v.plateNumber} - {v.brand} {v.model}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FieldContent>
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    </form.Field>

                    <form.Field
                        name="date"
                        validators={{
                            onChange: fuelLogSchema.shape.date,
                        }}
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>Date</FieldLabel>
                                <FieldContent>
                                    <DatePicker
                                        date={field.state.value ? new Date(field.state.value) : undefined}
                                        setDate={(date) => field.handleChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholder="Pick date"
                                    />
                                </FieldContent>
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-4">
                        <form.Field
                            name="liters"
                            validators={{
                                onChange: fuelLogSchema.shape.liters,
                            }}
                        >
                            {(field) => (
                                <Field>
                                    <FieldLabel>Liters</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="e.g., 50.5"
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
                            name="cost"
                            validators={{
                                onChange: fuelLogSchema.shape.cost,
                            }}
                        >
                            {(field) => (
                                <Field>
                                    <FieldLabel>Cost (Rp)</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            type="number"
                                            placeholder="e.g., 500000"
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

                    <form.Field
                        name="odometerReading"
                        validators={{
                            onChange: fuelLogSchema.shape.odometerReading,
                        }}
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>Odometer Reading (km)</FieldLabel>
                                <FieldContent>
                                    <Input
                                        type="number"
                                        placeholder="e.g., 45000"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className={field.state.meta.errors.length ? 'border-destructive' : ''}
                                    />
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
                            disabled={createFuelLog.isPending || updateFuelLog.isPending}
                        >
                            {(createFuelLog.isPending || updateFuelLog.isPending) ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                isEdit ? 'Save Changes' : 'Add Log'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
