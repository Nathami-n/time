import { z } from "zod";
import { useFetcher } from "@remix-run/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { toast } from "sonner";
import { ActionFunctionArgs, ActionFunction } from "@remix-run/node";
import { db } from "~/lib/db";
import { Prisma } from "@prisma/client";
import { prismaKnownErrorrs } from "~/lib/errors";
import bcrypt from "bcrypt";


const teacherSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    reg_no: z.string().min(1, "Deparment is required"),
})

export const action: ActionFunction = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    const { name, email, password, reg_no } = data;
    const hashedPassword = await bcrypt.hash(String(password), 10);
    try {
        await db?.student.create({
            data: {
                name: name as string,
                reg_no: reg_no as string,
                email: email as string,
                password: hashedPassword as string,
            },
        });
        return new Response(JSON.stringify({ success: true, error: null }), { status: 201 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Failed to create student:", error);
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

export default function StudentsPage() {
    const fetcher = useFetcher();

    const form = useForm({ resolver: zodResolver(teacherSchema) });

    async function onSubmit(values: FieldValues) {
        try {
            fetcher.submit(values,
                {
                    method: "post",
                    action: "/students",
                });

            const data = fetcher.data as { success: boolean, error: string }
            console.log(data)
            if (!data?.success) {
                toast.error(data.error);
                return;

            }
            toast.success("Created student successfully")
        }
        catch (error) {
            toast.error("Error creating student");
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
                        <CardTitle>Student details</CardTitle>
                        <CardDescription>Add the relevant details of the Student</CardDescription>
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
                                    name="reg_no"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reg no</FormLabel>
                                            <FormControl>
                                                <Input className="text-sm" type="text" placeholder="HSL-222" {...field} />
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
        </div >
    );
}
