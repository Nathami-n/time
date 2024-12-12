
import { LabelList, RadialBar, RadialBarChart } from "recharts";

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
    Lecturers: {
        label: "Lecturers",
        color: "hsl(var(--chart-2))",
    },
    Students: {
        label: "Students",
        color: "hsl(var(--chart-4))"
    },
    Departments: {
        label: "Departments",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export function Component({
    chartData
}:{
    chartData: Array<{name: string, value: number, fill: string}>
}) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
            <CardTitle>Pie Chart - 
                Radial         </CardTitle>
            <CardDescription>A radial representaion of the data</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <RadialBarChart
                        data={chartData}
                        startAngle={-90}
                        endAngle={270}
                        innerRadius={30}
                        outerRadius={110}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent hideLabel nameKey="name" />
                            }
                        />
                        <RadialBar
                            dataKey="value"
                            background
                        >
                            <LabelList
                                position="insideStart"
                                dataKey="name"
                                className="fill-white capitalize mix-blend-luminosity"
                                fontSize={11}
                            />
                        </RadialBar>
                    </RadialBarChart>
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
