import { z } from "zod";
import { useFetcher, useLoaderData } from "@remix-run/react";
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
import bcrypt from "bcryptjs";
import { AdminSchema } from "~/lib/zod";
import { AdminTable } from "~/components/tables/admin";
import { ApiResponseType } from "types/types";


export const action: ActionFunction = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    const { name, email, auth_code } = data;
    const hashedCode = await bcrypt.hash(String(auth_code), 10);
    try {
        await db?.administrator.create({
            data: {
                name: name as string,
                auth_code: hashedCode as string,
                email: email as string,
            },
        });
        return new Response(JSON.stringify({ success: true, error: null }), { status: 201 });
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

export const loader = async () => {
    try {
        const admins = await db?.administrator.findMany();

        return Response.json({ admins }, { status: 200 });

    } catch (error) {
        console.error("failed to get the admins", error);
    }
}

export default function AdminPage() {
    const fetcher = useFetcher();
    const { admins } = useLoaderData<typeof loader>();
    const form = useForm({ resolver: zodResolver(AdminSchema) });

    async function onSubmit(values: FieldValues) {
        try {
            fetcher.submit(values,
                {
                    method: "post",
                    action: "/admin",
                });

            const data = fetcher.data as ApiResponseType
            if (data && !data?.success) {
                toast.error(data.error);
                return;
            }
            toast.success("Created Admin successfully")
        }
        catch (error) {
            toast.error("Error creating Admin");
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
                        <CardTitle>Admin details</CardTitle>
                        <CardDescription>Add the relevant details of the admin</CardDescription>
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
                                    name="auth_code"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Auth Code</FormLabel>
                                            <FormControl>
                                                <Input className="text-sm" type="password" placeholder="te**" {...field} />
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
                        <CardTitle>Added Students
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AdminTable
                            data={admins}
                        />
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
