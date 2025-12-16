import { Car, Users, CalendarCheck, Clock, TrendingUp, Fuel } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
    { name: 'Total Vehicles', value: '8', icon: Car, change: '+2', changeType: 'increase' },
    { name: 'Active Drivers', value: '6', icon: Users, change: '0', changeType: 'neutral' },
    { name: 'Pending Approvals', value: '1', icon: Clock, change: '+1', changeType: 'increase' },
    { name: 'Active Bookings', value: '3', icon: CalendarCheck, change: '+2', changeType: 'increase' },
];

export function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview of your fleet management system</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <stat.icon className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <TrendingUp className={`w-4 h-4 mr-1 ${stat.changeType === 'increase' ? 'text-green-500' :
                                        stat.changeType === 'decrease' ? 'text-red-500' :
                                            'text-gray-400'
                                    }`} />
                                <span className={
                                    stat.changeType === 'increase' ? 'text-green-600' :
                                        stat.changeType === 'decrease' ? 'text-red-600' :
                                            'text-gray-500'
                                }>
                                    {stat.change} from last month
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarCheck className="w-5 h-5 text-blue-600" />
                            Booking Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <p className="text-gray-400">Chart will be displayed here</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Fuel className="w-5 h-5 text-blue-600" />
                            Fuel Consumption
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <p className="text-gray-400">Chart will be displayed here</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent activity */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { id: 1, vehicle: 'B 1234 ABC - Toyota Hilux', purpose: 'Site inspection at Mine A', status: 'Pending', date: 'Tomorrow' },
                            { id: 2, vehicle: 'B 5678 DEF - Toyota Innova', purpose: 'Client meeting in Jakarta', status: 'Completed', date: '3 days ago' },
                            { id: 3, vehicle: 'DK 1111 GHI - Mitsubishi Pajero', purpose: 'Equipment transport to Mine B', status: 'Approved', date: 'Next week' },
                        ].map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{booking.vehicle}</p>
                                    <p className="text-sm text-gray-500">{booking.purpose}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${booking.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {booking.status}
                                    </span>
                                    <p className="text-xs text-gray-400 mt-1">{booking.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
