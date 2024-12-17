
import { useFetcher, useLoaderData } from "@remix-run/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { toast } from "sonner";
import { ActionFunctionArgs, LoaderFunction, ActionFunction } from "@remix-run/node";
import { db } from "~/lib/db";
import { prismaKnownErrorrs } from "~/lib/errors";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DataTable } from "~/components/tables/table";
import { teacherSchema } from "~/lib/zod";
import { ApiResponseType } from "types/types";




export const loader: LoaderFunction = async () => {
    if (!db) {
        throw new Error("Database connection is not available.");
    }
    const [departments, units, teachers] = await db.$transaction([
        db.department.findMany({
            where: {
                departmentHeadId: null
            },
            select: {
                id: true,
                name: true,
                established: true,
                createdAt: true,
                updatedAt: true
            }
        }),
        db.unit.findMany({
            select: {
                id: true,
                name: true,
            }
        }),
        db.teacher.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                department: true,
                unit: true,
                staff_no: true,


            }
        })
    ]);

    const formatedTeachers = [];
    for (const teacher of teachers) {
        const formartedTeacher = {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            staff_no: teacher.staff_no,
            department: teacher?.department?.name as string,
            unit: teacher.unit.name
        };
        formatedTeachers.push(formartedTeacher);
    }
    return Response.json({ departments, units, teachers: formatedTeachers, actualTeachers: teachers });

}
export const action: ActionFunction = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    const { name, email, password, department, staff_no, unit } = data;
    const hashedPassword = await bcrypt.hash(String(password), 10);

    try {
        await db?.teacher.create({
            data: {
                name: name as string, staff_no: staff_no as string, email: email as string,
                unit: {
                    connect: {
                        id: unit as string
                    }
                },
                password: hashedPassword as string,
                department: { connect: { id: department as string } }
            },
        });
        return Response.json({ success: true }, { status: 201 })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Failed to create Teacher:", error);
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
}

export default function TeacherForm() {
    const { departments, units, teachers, actualTeachers } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();

    const form = useForm({ resolver: zodResolver(teacherSchema) });

    async function onSubmit(values: FieldValues) {
        try {
            fetcher.submit(values,
                {
                    method: "post",
                    action: "/teachers",
                });

            const data = fetcher.data as ApiResponseType
            if (data && !data?.success) {
                toast.error("Error creating teacher");
                return;
            }

            toast.success("Created teacher successfully")
            form.reset();
        }
        catch (error) {
            toast.error("Error creating teacher");
            return;
        }
    }

    return (
        <div className=" p-2 max-md:p-4">
            <h1 className="font-medium">Add relevant data</h1>
            <h2 className="text-muted-foreground text-xs">The admin can add the relevant details indicated by the sections below</h2>
            <Form {...form}>
                <Card className="shadow-sm mt-10 max-w-4xl ">
                    <CardHeader>
                        <CardTitle>Teacher details</CardTitle>
                        <CardDescription>Add the relevant details of the teacher</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)}  >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <FormField
                                    name="name"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="text-sm"
                                                    placeholder="Enter Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="email"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email"
                                                    className="text-sm" placeholder="test@gmail.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="password"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input className="text-sm" type="password" placeholder="te**" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="staff_no"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Staff no</FormLabel>
                                            <FormControl>
                                                <Input className="text-sm" type="text" placeholder="HSL-222" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="department"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="department" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departments.map((department: { id: string; name: string }) => (<SelectItem key={department.id} value={department.id}> {department.name} </SelectItem>))}
                                                    </SelectContent>

                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="unit"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="unit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {units.map((unit: { id: string; name: string }) => (<SelectItem key={unit.id} value={unit.id}> {unit.name} </SelectItem>))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>
                            <div className="mt-4">
                                <Button
                                    disabled={fetcher.state == "submitting"}
                                    className="mt-2">{fetcher.state == "submitting" ? "Please wait..." : "Submit"}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </Form>

            <div className=" mt-5">
                <Card>
                    <CardHeader>
                        <CardTitle>All teachers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={teachers}
                            units={units}
                            departments={departments}
                            actualTeachers={actualTeachers}
                        />
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
