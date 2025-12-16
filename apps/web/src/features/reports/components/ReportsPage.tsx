import { useState, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { Download, Loader2, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useBookingsReport, useReportSummary, exportToExcel, type ReportFilters } from '../api/reports';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';

const statusLabels: Record<string, string> = {
    PENDING_L1: 'Pending L1',
    PENDING_L2: 'Pending L2',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

const statusVariants: Record<string, 'success' | 'warning' | 'secondary' | 'destructive'> = {
    PENDING_L1: 'warning',
    PENDING_L2: 'warning',
    APPROVED: 'success',
    REJECTED: 'destructive',
    COMPLETED: 'secondary',
    CANCELLED: 'secondary',
};

export function ReportsPage() {
    const [filters, setFilters] = useState<ReportFilters>({
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        status: '',
    });
    const [isExporting, setIsExporting] = useState(false);

    const { data: reportData, isLoading } = useBookingsReport(filters);
    const { data: summary } = useReportSummary(filters);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportToExcel(filters);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => <span className="font-mono">#{row.original.id}</span>,
        },
        {
            id: 'vehicle',
            header: 'Vehicle',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.vehiclePlate}</p>
                    <p className="text-xs text-gray-500">{row.original.vehicleBrand} {row.original.vehicleModel}</p>
                </div>
            ),
        },
        {
            accessorKey: 'driverName',
            header: 'Driver',
        },
        {
            accessorKey: 'vehicleType',
            header: 'Type',
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.vehicleType}</Badge>
            ),
        },
        {
            accessorKey: 'purpose',
            header: 'Purpose',
            cell: ({ row }) => <div className="max-w-[200px] truncate" title={row.original.purpose}>{row.original.purpose}</div>,
        },
        {
            id: 'dateRange',
            header: 'Date Range',
            cell: ({ row }) => (
                <div className="text-sm">
                    <p>{format(new Date(row.original.startDate), 'dd MMM')}</p>
                    <p className="text-gray-400">to {format(new Date(row.original.endDate), 'dd MMM yyyy')}</p>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={statusVariants[row.original.status] || 'secondary'}>
                    {statusLabels[row.original.status] || row.original.status}
                </Badge>
            ),
        },
    ], []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                    <p className="text-gray-500 mt-1">Generate and export booking reports</p>
                </div>
                <Button
                    onClick={handleExport}
                    disabled={isExporting || !reportData?.length}
                    className="bg-green-600 hover:bg-green-700"
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4 mr-2" />
                            Export Excel
                        </>
                    )}
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <DatePicker
                                date={filters.startDate ? new Date(filters.startDate) : undefined}
                                setDate={(date) => setFilters({ ...filters, startDate: date ? format(date, 'yyyy-MM-dd') : '' })}
                                placeholder="Pick start date"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <DatePicker
                                date={filters.endDate ? new Date(filters.endDate) : undefined}
                                setDate={(date) => setFilters({ ...filters, endDate: date ? format(date, 'yyyy-MM-dd') : '' })}
                                placeholder="Pick end date"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? '' : value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="PENDING_L1">Pending L1</SelectItem>
                                    <SelectItem value="PENDING_L2">Pending L2</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                onClick={() => setFilters({ startDate: '', endDate: '', status: '' })}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-gray-500">Total Bookings</div>
                            <div className="text-2xl font-bold">{summary.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-gray-500">Approved</div>
                            <div className="text-2xl font-bold text-green-600">{summary.byStatus.APPROVED}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-gray-500">Completed</div>
                            <div className="text-2xl font-bold text-blue-600">{summary.byStatus.COMPLETED}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-gray-500">Rejected</div>
                            <div className="text-2xl font-bold text-red-600">{summary.byStatus.REJECTED}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Report Table */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : reportData?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>No bookings found for the selected filters</p>
                </div>
            ) : (
                <DataTable columns={columns} data={reportData || []} />
            )}
        </div>
    );
}
