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
import { useCreateServiceSchedule, useUpdateServiceSchedule, type ServiceSchedule, type CreateServiceScheduleInput } from '../api/service-schedules';
import { z } from 'zod';

const scheduleSchema = z.object({
    vehicleId: z.string().min(1, 'Vehicle is required'),
    serviceType: z.enum(['OIL_CHANGE', 'TIRE_ROTATION', 'BRAKE_SERVICE', 'FULL_SERVICE', 'OTHER'], { errorMap: () => ({ message: 'Service type is required' }) }),
    scheduledDate: z.string().min(1, 'Scheduled date is required'),
    description: z.string(),
    cost: z.number().optional(),
    odometerReading: z.number().optional(),
});

interface ServiceScheduleFormDialogProps {
    schedule?: ServiceSchedule;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ServiceScheduleFormDialog({ schedule, trigger, open: controlledOpen, onOpenChange: setControlledOpen, onSuccess }: ServiceScheduleFormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEdit = !!schedule;

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
    const createSchedule = useCreateServiceSchedule();
    const updateSchedule = useUpdateServiceSchedule();

    const form = useForm({
        defaultValues: {
            vehicleId: schedule?.vehicleId?.toString() || '',
            serviceType: schedule?.type || 'OIL_CHANGE',
            scheduledDate: schedule?.scheduledDate?.split('T')[0] || '',
            description: schedule?.description || '',
            cost: schedule?.cost !== undefined ? schedule.cost.toString() : '',
            odometerReading: schedule?.odometerReading !== undefined ? schedule.odometerReading.toString() : '',
        },
        onSubmit: async ({ value }) => {
            setError(null);
            try {
                const payload: CreateServiceScheduleInput = {
                    vehicleId: parseInt(value.vehicleId),
                    serviceType: value.serviceType as 'OIL_CHANGE' | 'TIRE_ROTATION' | 'BRAKE_SERVICE' | 'FULL_SERVICE' | 'OTHER',
                    scheduledDate: value.scheduledDate,
                    description: value.description || undefined,
                    cost: value.cost ? parseFloat(value.cost) : undefined,
                    odometerReading: value.odometerReading ? parseInt(value.odometerReading) : undefined,
                };

                if (isEdit && schedule) {
                    await updateSchedule.mutateAsync({ id: schedule.id, data: payload });
                    toast.success('Schedule updated successfully');
                } else {
                    await createSchedule.mutateAsync(payload);
                    toast.success('Schedule created successfully');
                }

                setOpen(false);
                form.reset();
                onSuccess?.();
            } catch (err: any) {
                const message = err.response?.data?.message || 'Failed to save schedule';
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
            Add Schedule
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Schedule' : 'Add Service Schedule'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update service schedule.' : 'Schedule a new service for a vehicle.'}
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
                            onChange: scheduleSchema.shape.vehicleId,
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
                        name="serviceType"
                        validators={{
                            onChange: scheduleSchema.shape.serviceType,
                        }}
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>Service Type</FieldLabel>
                                <FieldContent>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(value) => field.handleChange(value as 'OIL_CHANGE' | 'TIRE_ROTATION' | 'BRAKE_SERVICE' | 'FULL_SERVICE' | 'OTHER')}
                                    >
                                        <SelectTrigger className={field.state.meta.errors.length ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OIL_CHANGE">Oil Change</SelectItem>
                                            <SelectItem value="TIRE_ROTATION">Tire Rotation</SelectItem>
                                            <SelectItem value="BRAKE_SERVICE">Brake Service</SelectItem>
                                            <SelectItem value="FULL_SERVICE">Full Service</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldContent>
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    </form.Field>

                    <form.Field
                        name="scheduledDate"
                        validators={{
                            onChange: scheduleSchema.shape.scheduledDate,
                        }}
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>Scheduled Date</FieldLabel>
                                <FieldContent>
                                    <DatePicker
                                        date={field.state.value ? new Date(field.state.value) : undefined}
                                        setDate={(date) => field.handleChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholder="Pick scheduled date"
                                    />
                                </FieldContent>
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-4">
                        <form.Field
                            name="cost"
                        >
                            {(field) => (
                                <Field>
                                    <FieldLabel>Estimated Cost</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            type="number"
                                            placeholder="0"
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
                            name="odometerReading"
                        >
                            {(field) => (
                                <Field>
                                    <FieldLabel>Odometer (km)</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            type="number"
                                            placeholder="0"
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
                        name="description"
                        validators={{
                            onChange: scheduleSchema.shape.description,
                        }}
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>Description</FieldLabel>
                                <FieldContent>
                                    <Input
                                        placeholder="e.g., Oil change and filter replacement"
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
                            disabled={createSchedule.isPending || updateSchedule.isPending}
                        >
                            {(createSchedule.isPending || updateSchedule.isPending) ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                isEdit ? 'Save Changes' : 'Create Schedule'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
