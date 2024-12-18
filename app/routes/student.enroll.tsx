import { useLoaderData, useFetcher } from "@remix-run/react";
import { BookDashed } from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
    CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { Alert } from "~/components/ui/alert";
import { db } from "~/lib/db";
import { ActionFunction, ActionFunctionArgs, redirect } from "@remix-run/node";
import { Prisma } from "@prisma/client";
import { prismaKnownErrorrs } from "~/lib/errors";
import { userCookie } from "~/lib/user-session";
import { ApiResponseType, AuthUserType, PossibleUsers } from "types/types";
import { toast } from "sonner";


export async function loader() {
    try {
        const units = await db?.unit.findMany({
            select: {
                id: true,
                createdAt: true,
                department: true,
                name: true,
                Teacher: true,
                unit_code: true,

            }
        });
        return Response.json({ units });
    } catch (error) {
        console.error("Error loading units", error);
    }
}

export const action: ActionFunction = async ({ request }: ActionFunctionArgs) => {
    const data = await request.json();
    const userClaims = request.headers.get("cookie");

    const user = await userCookie.parse(userClaims) as AuthUserType;
    if (!user) {
        return redirect("/login", {
            headers: {
                "Set-Cookie": await userCookie.serialize({}, {
                    maxAge: 0
                })
            }
        })
    }

    if (user.role !== PossibleUsers.STUDENT) {
        return redirect("/unauthorized");
    }

    try {
        const enrollData = data.submitUnit;
        if (!enrollData) {
            return Response.json({ success: false, error: "no data provided" }, { status: 404 });
        }
        for (const u of enrollData) {
            await db?.studentUnit.create({
                data: {
                    student: {
                        connect: {
                            id: user.userId
                        }
                    },
                    unit: {
                        connect: {
                            id: u.id
                        }
                    }

                }
            })
        }
        return Response.json({ success: true, error: null }, { status: 201 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Failed to create admin:", error);
        let message = "An error occurred.";
        let code = 500;
        switch (error.constructor) {
            case Prisma.PrismaClientKnownRequestError: {
                const [errorMessage, statusCode] = prismaKnownErrorrs(error);
                message = String(errorMessage);
                code = Number(statusCode);
                break;
            }
            case Prisma.PrismaClientUnknownRequestError: {
                message = "Unknown error occurred.";
                break;
            }
            case Prisma.PrismaClientRustPanicError: {
                message = "Database engine crashed.";
                break;
            }
            case Prisma.PrismaClientInitializationError: {
                message = "Failed to initialize database connection.";
                break;
            }
            case Prisma.PrismaClientValidationError: {
                message = "Validation error in Prisma schema.";
                code = 400;
                break;
            }
            default: {
                message = "An unexpected error occurred.";
            }
        }

        return Response.json({ error: message, success: false }, { status: code });

    }
};

export default function EnrollPage() {
    const { units } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();
    const [enrolledUnits, setEnrolledUnits] = useState<string[]>([]);

    const handleEnroll = (unitId: string) => {
        setEnrolledUnits((prev) =>
            prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
        );
    };

    const handleSubmit = () => {
        const submitUnit = units.filter(unit => {
            return enrolledUnits.includes(unit.id);
        })

        fetcher.submit(
            {
                submitUnit
            },
            {
                method: "post",
                action: "/student/enroll",
                encType: "application/json"
            }
        );
        const data = fetcher.data as ApiResponseType
        if (data && !data?.success) {
            toast.error(data.error);
            return;
        } else if (data && data.success) {
            toast.success("Created enrollment successfully")
        }
    };

    if (units && units.length === 0) {
        return (
            <Alert variant={"destructive"} className="flex justify-center">
                <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-muted-foreground/5 flex items-center justify-center">
                        <BookDashed size={20} />
                    </div>
                    <p>No units found</p>
                </div>
            </Alert>
        );
    }

    if (!units) {
        return (
            <div className="w-full h-full p-2 md:p-4">
                <Alert variant={"destructive"} className="flex justify-center">
                    <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-muted-foreground/5 flex items-center justify-center">
                            <BookDashed size={20} />
                        </div>
                        <p className="text-sm">
                            An error occurred fetching units. Please
                            <span className="cursor-pointer underline"> contact support </span>
                        </p>
                    </div>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-2 md:p-4">
            <h1 className="text-lg text-start">Enroll in Units</h1>
            <h1 className="text-muted-foreground text-sm">choose units to enroll from here</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 mt-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {units.map((unit: {
                    Teacher: any; id: string; name: string; department: { name: string }; unit_code: string; teachers: { name: string; role: string }[]
                }) => (
                    <Card key={unit.id} className="hover:shadow-lg transition-shadow border rounded-lg">
                        <CardHeader className="p-4 ">
                            <CardTitle className="text-lg">{unit.name}</CardTitle>
                            <CardDescription className="text-sm">Department: {unit.department.name}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                            <p className="text-sm  mb-2">Unit code: {unit.unit_code}</p>
                            <p className="text-sm font-semibold text-muted-foreground">Teachers:</p>
                            <ul className="list-disc list-inside text-sm">
                                {unit.Teacher.length === 0 ? <li>No tutors present</li> : (
                                    unit.Teacher.map((teacher) => (
                                        <li key={teacher.name} className="text-sm text-primary">
                                            <span className="font-medium">{teacher.name}</span> - {teacher.role}
                                        </li>
                                    ))
                                )}
                            </ul>
                        </CardContent>
                        <CardFooter className="p-4 flex justify-between items-center">
                            <Button className="w-full"
                                variant={enrolledUnits.includes(unit.id) ? "destructive" : "outline"}
                                onClick={() => handleEnroll(unit.id)}
                            >
                                {enrolledUnits.includes(unit.id) ? "Unenroll" : "Enroll"}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {enrolledUnits.length > 0 && (
                <div className="mt-10 p-6 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Enrolled Units</h2>
                    <ul className="list-disc list-inside mb-4">
                        {enrolledUnits.map((unitId) => {
                            const unit = units.find((u) => u.id === unitId);
                            return <li key={unitId}>{unit?.name}</li>;
                        })}
                    </ul>
                    <Button
                        className="w-full md:w-auto"
                        onClick={handleSubmit}
                        disabled={fetcher.state === "submitting"}
                    >
                        {fetcher.state === "submitting" ? "Submitting..." : "Submit Enrollment"}
                    </Button>
                </div>
            )}
        </div>
    );
}
