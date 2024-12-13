import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { days } from "~/lib/data";
import { db } from "~/lib/db";
import { cn } from "~/lib/utils";
import { Clock, FileIcon, FileScanIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import jsfPdf from "jspdf";
import html2canvas from "html2canvas";
import { Popover, PopoverContent } from "~/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

type TimetableSlot = {
    day: string;
    slot: number;
    teacherId: number | null;
    unitId: number | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateTimetable(teachers: any[], units: any[]) {
    const slotsPerDay = 4;
    const startHour = 8;
    const slotDuration = 2;

    const timetable = [];
    let index = 0;
    for (const day of days) {
        for (let slot = 0; slot < slotsPerDay; slot++) {
            const unit = units[index % units.length];
            const teacher = teachers[index % teachers.length];
            const startTime = new Date();
            startTime.setHours(startHour + slot * slotDuration, 0, 0, 0);

            const endTime = new Date(startTime);
            endTime.setHours(startTime.getHours() + slotDuration);

            timetable.push({
                day,
                slot: slot + 1,
                unit,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                teacher,
            });
            index++;
        }
    }

    return timetable;
}

export const loader: LoaderFunction = async () => {
    if (!db) {
        throw new Error("database connection not found");
    }

    try {
        const [teachers, departments, units] = await db.$transaction([
            db.teacher.findMany({
                select: {
                    id: true,
                    department: true,
                    email: true,
                    name: true,
                    staff_no: true,
                    unit: true,
                    unitId: true,
                }
            }),
            db.department.findMany({
                select: {
                    name: true,
                    id: true,
                    Teacher: true,
                    Unit: true,
                    established: true,
                }
            }),
            db.unit.findMany({
                select: {
                    id: true,
                    unit_code: true,
                    department: true,
                    Teacher: true,
                }
            })
        ]);

        const timetable = generateTimetable(teachers, units);
        return Response.json({ teachers, departments, units, timetable }, {
            status: 200
        });
    } catch (error) {
        console.error("Error loading page:", error);
        return new Response(JSON.stringify({
            teachers: null,
            departments: null,
            units: null
        }), {
            status: 500
        });
    }
};

const colors = ["bg-blue-100/10", "bg-green-100/20", "bg-yellow-100/20", "bg-red-100/30"];

export default function CreateTimeTable() {
    const { timetable } = useLoaderData<typeof loader>();
    const slots = [1, 2, 3, 4];

    // console.log(timetable)
    async function generatePDF() {
        const element = document.getElementById("printable")!;
        document.documentElement.style.backgroundColor = "#fff";

        html2canvas(element).then((canvas) => {
            const pdf = new jsfPdf();
            const imgData = canvas.toDataURL("image/png");

            const imgWidth = 210; // NOTE: THIS IS THE NEW HEIGHT WE NEED IN THE PDF IN MM
            const pageHeight = 297; // NOTE: this is the page height to look at

            /** 
             * this is where we scale down the screenshot using the scale fomula that goes this way:
             * original width/original height = new width/new height
             * it follows then that the new height = original height * new width / original width
             */

            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight; // get the correct vertical offset of the next page to start the next content
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            pdf.save("timetable.pdf")
        })
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-end pr-4  mb-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"secondary"} className="text-xs"><FileScanIcon />Export</Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[250px]">
                        <div className="mt-2">
                            <Button
                                onClick={generatePDF}
                                variant={"ghost"} className="flex items-center !p-1 justify-start w-full gap-x-3">
                                <FileIcon size={16} className="stroke-primary" /> <span className="text-sm text-muted-foreground">Export as pdf</span>
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <Card className="overflow-hidden" id="printable">
                <CardHeader className="flex justify-between items-center  p-4">
                    <div>
                        <CardTitle className="text-xl font-bold">Generated Timetable</CardTitle>
                        <CardDescription>This timetable was generated automatically</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {days.map((day) => (
                            <div key={day} className="col-span-1">
                                <h1 className="text-lg font-semibold mb-4">{day}</h1>
                                {slots.map((slot, index) => {
                                    const item = timetable?.find((item: { day: string; slot: number; }) => item.day === day && item.slot === slot);
                                    const colorClass = colors[index % colors.length];

                                    return (
                                        <div key={slot} className={cn("border p-4 rounded-lg mb-4 shadow-md", item ? colorClass : "bg-gray-100")}>
                                            {item ? (
                                                <>
                                                    <div className="flex items-center mb-2">
                                                        <Clock size={16} className="mr-2 stroke-primary" />
                                                        <p className="text-sm text-muted-foreground">{new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                    <h3 className="text-sm">{item.unit.unit_code} - {item.unit.department.name}</h3>
                                                    <div className="flex items-center mt-2">
                                                        <Avatar className="h-8 w-8 mr-2">
                                                            <AvatarImage className="cursor-pointer" src="https://wallpapers.com/images/featured/red-heart-dxixrd7pyw9vm4hu.jpg" alt="user" />
                                                            <AvatarFallback className="cursor-pointer">US</AvatarFallback>
                                                        </Avatar>
                                                        <p className="text-sm">Teacher: <a href={`/teacher/${item.teacher.id}`} className="text-blue-500 underline">{item.teacher.name}</a></p>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-sm">No class</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
