import { useParams } from '@tanstack/react-router';
import { useDriver } from '@/features/drivers/api/drivers';
import { useBookings } from '@/features/bookings/api/bookings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarCheck, ArrowLeft, Phone, CreditCard } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export function DriverDetailPage() {
    const { id } = useParams({ from: '/dashboard-layout/drivers/$id' });
    const driverId = parseInt(id);

    const { data: driver, isLoading } = useDriver(driverId);
    const { data: bookings } = useBookings({ driverId });

    if (isLoading) return <div>Loading...</div>;
    if (!driver) return <div>Driver not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/drivers">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{driver.name}</h1>
                    <p className="text-gray-500">License: {driver.licenseNumber}</p>
                </div>
                <Badge className="ml-auto" variant={driver.status === 'AVAILABLE' ? 'success' : 'secondary'}>
                    {driver.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">Contact & Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{driver.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{driver.licenseNumber}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="text-sm text-gray-500">Region</span>
                            <span className="font-medium">{driver.regionName}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="history">
                <TabsList>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4" />
                        Assignment History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="history">
                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Vehicle</TableHead>
                                        <TableHead>Purpose</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings?.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell>
                                                {format(new Date(booking.startDate), 'dd MMM yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{booking.vehiclePlate}</p>
                                                    <p className="text-xs text-gray-400">{booking.vehicleBrand} {booking.vehicleModel}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{booking.purpose}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{booking.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {bookings?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-gray-500">
                                                No assignments found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
