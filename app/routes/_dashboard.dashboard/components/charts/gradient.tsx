

import { TrendingUp } from "lucide-react";
import { Pie, PieChart, Sector } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "~/components/ui/chart";


const chartConfig = {
    lecturers: {
        label: "Lecturers",
        color: "hsl(var(--chart-2))",
    },
    departments: {
        label: "Departments",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export function Doughnut({
    chartData
}: {
    chartData: Array<{ name: string, value: number, fill: string }>
}) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Pie Chart - Donut Active</CardTitle>
                <CardDescription>A donut representaion of the data</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                            activeIndex={0}
                            activeShape={(props) => (
                                <Sector {...props} outerRadius={(props.outerRadius || 0) + 10} />
                            )}
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="leading-none text-muted-foreground">
                    Showing total data count for the entire period
                </div>
            </CardFooter>

        </Card>
    );
}