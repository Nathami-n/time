import { useState } from "react"
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodSchema } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { redirect, Form as RemixForm, useFetcher } from "@remix-run/react";
import { toast } from "sonner";
import { ActionFunctionArgs } from "@remix-run/node";
import { db } from "~/lib/db";
import { userCookie } from "~/lib/user-session";
import { Loader2Icon } from "lucide-react";

export async function action({ request }: ActionFunctionArgs) {
    try {
        const { intent, data } = await request.json();
        switch (intent) {
            case PossibleUsers.ADMIN: {
                const admin = await db?.administrator.findFirst({
                    where: {
                        auth_code: data.auth_code
                    }
                });
                if (!admin) {
                    throw new Error("Admin not found")
                }
                return redirect("/dashboard", {
                    headers: {
                        "Set-Cookie": await userCookie.serialize({ name: admin.name, email: admin.email, id: admin.id })
                    }
                });
            }
            case PossibleUsers.STUDENT: {

                const student = await db?.student.findFirst({
                    where: {
                        reg_no: data.reg_no,
                        password: data.password
                    }
                });
                if (!student) {
                    throw new Error("Student not found")
                }
                return redirect("/student", {
                    headers: {
                        "Set-Cookie": await userCookie.serialize({ name: student.name, email: student.email, userId: student.id })
                    }
                });
            }
            case PossibleUsers.STAFF: {
                const teacher = await db?.teacher.findFirst({
                    where: {
                        staff_no: data.reg_no,
                        password: data.password
                    }
                });
                if (!teacher) {
                    throw new Error("Teacher not found")
                }
                return redirect("/teacher", {
                    headers: {
                        "Set-Cookie": await userCookie.serialize({ name: teacher.name, email: teacher.email, userId: teacher.id })
                    }
                });
            }
            default: {
                return Response.json({ error: "Invalid role" }, { status: 400 });
            }
        }

    } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500 })

    }
}

export const enum PossibleUsers {
    STUDENT = "student",
    STAFF = "staff",
    ADMIN = "admin"
}
const Schemas = {
    student: z.object({
        reg_no: z.string().min(1, "Registration number required"),
        password: z.string().min(2, "Password required"),
    }),
    staff: z.object({
        staff_no: z.string().min(1, "Staff number required"),
        password: z.string().min(6, "Password cannot be less than 6 characters"),
    }),
    admin: z.object({
        auth_code: z.string().min(6, "Auth code cannot be less than 6 characters")
    })
}


export default function LoginPage() {
    const [intent, setIntent] = useState(PossibleUsers.STUDENT);
    const fetcher = useFetcher();
    let schema: ZodSchema;
    switch (intent) {
        case PossibleUsers.STAFF: {
            schema = Schemas[PossibleUsers.STAFF];
            break;
        }
        case PossibleUsers.STUDENT: {
            schema = Schemas[PossibleUsers.STUDENT]
            break;
        }
        default: {
            schema = Schemas[PossibleUsers.ADMIN]
        }
    }

    const form = useForm({
        resolver: zodResolver(schema)
    })
    const onSubmit = (data: FieldValues) => {
        console.log(data)
        try {
            fetcher.submit({ data, intent }, {
                encType: "application/json",
                action: "/login",
                method: "post"
            })
            const response = fetcher.data as { error: string };
            if (response?.error) {
                throw new Error(response?.error)
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to login user")
            console.error("error submitting form", error);
            return;
        }
    }
    return (
        <div>
            <Tabs defaultValue={intent}
                onValueChange={e => setIntent(e as PossibleUsers)}>
                <TabsList className="w-full">
                    <TabsTrigger value={PossibleUsers.ADMIN} >Admin</TabsTrigger>
                    <TabsTrigger value={PossibleUsers.STAFF}>Staff</TabsTrigger>
                    <TabsTrigger value={PossibleUsers.STUDENT}>Student</TabsTrigger>
                </TabsList>
                <TabsContent value={PossibleUsers.ADMIN}>
                    <Form {...form}>
                        <RemixForm className="border p-4 rounded-lg" onSubmit={form.handleSubmit(onSubmit)}>
                            <FormLabel>Admin</FormLabel>
                            <FormDescription>Please enter the auth code to proceed</FormDescription>
                            <FormField
                                name="auth_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>

                                            <Label htmlFor="admin">
                                                <Input id="admin" {...field}
                                                    className="placeholder:text-xs text-sm"
                                                    placeholder="Auth code for admin" />
                                            </Label>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                disabled={fetcher.state == "submitting"}
                                className="w-full mt-2"
                            >{fetcher.state === "submitting" ? <Loader2Icon className="animate-spin" /> : "Submit"}</Button>
                        </RemixForm>
                    </Form>
                </TabsContent>
                <TabsContent value={PossibleUsers.STUDENT}>
                    <Form {...form}>
                        <RemixForm
                            className="w-full rounded-lg border p-4"
                            onSubmit={form.handleSubmit(onSubmit)}>
                            <FormLabel>Student</FormLabel>
                            <FormDescription>Please enter the registration number and password to proceed</FormDescription>
                            <div className="flex flex-col gap-y-2 mt-2">
                                <FormField
                                    name="reg_no"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Label htmlFor="reg_no">
                                                    <Input id="reg_no" {...field}
                                                        className="placeholder:text-xs text-sm"
                                                        placeholder="Student registration no." />
                                                </Label>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="password"
                                    render={({ field }) => (
                                        < FormItem >
                                            <FormControl>
                                                <Label htmlFor="password">
                                                    <Input id="password" type="password" {...field}
                                                        className="placeholder:text-xs text-sm"
                                                        placeholder="***" />
                                                </Label>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button
                                disabled={fetcher.state == "submitting"}
                                className="w-full mt-2"
                            >{fetcher.state === "submitting" ? <Loader2Icon className="animate-spin" /> : "Submit"}</Button>
                        </RemixForm>
                    </Form>
                </TabsContent>
                <TabsContent value={PossibleUsers.STAFF}>
                    <Form {...form}>
                        <RemixForm
                            className="w-full rounded-lg border p-4"
                            onSubmit={form.handleSubmit(onSubmit)}>
                            <FormLabel>Staff</FormLabel>
                            <FormDescription>Please enter the staff number and password to proceed</FormDescription>
                            <div className="flex flex-col gap-y-2 mt-2">
                                <FormField
                                    name="staff_no"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Label htmlFor="staff_no">
                                                    <Input id="staff_no"  {...field}
                                                        className="placeholder:text-xs text-sm"
                                                        placeholder="Staff no." />
                                                </Label>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Label htmlFor="password">
                                                    <Input id="password" type="password" {...field}
                                                        className="placeholder:text-xs text-sm"
                                                        placeholder="***" />
                                                </Label>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button
                                disabled={fetcher.state == "submitting"}
                                className="w-full mt-2"
                            >{fetcher.state === "submitting" ? <Loader2Icon className="animate-spin" /> : "Submit"}</Button>
                        </RemixForm>
                    </Form>
                </TabsContent>
            </Tabs>
        </div >
    )
}
