
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

import { User, Building, BookA, KeyIcon, LucideProps, GraduationCap } from "lucide-react";
import { Component } from "./components/charts/radial";
import { Doughnut } from "./components/charts/gradient";

// Loader Function
export const loader: LoaderFunction = async () => {
    if (!db) {
        throw new Error("database connection not found");
    }
    const teacherCount = await db.teacher.count();
    const departmentCount = await db.department.count();
    const studentCount = await db.student.count();
    const adminCount = await db.administrator.count();
    const unitCount = await db.unit.count();

    return Response.json({ teachers: teacherCount, departments: departmentCount, students: studentCount, admins: adminCount, units: unitCount });
};

// Admin Dashboard Component
export default function AdminDashboard() {
    const data = useLoaderData<typeof loader>();

    const structuredData = [
        {
            title: "Teachers",
            cardData: data.teachers,
            icon: (props?: LucideProps) => <User {...props} size={30} className="stroke-primary" />
        },
        {
            title: "Departments",
            cardData: data.departments,
            icon: (props?: LucideProps) => <Building {...props} size={30} className="stroke-green-500" />

        },
        {
            title: "Admins",
            cardData: data.admins,
            icon: (props?: LucideProps) => <KeyIcon {...props} size={30} className="stroke-yellow-500" />
        },
        {
            title: "Students",
            cardData: data.students,
            icon: (props?: LucideProps) => <BookA {...props} size={30} className="stroke-yellow-500" />
        },
        {
            title: "Units",
            cardData: data.units,
            icon: (props?: LucideProps) => <GraduationCap {...props} size={30} className="stroke-pink-500" />
        }
    ]
    const chartData = [
        { name: "Lecturers", value: data.teachers, fill: "hsl(var(--chart-2))" },
        { name: "Departments", value: data.departments, fill: "hsl(var(--chart-1))" },
        { name: "Students", value: data.students, fill: "hsl(var(--chart-4))" },
        { name: "Admins", value: data.admins, fill: "hsl(var(--chart-5))" }
    ];

    return (
        <div className="p-4  h-screen">
            <Card className="bg-gray-100/10">
                <CardHeader>
                    <CardTitle>Admin Dashboard</CardTitle>
                    <CardDescription>Overview of Teachers and Departments</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {structuredData.map(dataBlock => (

                            <Card key={dataBlock.title} className="flex p-4 shadow-sm justify-between items-center md:w-40 md:h-20">
                                <div className="flex flex-col">
                                    <CardDescription>{dataBlock.title}</CardDescription>
                                    <CardTitle>{dataBlock.cardData}</CardTitle>
                                </div>
                                <div className=" border rounded-lg p-2 flex items-center justify-center">
                                    {dataBlock.icon()}
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card className="mt-4 bg-gray-100/10">
                <CardHeader>
                    <CardTitle>Statistics</CardTitle>
                    <CardDescription>Graphical representation of data</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <Component chartData={chartData} />
                    </div>
                    <div className="flex flex-col">
                        <Doughnut chartData={chartData} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
