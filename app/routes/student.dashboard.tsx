import { LoaderFunction, LoaderFunctionArgs, redirect } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/lib/db";
import { userCookie } from "../lib/user-session"
import { AuthUserType, PossibleUsers } from "types/types";
import { Alert } from "~/components/ui/alert";
import { BookDashed, Clock, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { UnitTable } from "~/components/tables/units";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { days } from "~/lib/data";
import { cn } from "~/lib/utils";

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
            where: {
                
            },
            select: {
                classRoom: true,
                day: true,
                endTime: true,
                id: true,
                ref: true,
                startTime: true,
                teacher: true,
                
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
    let timetable = [];
    const slots = [1, 2, 3, 4];
    const pureUnits = studentUnits.map(u => ({
        id: u.unit.id,
        name: u.unit.name,
        teacher_name: u.unit.Teacher.name,
        department_name: u.unit.department.name,
        unit_code: u.unit.unit_code,
        enrolledAt: u.enrolledAt

    }))

    for (const t of studentUnits) {
        for (const u of time) {
            if (t.unit.id === u.unit.id) {
                timetable.push(u)
            }
        }
    }



    console.log("@sorted timetable", timetable);
    console.log("@unsorted timetable", time);
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

            </div>
        </div>
    )
}
