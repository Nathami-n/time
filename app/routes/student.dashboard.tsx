import { LoaderFunction, LoaderFunctionArgs, redirect } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/lib/db";
import { userCookie } from "../lib/user-session"
import { AuthUserType, PossibleUsers } from "types/types";
import { Alert } from "~/components/ui/alert";
import { BookDashed, Clock, FileIcon, FileScanIcon, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { UnitTable } from "~/components/tables/units";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { days } from "~/lib/data";
import { cn } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import jspDf from "jspdf";
import html2canvas from "html2canvas";

const colors = ["bg-blue-100/10", "bg-green-100/20", "bg-yellow-100/20", "bg-red-100/30"];


export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
    const userClaims = request.headers.get("cookie");
    const user: AuthUserType = await userCookie.parse(userClaims);
    if (!user || user.role !== PossibleUsers.STUDENT) {
        return redirect("/unauthorized", {
            status: 403
        })
    }

    if (!db) {
        throw new Error("No database connection found. Cannot proceed with loading the page");
    }

    try {
        const studentUnits = await db.studentUnit.findMany({
            where: {
                studentId: user.userId,
            },
            select: {
                enrolledAt: true,
                student: true,
                unit: {
                    select: {
                        id: true,
                        name: true,
                        Teacher: true,
                        department: true,
                        unit_code: true,
                    }
                }
            }
        });

        const timetable = await db.timetable.findMany({
            select: {
                classRoom: true,
                day: true,
                endTime: true,
                id: true,
                ref: true,
                startTime: true,
                teacher: true,
                unit: true,
                slot: true,

            }
        });

        console.log(timetable)
        return Response.json({ success: true, error: null, studentUnits, timetable })

    } catch (error) {
        console.error(error);
        return Response.json({ success: false, error: "Server error", studentUnits: null, timetable: null }, { status: 500 });
    }
}

export default function StudentDashboardHome() {
    const { studentUnits, timetable: time } = useLoaderData<typeof loader>();
    const slots = [1, 2, 3, 4];
    const studentUnitidsSet = new Set(studentUnits.map(std => std.unit.id));
    console.log("Set", studentUnitidsSet)
    const pureUnits = studentUnits.map(u => ({
        id: u.unit.id,
        name: u.unit.name,
        teacher_name: u.unit.Teacher.name,
        department_name: u.unit.department.name,
        unit_code: u.unit.unit_code,
        enrolledAt: u.enrolledAt

    }))

    // check the unitids that are in the timetable and only include those that are in the studentUnitset
    const timetable = time.filter((t) => studentUnitidsSet.has(t.unit.id))

    if (studentUnits && studentUnits.length === 0) {
        return (
            <Alert variant={"default"} className="flex justify-center">
                <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-muted-foreground/5 flex items-center justify-center">
                        <BookDashed size={20} />
                    </div>
                    <p className="text-sm">You have registered no units <span className="cursor-pointer underline"><Link to="/student/enroll">Enroll</Link></span></p>
                </div>
            </Alert>
        )
    }


    if (!studentUnits) {
        return (
            <div className="w-full h-full p-2 md:p-4">
                <Alert variant={"destructive"} className="flex justify-center">
                    <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-muted-foreground/5 flex items-center justify-center">
                            <BookDashed size={20} />
                        </div>
                        <p className="text-sm">An error occurred fetching units.Please <span className="cursor-pointer underline">contact support </span></p>
                    </div>
                </Alert>
            </div>
        )
    }

    async function generatePDF() {
        const element = document.getElementById("printable")!;
        document.documentElement.style.backgroundColor = "#fff";

        html2canvas(element).then((canvas) => {
            const pdf = new jspDf();
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
        <div className="p-2 md:p-4">
            <h1 className="text-sm">These are your enrolled units and the times you ought to attend</h1>
            <h1 className="text-muted-foreground text-xs">Your units and schedule</h1>

            <div className="mt-5">
                <Card className="max-w-[80%]">
                    <CardHeader>
                        <CardTitle>Units enrolled in</CardTitle>
                        <CardDescription>these are the units you are enrolled in</CardDescription>
                        <CardContent className="w-full !mt-6 p-0">
                            <UnitTable data={pureUnits} />
                        </CardContent>
                    </CardHeader>
                </Card>
            </div>

            <div className="mt-5">
                <Card className="overflow-hidden" id="printable">
                    <CardHeader className="flex justify-between items-center p-4">
                        <div className="flex items-center justify-end w-full">
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
                        <div>
                            <CardTitle className="text-xl font-bold">Weekly Routine</CardTitle>
                            <CardDescription className="flex items-center gap-x-1">
                                This timetable was given by the Institution admin
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info size={14} className="cursor-pointer stroke-rose-600" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white border p-2 text-muted-foreground w-[280px]">
                                        <div className="flex-col flex">
                                            <p className="flex gap-x-1">
                                                <strong className="text-rose-400">Note:</strong> This is your termly timetable. You can download it for convenience
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

            </div>
        </div>
    )
}
