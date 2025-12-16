import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
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
import { useCreateBooking, useUpdateBooking, type Booking } from '../api/bookings';
import { useDrivers } from '@/features/drivers/api/drivers';
import { useApproversL1, useApproversL2 } from '@/features/users/api/users';
import { useAuthStore } from '@/lib/auth';
import { z } from 'zod';

const bookingSchema = z.object({
    vehicleId: z.string().min(1, 'Vehicle is required'),
    driverId: z.string().min(1, 'Driver is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    purpose: z.string().min(1, 'Purpose is required'),
    approverL1Id: z.string().min(1, 'Approver Level 1 is required'),
    approverL2Id: z.string().min(1, 'Approver Level 2 is required'),
});

interface BookingFormDialogProps {
    booking?: Booking;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

export function BookingFormDialog({ booking, trigger, open: controlledOpen, onOpenChange: setControlledOpen, onSuccess }: BookingFormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEdit = !!booking;

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

    useAuthStore();

    const { data: vehicles } = useVehicles();
    const { data: drivers } = useDrivers();
    const { data: approversL1 } = useApproversL1();
    const { data: approversL2 } = useApproversL2();

    const createBooking = useCreateBooking();
    const updateBooking = useUpdateBooking();

    const form = useForm({
        defaultValues: {
            vehicleId: booking?.vehicleId?.toString() || '',
            driverId: booking?.driverId?.toString() || '',
            startDate: booking?.startDate?.split('T')[0] || '',
            endDate: booking?.endDate?.split('T')[0] || '',
            purpose: booking?.purpose || '',
            approverL1Id: booking?.approverL1Id?.toString() || '',
            approverL2Id: booking?.approverL2Id?.toString() || '',
        },
        onSubmit: async ({ value }) => {
            setError(null);
            try {
                if (isEdit && booking) {
                    // Only send updated fields or specific fields allowed for update
                    await updateBooking.mutateAsync({
                        id: booking.id,
                        data: {
                            startDate: new Date(value.startDate).toISOString(),
                            endDate: new Date(value.endDate).toISOString(),
                            purpose: value.purpose,
                        }
                    });
                    toast.success('Booking updated successfully');
                } else {
                    await createBooking.mutateAsync({
                        vehicleId: parseInt(value.vehicleId),
                        driverId: parseInt(value.driverId),
                        startDate: new Date(value.startDate).toISOString(),
                        endDate: new Date(value.endDate).toISOString(),
                        purpose: value.purpose,
                        approverL1Id: parseInt(value.approverL1Id),
                        approverL2Id: parseInt(value.approverL2Id),
                    });
                    toast.success('Booking created successfully');
                }

                setOpen(false);
                form.reset();
                onSuccess?.();
            } catch (err: any) {
                const message = err.response?.data?.message || 'Failed to save booking';
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
            New Booking
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Booking' : 'Create New Booking'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update your booking details.' : 'Fill in the details to request a vehicle booking.'}
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e: React.FormEvent) => {
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

                    {!isEdit && (
                        <div className="grid grid-cols-2 gap-4">
                            <form.Field
                                name="vehicleId"
                                validators={{
                                    onChange: bookingSchema.shape.vehicleId,
                                }}
                            >
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Vehicle</FieldLabel>
                                        <FieldContent>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={(value) => field.handleChange(value)}
                                            >
                                                <SelectTrigger className={field.state.meta.errors.length ? 'border-destructive' : ''}>
                                                    <SelectValue placeholder="Select vehicle" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vehicles?.filter(v => v.status === 'AVAILABLE').map((v) => (
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
                                name="driverId"
                                validators={{
                                    onChange: bookingSchema.shape.driverId,
                                }}
                            >
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Driver</FieldLabel>
                                        <FieldContent>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={(value) => field.handleChange(value)}
                                            >
                                                <SelectTrigger className={field.state.meta.errors.length ? 'border-destructive' : ''}>
                                                    <SelectValue placeholder="Select driver" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {drivers?.filter(d => d.status === 'AVAILABLE').map((d) => (
                                                        <SelectItem key={d.id} value={d.id.toString()}>
                                                            {d.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FieldContent>
                                        <FieldError errors={field.state.meta.errors} />
                                    </Field>
                                )}
                            </form.Field>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <form.Field
                            name="startDate"
                            validators={{
                                onChange: bookingSchema.shape.startDate,
                            }}
                        >
                            {(field) => (
                                <Field>
                                    <FieldLabel>Start Date</FieldLabel>
                                    <FieldContent>
                                        <DatePicker
                                            date={field.state.value ? new Date(field.state.value) : undefined}
                                            setDate={(date) => field.handleChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            placeholder="Pick start date"
                                        />
                                    </FieldContent>
                                    <FieldError errors={field.state.meta.errors} />
                                </Field>
                            )}
                        </form.Field>

                        <form.Field
                            name="endDate"
                            validators={{
                                onChange: bookingSchema.shape.endDate,
                            }}
                        >
                            {(field) => (
                                <Field>
                                    <FieldLabel>End Date</FieldLabel>
                                    <FieldContent>
                                        <DatePicker
                                            date={field.state.value ? new Date(field.state.value) : undefined}
                                            setDate={(date) => field.handleChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            placeholder="Pick end date"
                                        />
                                    </FieldContent>
                                    <FieldError errors={field.state.meta.errors} />
                                </Field>
                            )}
                        </form.Field>
                    </div>

                    <form.Field
                        name="purpose"
                        validators={{
                            onChange: bookingSchema.shape.purpose,
                        }}
                    >
                        {(field) => (
                            <Field>
                                <FieldLabel>Purpose/Destination</FieldLabel>
                                <FieldContent>
                                    <Textarea
                                        placeholder="e.g., Site visit to Mine A"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className={field.state.meta.errors.length ? 'border-destructive' : ''}
                                    />
                                </FieldContent>
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    </form.Field>

                    {!isEdit && (
                        <div className="grid grid-cols-2 gap-4">
                            <form.Field
                                name="approverL1Id"
                                validators={{
                                    onChange: bookingSchema.shape.approverL1Id,
                                }}
                            >
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Approver Level 1</FieldLabel>
                                        <FieldContent>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={(value) => field.handleChange(value)}
                                            >
                                                <SelectTrigger className={field.state.meta.errors.length ? 'border-destructive' : ''}>
                                                    <SelectValue placeholder="Select approver" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {approversL1?.map((u) => (
                                                        <SelectItem key={u.id} value={u.id.toString()}>
                                                            {u.name} ({u.regionName})
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
                                name="approverL2Id"
                                validators={{
                                    onChange: bookingSchema.shape.approverL2Id,
                                }}
                            >
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Approver Level 2</FieldLabel>
                                        <FieldContent>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={(value) => field.handleChange(value)}
                                            >
                                                <SelectTrigger className={field.state.meta.errors.length ? 'border-destructive' : ''}>
                                                    <SelectValue placeholder="Select approver" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {approversL2?.map((u) => (
                                                        <SelectItem key={u.id} value={u.id.toString()}>
                                                            {u.name} ({u.regionName})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FieldContent>
                                        <FieldError errors={field.state.meta.errors} />
                                    </Field>
                                )}
                            </form.Field>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createBooking.isPending || updateBooking.isPending}
                        >
                            {(createBooking.isPending || updateBooking.isPending) ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                isEdit ? 'Save Changes' : 'Create Booking'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
