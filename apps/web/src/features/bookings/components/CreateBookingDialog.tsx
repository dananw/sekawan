import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { format } from 'date-fns';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useAvailableVehicles } from '@/features/vehicles/api/vehicles';
import { useAvailableDrivers } from '@/features/drivers/api/drivers';
import { useApproversL1, useApproversL2 } from '@/features/users/api/users';
import { useCreateBooking } from '../api/bookings';

interface CreateBookingDialogProps {
    onSuccess?: () => void;
}

export function CreateBookingDialog({ onSuccess }: CreateBookingDialogProps) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: vehicles } = useAvailableVehicles();
    const { data: drivers } = useAvailableDrivers();
    const { data: approversL1 } = useApproversL1();
    const { data: approversL2 } = useApproversL2();
    const createBooking = useCreateBooking();

    const form = useForm({
        defaultValues: {
            vehicleId: '',
            driverId: '',
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
            purpose: '',
            approverL1Id: '',
            approverL2Id: '',
        },
        onSubmit: async ({ value }) => {
            setError(null);
            try {
                await createBooking.mutateAsync({
                    vehicleId: parseInt(value.vehicleId),
                    driverId: parseInt(value.driverId),
                    startDate: new Date(value.startDate).toISOString(),
                    endDate: new Date(value.endDate).toISOString(),
                    purpose: value.purpose,
                    approverL1Id: parseInt(value.approverL1Id),
                    approverL2Id: parseInt(value.approverL2Id),
                });
                setOpen(false);
                form.reset();
                onSuccess?.();
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to create booking');
            }
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Booking
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Booking</DialogTitle>
                    <DialogDescription>
                        Fill in the details to request a vehicle booking.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form.Field name="vehicleId">
                        {(field) => (
                            <div className="space-y-2">
                                <Label>Vehicle</Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(value) => field.handleChange(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a vehicle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicles?.map((vehicle) => (
                                            <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                                {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="driverId">
                        {(field) => (
                            <div className="space-y-2">
                                <Label>Driver</Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(value) => field.handleChange(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a driver" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {drivers?.map((driver) => (
                                            <SelectItem key={driver.id} value={driver.id.toString()}>
                                                {driver.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-4">
                        <form.Field name="startDate">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <DatePicker
                                        date={field.state.value ? new Date(field.state.value) : undefined}
                                        setDate={(date) => field.handleChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholder="Pick start date"
                                    />
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="endDate">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <DatePicker
                                        date={field.state.value ? new Date(field.state.value) : undefined}
                                        setDate={(date) => field.handleChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholder="Pick end date"
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>

                    <form.Field name="purpose">
                        {(field) => (
                            <div className="space-y-2">
                                <Label>Purpose</Label>
                                <Input
                                    placeholder="e.g., Site inspection at Mine A"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="approverL1Id">
                        {(field) => (
                            <div className="space-y-2">
                                <Label>Level 1 Approver</Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(value) => field.handleChange(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select L1 approver" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {approversL1?.map((approver) => (
                                            <SelectItem key={approver.id} value={approver.id.toString()}>
                                                {approver.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="approverL2Id">
                        {(field) => (
                            <div className="space-y-2">
                                <Label>Level 2 Approver</Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(value) => field.handleChange(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select L2 approver" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {approversL2?.map((approver) => (
                                            <SelectItem key={approver.id} value={approver.id.toString()}>
                                                {approver.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </form.Field>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createBooking.isPending}
                        >
                            {createBooking.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                'Create Booking'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
