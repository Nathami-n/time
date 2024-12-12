import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ActionFunction, ActionFunctionArgs } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { db } from "~/lib/db";
import { cn } from "~/lib/utils";

export const action: ActionFunction = async ({ request }: ActionFunctionArgs) => {
    const data = await request.json();

    try {
        if (data.intent === "department") {
            const { date, name, head } = data;
            const department = await db?.department.create({
                data: {
                    established: new Date(date),
                    name: name,
                    departmentHead: head ? {
                        connect: { id: head as string }
                    } : undefined

                }
            })
            if (!department) {
                return Response.json({ error: "Error creating the department, please check whether it exitsts or contact the developer for help", success: false })
            }
            return Response.json({ success: true, error: null }, { status: 201 })
        }

        if (data.intent === "unit") {
            const { name, code, department, teacher } = data;
            const unit = await db?.unit.create({
                data: {
                    name,
                    unit_code: code,
                    department: {
                        connect: { id: department as string }
                    },
                    Teacher: teacher ? {
                        connect: { id: teacher as string }
                    } : undefined
                }
            })

            if (!unit) {
                return Response.json({ error: "Error creating the unit, please check whether it exitsts or contact the developer for help", success: false })
            }
            return Response.json({ success: true, error: null }, { status: 201 })
        }

    } catch (error) {
        console.error("server error", error)
        return Response.json({ error: error instanceof PrismaClientKnownRequestError && error.code === "P2025" && error.meta ? error?.meta.cause : "A server error occurred please check whether the unit already exists or contact the developer if the issue persists", success: false }, { status: 500 })
    }
}

export const loader = async () => {
    if (!db) {
        throw new Error("Database connection is not available.");
    }
    const [departments, teachers] = await db.$transaction([
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
        db.teacher.findMany({
            where: {
                Department: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                staff_no: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        })
    ]);

    return Response.json({ departments, teachers }, { status: 200 });
}

export default function Academia() {
    const [date, setDate] = React.useState<Date>();
    const [teacher, setTeacher] = React.useState();
    const [department, setDepartment] = React.useState();
    const data = useLoaderData<typeof loader>();
    const fetcher = useFetcher();

    console.log(data)

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        const formdata = new FormData(e.target as HTMLFormElement)
        if (!date) {
            toast.error("date cannot be empty");
            return;
        }

        const data = JSON.stringify({
            name: String(formdata.get("name")),
            head: String(formdata.get("head")),
            date,
            intent: "department"
        })
        try {

            fetcher.submit(data, {
                method: "post",
                encType: "application/json",
                action: "/academia"
            })
            const response = fetcher.data as { error: null | string, success: boolean }
            if (response?.error) {
                throw new Error(response.error)
            }

            toast.success("Department added successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Server error");
            return
        }
    }
    const onUnitCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        if (!department) {
            toast.error("Please assign department");
            return;
        }
        const formdata = new FormData(e.target as HTMLFormElement)
        const data = JSON.stringify({
            name: String(formdata.get("name")),
            code: String(formdata.get("code")),
            department,
            intent: "unit",
            teacher,
        })
        try {

            fetcher.submit(data, {
                method: "post",
                encType: "application/json",
                action: "/academia"
            })
            const response = fetcher.data as { error: null | string, success: boolean }
            if (response?.error) {
                throw new Error(response.error)
            }

            toast.success("Unit added successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Server error");
            return
        }
    }
    return (
        <div className=" p-2 max-md:p-4">
            <h1 className="font-medium">Add relevant data</h1>
            <h2 className="text-muted-foreground text-xs">The admin can add the relevant details indicated by the sections below</h2>

            {/* different sections */}
            <div className="mt-8 max-w-4xl">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Faculties And Units</CardTitle>
                        <CardDescription>The various faculties in the school</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form onSubmit={onSubmit}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1">
                                    <Label htmlFor="name">Name</Label>
                                    <Input name="name" className="text-sm" id="name" required placeholder="Computer Science" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="head">Department head</Label>
                                    <Input name="head" id="head" className="text-sm" placeholder="Computer Science" />

                                </div>
                                <div className="space-y-3 flex flex-col">
                                    <Label htmlFor="date">Start date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[280px] justify-start text-left font-normal",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon />
                                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                required
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                            </div>
                            <Button
                                disabled={fetcher.state == "submitting"}
                                className="mt-2">{fetcher.state == "submitting" ? "Please wait..." : "Submit"}</Button>
                        </Form>
                    </CardContent>
                    <CardContent>
                        <Form onSubmit={onUnitCreate}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1">
                                    <Label htmlFor="name">Unit Name</Label>
                                    <Input name="name" className="text-sm" id="name" required placeholder="Computer Science" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="code">Unit code</Label>
                                    <Input name="code" id="code" className="text-sm" placeholder="CCS 2125" />
                                </div>
                                <div className="space-y-3 flex flex-col">
                                    <Label htmlFor="date">Department</Label>
                                    <Select onValueChange={e => setDepartment(e)} value={department}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="the department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {data?.departments && data?.departments.length > 0 && (
                                                data.departments.map((dep: typeof data.departments[number]) => (
                                                    <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>
                                                ))
                                            )}
                                            {data?.departments.length === 0 && (
                                                <div>No departments present</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1 flex flex-col">
                                    <Label htmlFor="teacher">Lecturer</Label>
                                    <Select onValueChange={e => setTeacher(e)} value={teacher} >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Lecturer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {data?.teachers && data?.teachers.length > 0 && (
                                                data.teachers.map((dep: typeof data.teachers[number]) => (
                                                    <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>
                                                ))
                                            )}
                                            {data?.teachers.length === 0 && (
                                                <div>No teachers present</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button
                                disabled={fetcher.state == "submitting"}
                                className="mt-2">{fetcher.state == "submitting" ? "Please wait..." : "Submit"}</Button>
                        </Form>

                    </CardContent>

                </Card>
            </div>
        </div>
    )
}
