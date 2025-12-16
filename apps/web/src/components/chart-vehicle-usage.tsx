"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A bar chart"

const chartConfig = {
    usage: {
        label: "Usage",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

interface VehicleUsageChartProps {
    data: {
        vehicleId: number;
        plateNumber: string | null;
        brand: string | null;
        model: string | null;
        usageCount: number;
    }[];
}

export function ChartVehicleUsage({ data }: VehicleUsageChartProps) {
    // Format data for chart
    const chartData = React.useMemo(() => {
        return data?.map(item => ({
            name: `${item.plateNumber} (${item.model})`,
            usage: item.usageCount,
        })) || []
    }, [data]);

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Vehicle Usage</CardTitle>
                <CardDescription>Top vehicles by booking count</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 10)} // Truncate long names
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="usage" fill="var(--color-usage)" radius={8} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
