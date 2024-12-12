

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from "~/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "~/components/ui/chart";

const chartData = [
    { type: "count", lecturers: 4, students: 80 },
];

const chartConfig = {
    lecturers: {
        label: "Lecturers",
        color: "hsl(var(--chart-1))",
    },
    students: {
        label: "Students",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

export function GradientChart() {
    return (
        <Card>
            <CardHeader>
                <CardDescription>
                    Showing total count for organisational data
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart
                        data={chartData}
                        margin={{ left: 12, right: 12 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="type"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />
                        <defs>
                            <linearGradient id="fillLecturers" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="hsl(var(--chart-1))"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="hsl(var(--chart-1))"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillStudents" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="hsl(var(--chart-2))"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="hsl(var(--chart-2))"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="lecturers"
                            type="natural"
                            fill="url(#fillLecturers)"
                            stroke="hsl(var(--chart-1))"
                            stackId="a"
                        />
                        <Area
                            dataKey="students"
                            type="natural"
                            fill="url(#fillStudents)"
                            stroke="hsl(var(--chart-2))"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
