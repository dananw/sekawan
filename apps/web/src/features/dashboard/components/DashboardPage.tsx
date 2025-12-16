import { Car, Users, CalendarCheck, Clock, Loader2 } from 'lucide-react';
import { useDashboardStats, useRecentBookings, useBookingTrends, useVehicleUsage } from '../api/dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { ChartVehicleUsage } from '@/components/chart-vehicle-usage';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PENDING_L1: 'destructive', // Warning/Orange
    PENDING_L2: 'destructive',
    APPROVED: 'default', // Success/Green
    REJECTED: 'destructive',
    COMPLETED: 'secondary',
    CANCELLED: 'outline',
};

export function DashboardPage() {
    const { data: stats, isLoading: statsLoading } = useDashboardStats();
    const { data: recentBookings } = useRecentBookings(5);
    const { data: bookingTrends } = useBookingTrends();
    const { data: vehicleUsage } = useVehicleUsage();

    // Transform trends data for the chart
    const chartData = bookingTrends?.map((item: any) => ({
        date: item.date,
        count: item.count
    })) || [];

    if (statsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const statCards = [
        {
            name: 'Total Vehicles',
            value: stats?.totalVehicles || 0,
            subValue: `${stats?.availableVehicles || 0} available`,
            icon: Car,
            className: 'text-blue-600',
        },
        {
            name: 'Total Drivers',
            value: stats?.totalDrivers || 0,
            subValue: `${stats?.availableDrivers || 0} available`,
            icon: Users,
            className: 'text-violet-600',
        },
        {
            name: 'Active Bookings',
            value: stats?.activeBookings || 0,
            subValue: 'Currently running',
            icon: CalendarCheck,
            className: 'text-emerald-600',
        },
        {
            name: 'Pending Approvals',
            value: stats?.pendingApprovals || 0,
            subValue: 'Awaiting action',
            icon: Clock,
            className: 'text-amber-600',
        },
    ];

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.name} className="relative overflow-hidden bg-gradient-to-br from-sidebar via-sidebar/50 to-background/50 shadow-sm">
                        <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-10">
                            <stat.icon className={`h-32 w-32 ${stat.className}`} />
                        </div>
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.name}
                            </CardTitle>
                            <stat.icon className={`h-6 w-6 ${stat.className}`} />
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.subValue}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <ChartAreaInteractive data={chartData} />
                </div>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>
                            Latest vehicle booking requests.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentBookings?.map((booking) => (
                                <div key={booking.id} className="flex items-center">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src="/avatars/01.png" alt="Avatar" />
                                        <AvatarFallback>{booking.driverName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{booking.driverName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {booking.vehiclePlate} ({booking.vehicleModel})
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        <Badge variant={statusVariants[booking.status] || 'secondary'}>
                                            {booking.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            {(!recentBookings || recentBookings.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">No recent bookings</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-7">
                    <ChartVehicleUsage data={vehicleUsage || []} />
                </div>
            </div>
        </>
    );
}
