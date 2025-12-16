import { useParams } from '@tanstack/react-router';
import { useVehicle } from '@/features/vehicles/api/vehicles';
import { useBookings } from '@/features/bookings/api/bookings';
import { useFuelLogsByVehicle } from '@/features/fuel-logs/api/fuel-logs';
import { useServiceSchedulesByVehicle } from '@/features/service-schedules/api/service-schedules';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Fuel, Wrench, ArrowLeft } from 'lucide-react';
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

export function VehicleDetailPage() {
    const { id } = useParams({ from: '/dashboard-layout/vehicles/$id' });
    const vehicleId = parseInt(id);

    const { data: vehicle, isLoading } = useVehicle(vehicleId);
    const { data: bookings } = useBookings({ vehicleId });
    const { data: fuelLogs } = useFuelLogsByVehicle(vehicleId);
    const { data: services } = useServiceSchedulesByVehicle(vehicleId);

    if (isLoading) return <div>Loading...</div>;
    if (!vehicle) return <div>Vehicle not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/vehicles">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{vehicle.plateNumber}</h1>
                    <p className="text-gray-500">{vehicle.brand} {vehicle.model}</p>
                </div>
                <Badge className="ml-auto" variant={vehicle.status === 'AVAILABLE' ? 'success' : 'secondary'}>
                    {vehicle.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-500">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Type</span>
                            <span className="font-medium">{vehicle.type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Ownership</span>
                            <span className="font-medium">{vehicle.ownership}</span>
                        </div>
                        {vehicle.rentalCompany && (
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Rental Co.</span>
                                <span className="font-medium">{vehicle.rentalCompany}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Region</span>
                            <span className="font-medium">{vehicle.regionName}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="history">
                <TabsList>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4" />
                        Booking History
                    </TabsTrigger>
                    <TabsTrigger value="fuel" className="flex items-center gap-2">
                        <Fuel className="w-4 h-4" />
                        Fuel Logs
                    </TabsTrigger>
                    <TabsTrigger value="service" className="flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        Service History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="history">
                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Driver</TableHead>
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
                                            <TableCell>{booking.driverName || '-'}</TableCell>
                                            <TableCell>{booking.purpose}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{booking.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {bookings?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-gray-500">
                                                No bookings found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="fuel">
                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Liters</TableHead>
                                        <TableHead>Cost</TableHead>
                                        <TableHead>Odometer</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fuelLogs?.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{format(new Date(log.loggedAt), 'dd MMM yyyy')}</TableCell>
                                            <TableCell>{log.liters} L</TableCell>
                                            <TableCell>Rp {log.cost.toLocaleString()}</TableCell>
                                            <TableCell>{log.odometer} km</TableCell>
                                        </TableRow>
                                    ))}
                                    {fuelLogs?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-gray-500">
                                                No fuel logs found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="service">
                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Service Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services?.map((service) => (
                                        <TableRow key={service.id}>
                                            <TableCell>{format(new Date(service.scheduledDate), 'dd MMM yyyy')}</TableCell>
                                            <TableCell>{service.type}</TableCell>
                                            <TableCell>{service.description}</TableCell>
                                            <TableCell>
                                                <Badge variant={service.status === 'COMPLETED' ? 'success' : 'warning'}>
                                                    {service.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {services?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-gray-500">
                                                No service records found
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
