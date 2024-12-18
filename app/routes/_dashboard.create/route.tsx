import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { days } from "~/lib/data";
import { cn } from "~/lib/utils";
import { Clock, FileIcon, FileScanIcon, Info, Save, RecycleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { db } from "~/lib/db";
import { LoaderFunction } from "@remix-run/node";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import jsPdf from "jspdf";
import html2canvas from "html2canvas";

const classrooms = ["RoomA", "RoomC", "LabA0", "LabD0", "LabD1", "Korea", "RoomD"];
const colors = ["bg-blue-100/10", "bg-green-100/20", "bg-yellow-100/20", "bg-red-100/30"];

function generateTimetable(
    teachers: any[],
    units: any[],
    classrooms: string[],
    days: string[]
) {
    const slotsPerDay = 4;
    const startHour = 8;
    const slotDuration = 2;

    const timetable: any[] = [];
    const teacherDayMap: Record<string, string[]> = {}; // Tracks days assigned to each teacher
    const unitCountMap: Record<string, number> = {}; // Tracks unit coverage

    // Initialize unit count map to ensure each unit is taught at least once
    units.forEach((unit) => {
        unitCountMap[unit.id] = 0;
    });

    // Assign days to each teacher
    teachers.forEach((teacher) => {
        const availableDays = [...days];
        teacherDayMap[teacher.id] = [];

        while (teacherDayMap[teacher.id].length < 3) { // Assign 3 random days per teacher
            const randomDayIndex = Math.floor(Math.random() * availableDays.length);
            const day = availableDays.splice(randomDayIndex, 1)[0];
            teacherDayMap[teacher.id].push(day);
        }
    });

    // Generate timetable
    days.forEach((day) => {
        let dailyLessons = 0;

        for (let slot = 0; slot < slotsPerDay; slot++) {
            // Ensure each day has at least 2 lessons
            if (dailyLessons < 2 || Math.random() > 0.5) {
                const availableTeachers = teachers.filter((teacher) =>
                    teacherDayMap[teacher.id].includes(day)
                );

                if (availableTeachers.length > 0) {
                    const teacherIndex = Math.floor(
                        Math.random() * availableTeachers.length
                    );
                    const teacher = availableTeachers[teacherIndex];
                    const unit = units.find(
                        (u) => unitCountMap[u.id] === 0 || Math.random() > 0.5
                    );

                    if (unit) {
                        const classroom =
                            classrooms[Math.floor(Math.random() * classrooms.length)];
                        const startTime = new Date();
                        startTime.setHours(startHour + slot * slotDuration, 0, 0, 0);

                        const endTime = new Date(startTime);
                        endTime.setHours(startTime.getHours() + slotDuration);

                        timetable.push({
                            day,
                            slot: slot + 1,
                            teacher,
                            unit,
                            classroom,
                            startTime: startTime.toISOString(),
                            endTime: endTime.toISOString(),
                        });

                        // Update counters and mappings
                        unitCountMap[unit.id]++;
                        dailyLessons++;
                    }
                }
            }
        }
    });

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
                    name: true,
                    department: true,
                    Teacher: true,
                }
            })
        ]);

        const timetable = generateTimetable(teachers, units, classrooms, days);
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





export default function CreateTimeTable() {
    const { teachers, departments, units } = useLoaderData<typeof loader>();
    const [timetable, setTimetable] = useState(null);
    const slots = [1, 2, 3, 4];
    const handleGenerateTimetable = () => {
        const newTimetable = generateTimetable(teachers, units, classrooms, days);
        setTimetable(newTimetable);
    }

    console.log("timetable", timetable)

    async function generatePDF() {
        const element = document.getElementById("printable")!;
        document.documentElement.style.backgroundColor = "#fff";

        html2canvas(element).then((canvas) => {
            const pdf = new jsPdf();
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
            <div className="flex items-center justify-between pr-4 mb-4">
                <div className="flex items-center gap-x-2">
                    <Button
                        variant="outline"
                        className="flex items-center text-xs justify-center"
                        disabled={!timetable}
                    >
                        <Save /> Save
                    </Button>
                    <Button
                        variant="ghost"
                        className="flex items-center text-xs justify-center"
                        onClick={handleGenerateTimetable}
                    >
                        <RecycleIcon /> Generate Timetable
                    </Button>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"secondary"} className="text-xs"><FileScanIcon />Export</Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[250px]">
                        <div className="mt-2">
                            <Button
                                disabled={timetable ? false : true}
                                onClick={generatePDF}
                                variant={"ghost"} className="flex items-center !p-1 justify-start w-full gap-x-3">
                                <FileIcon size={16} className="stroke-primary" /> <span className="text-sm text-muted-foreground">Export as pdf</span>
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {!timetable ? (
                <div className="text-center mt-8 min-h-full flex items-center justify-center flex-col">
                    <p className="text-muted-foreground text-lg">No timetable generated yet.</p>
                    <p className="text-sm text-muted-foreground">Click &quot;Generate Timetable&quot; to create one.</p>
                </div>
            ) : (
                <Card className="overflow-hidden" id="printable">
                    <CardHeader className="flex justify-between items-center p-4">
                        <div>
                            <CardTitle className="text-xl font-bold">Generated Timetable</CardTitle>
                            <CardDescription className="flex items-center gap-x-1">
                                This timetable was generated automatically
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info size={14} className="cursor-pointer stroke-rose-600" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white border p-2 text-muted-foreground w-[280px]">
                                        <div className="flex-col flex">
                                            <p className="flex gap-x-1">
                                                <strong className="text-rose-400">Note:</strong> Refreshing will reset the timetable. Save after creation.
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            {days.map((day) => (
                                <div key={day} className="col-span-1">
                                    <h1 className="text-lg font-semibold mb-4">{day}</h1>
                                    {slots.map((slot, index) => {
                                        const item = timetable.find(
                                            (item) => item.day === day && item.slot === slot
                                        );
                                        const colorClass = colors[index % colors.length];
                                        return (
                                            <div
                                                key={slot}
                                                className={cn(
                                                    "border p-4 rounded-lg mb-4 shadow-md",
                                                    item ? colorClass : "bg-gray-100"
                                                )}
                                            >
                                                {item ? (
                                                    <>
                                                        <div className="flex items-center mb-2">
                                                            <Clock size={16} className="mr-2 stroke-primary" />
                                                            <p className="text-sm text-muted-foreground">
                                                                {new Date(item.startTime).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}{" "}
                                                                -{" "}
                                                                {new Date(item.endTime).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            Venue: {item.classroom}
                                                        </div>
                                                        <h3 className="text-sm">
                                                            {item.unit.unit_code} - {item.unit.name}
                                                        </h3>
                                                        <div className="flex items-center mt-2">
                                                            <Avatar className="h-8 w-8 mr-2">
                                                                <AvatarImage
                                                                    className="cursor-pointer"
                                                                    src="https://wallpapers.com/images/featured/red-heart-dxixrd7pyw9vm4hu.jpg"
                                                                    alt="user"
                                                                />
                                                                <AvatarFallback className="cursor-pointer">US</AvatarFallback>
                                                            </Avatar>
                                                            <p className="text-sm">
                                                                Teacher:{" "}
                                                                <a
                                                                    href={`/teacher/${item.teacher.id}`}
                                                                    className="text-blue-500 underline"
                                                                >
                                                                    {item.teacher.name}
                                                                </a>
                                                            </p>
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
            )}
        </div>
    );
}
