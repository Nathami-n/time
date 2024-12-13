import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Building2, CoinsIcon, HardHatIcon } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";


import { db } from "~/lib/db";
import { cn } from "~/lib/utils";


export const loader: LoaderFunction = async ({ params }: LoaderFunctionArgs) => {
    const { id } = params;

    try {

        const teacher = await db?.teacher.findUnique({
            where: {
                id: id
            },
            select: {
                createdAt: true,
                Department: true,
                email: true,
                department: true,
                name: true,
                id: true,
                staff_no: true,
                unit: true,


            }
        })
        return Response.json({ teacher }, { status: 200 });
    } catch (error) {
        console.error("error fetching teacher");
        return Response.json({ teacher: null });

    }
}

export default function TeacherDetailsPage() {
    const { teacher } = useLoaderData<typeof loader>();
    const [value, setValue] = useState("details");

    return (
        <div className="p-2 md:p-4">
            <h1 className="text-lg font-medium"> Teacher Details</h1>
            <h1 className="text-xs text-muted-foreground">These are the tutor details</h1>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
                <Card className="!shadow-none !rounded-sm md:col-span-2">
                    <CardHeader>
                        <div className="flex gap-x-1">
                            <div className="w-20 h-20">
                                <img src="https://preskool.dreamstechnologies.com/cakephp/template/webroot/img/teachers/teacher-01.jpg" alt="placeholder" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-sm font-medium">{teacher.name}</h1>
                                <h1 className="text-sm font-medium text-primary">{teacher.staff_no}</h1>
                                <h1 className="text-xs ">Joined:{new Date(teacher.createdAt).toLocaleDateString([], { dateStyle: "medium" })}</h1>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-gray-800 space-y-2">
                            <h1 className="font-medium">Basic information</h1>
                            <h1 className="flex items-center text-sm justify-between">
                                <span className="font-medium">Email</span>
                                <span className="text-muted-foreground
                                ">{teacher.email}</span>
                            </h1>
                            <h1 className="flex items-center text-sm justify-between">
                                <span className="font-medium">Department</span>
                                <span className="text-muted-foreground
                                ">{teacher.department.name}</span>
                            </h1>
                            <h1 className="flex items-center text-sm justify-between">
                                <span className="font-medium">Unit</span>
                                <span className="text-muted-foreground
                                ">{teacher.unit.name}</span>
                            </h1>
                            <h1 className="flex items-center text-sm justify-between">
                                <span className="font-medium">HOD</span>
                                <span className="text-muted-foreground
                                ">{teacher.Department ? teacher.Department.name : "Null"}</span>
                            </h1>
                        </div>
                    </CardContent>
                </Card>
                <Card className="!border-none !shadow-none !rounded-0">
                    <Tabs defaultValue={value} onValueChange={e => setValue(e)}>
                        <CardHeader className="w-full">
                            <TabsList className="!bg-white min-w-full rounded-sm flex items-center justify-start !shadow-none ">
                                <TabsTrigger value="details" className={cn(
                                    "!rounded-none ",
                                    value === "details" ? "!border-none !shadow-none  !underline !underline-offset-4  !text-primary" : "hover:!text-primary hover:!underline hover:!underline-offset-4"
                                )}><div className="flex items-center gap-x-1">
                                        <HardHatIcon size={12} />Teacher Details</div></TabsTrigger>

                                <TabsTrigger value="pay" className={cn(
                                    "!rounded-none ",
                                    value === "pay" ? "!border-none !shadow-none  !underline !underline-offset-4  !text-primary" : "hover:!text-primary hover:!underline hover:!underline-offset-4"
                                )}><div className="flex items-center gap-x-1">
                                        <CoinsIcon size={12} />Payment</div></TabsTrigger>
                                <TabsTrigger value="department" className={cn(
                                    "!rounded-none ",
                                    value === "department" ? "!border-none !shadow-none  !underline !underline-offset-4  !text-primary" : "hover:!text-primary hover:!underline hover:!underline-offset-4"
                                )}><div className="flex items-center gap-x-1">
                                        <Building2 size={12} />Head of Department</div></TabsTrigger>
                            </TabsList>
                        </CardHeader>
                    </Tabs>
                </Card>
            </div>
        </div>
    )
}
