import { zodResolver } from "@hookform/resolvers/zod";
import { Administrator, Student } from "@prisma/client";

import { useFetcher } from "@remix-run/react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ApiResponseType } from "types/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Button, buttonVariants } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
} from "~/components/ui/dialog";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormControl,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
    SelectItem
} from "~/components/ui/select";
import { AdminSchema, studentSchema, teacherSchema } from "~/lib/zod";

export function EditTeacherModal({
    open,
    setOpen,
    units,
    departments,
    teacherData
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    units: any,
    departments: any,
    teacherData: any,
}) {
    const fetcher = useFetcher();
    const form = useForm({
        resolver: zodResolver(teacherSchema),
        defaultValues: {
            name: "",
            email: "",
            password: undefined,
            staff_no: "",
            department: "",
            unit: ""
        },
    });


    const prevTeacherDataRef = useRef(null);

    useEffect(() => {
        if (teacherData && prevTeacherDataRef.current !== teacherData.id) {
            // Reset the form only when teacherData changes and is different from the previous one
            form.reset({
                name: teacherData?.name,
                email: teacherData?.email,
                password: undefined,
                staff_no: teacherData?.staff_no,
                department: teacherData?.department.id,
                unit: teacherData?.unit.id,
            });
            prevTeacherDataRef.current = teacherData.id;
        }
    }, [teacherData, form]);


    const onSubmit = (values: any) => {
        try {
            const updateData: any = {};
            Object.keys(values).forEach(key => {
                if (values[key] !== teacherData[key]) {
                    updateData[key] = values[key];
                }
            });

            // If there's no data to update, do not send anything
            if (Object.keys(updateData).length === 0) {
                toast.info("No changes made");
                return;
            }

            values.id = teacherData.id
            fetcher.submit(values, {
                action: "/api/patch-teacher",
                method: "post",
                encType: "application/json",
            });
            const res_data = fetcher.data as ApiResponseType

            if (res_data && !res_data.success) {
                toast.error(res_data.error as string);
            }
            toast.success("Success in updating the teacher");


        } catch (e: any) {
            console.log(e)
            toast.error("Failed to update the teacher");
        }
    };

    return (

        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-md:h-[600px] rounded-sm p-6 overflow-y-auto overflow-x-hidden">
                <DialogHeader>Edit the teacher details</DialogHeader>
                <DialogDescription>
                    You can change the details of the tutor here
                </DialogDescription>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {/* Name */}
                            <FormField
                                name="name"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter Name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Email */}
                            <FormField
                                name="email"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="test@gmail.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Password */}
                            <FormField
                                name="password"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Staff No */}
                            <FormField
                                name="staff_no"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Staff No</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="HSL-222"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Department */}
                            <FormField
                                name="department"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departments.map(
                                                        (dept: {
                                                            id: string;
                                                            name: string;
                                                        }) => (
                                                            <SelectItem
                                                                key={dept.id}
                                                                value={dept.id}
                                                            >
                                                                {dept.name}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Unit */}
                            <FormField
                                name="unit"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {units.map(
                                                        (unit: {
                                                            id: string;
                                                            name: string;
                                                        }) => (
                                                            <SelectItem
                                                                key={unit.id}
                                                                value={unit.id}
                                                            >
                                                                {unit.name}
                                                            </SelectItem>
                                                        )
                                                    )}
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
                                disabled={fetcher.state === "submitting"}
                                type="submit"
                            >
                                {fetcher.state === "submitting"
                                    ? "Please wait..."
                                    : "Submit"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

    );
}
export function EditStudentModal({
    open,
    setOpen,
    studentData
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    studentData: Student,
}) {
    const fetcher = useFetcher();
    const form = useForm({
        resolver: zodResolver(studentSchema),
        defaultValues: {
            name: "",
            email: "",
            password: undefined,
            reg_no: "",
        },
    });


    const prevStudentRef = useRef<null | string>(null);

    useEffect(() => {
        if (studentData && prevStudentRef.current !== studentData.id) {
            // Reset the form only when studentData changes and is different from the previous one
            form.reset({
                name: studentData?.name,
                email: studentData?.email,
                password: undefined,
                reg_no: studentData?.reg_no,
            });
            prevStudentRef.current = studentData.id;
        }
    }, [studentData, form]);


    const onSubmit = (values: any) => {
        try {
            const updateData: any = {};
            Object.keys(values).forEach(key => {
                if (values[key] !== studentData[key]) {
                    updateData[key] = values[key];
                }
            });

            // If there's no data to update, do not send anything
            if (Object.keys(updateData).length === 0) {
                toast.info("No changes made");
                return;
            }

            values.id = studentData.id
            fetcher.submit(values, {
                action: "/api/patch-student",
                method: "post",
                encType: "application/json",
            });
            const res_data = fetcher.data as ApiResponseType

            if (res_data && !res_data.success) {
                toast.error(res_data.error as string);
            }
            toast.success("Success in updating the student");

        } catch (e: any) {
            console.log(e)
            toast.error("Failed to update the student");
        }
    };

    return (

        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-md:h-[600px] rounded-sm p-6 overflow-y-auto overflow-x-hidden">
                <DialogHeader>Edit the student details</DialogHeader>
                <DialogDescription>
                    You can change the details of the student here
                </DialogDescription>
                <Form {...form}>
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
                </Form>
            </DialogContent>
        </Dialog>

    );
}
export function EditAdminModal({
    open,
    setOpen,
    adminData
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    adminData: Administrator,
}) {
    const fetcher = useFetcher();
    const form = useForm({
        resolver: zodResolver(AdminSchema),
        defaultValues: {
            name: "",
            email: "",
            auth_code: ""
        },
    })


    const prevAdminRef = useRef<null | string>(null);

    useEffect(() => {
        if (adminData && prevAdminRef.current !== adminData.id) {
            // Reset the form only when adminData changes and is different from the previous one
            form.reset({
                name: adminData?.name,
                email: adminData?.email,
                auth_code: undefined,
            });
            prevAdminRef.current = adminData.id;
        }
    }, [adminData, form]);


    const onSubmit = (values: any) => {
        try {
            const updateData: any = {};
            Object.keys(values).forEach(key => {
                if (values[key] !== adminData[key]) {
                    updateData[key] = values[key];
                }
            });

            // If there's no data to update, do not send anything
            if (Object.keys(updateData).length === 0) {
                toast.info("No changes made");
                return;
            }

            values.id = adminData.id
            fetcher.submit(values, {
                action: "/api/patch-admin",
                method: "post",
                encType: "application/json",
            });
            const res_data = fetcher.data as ApiResponseType

            if (res_data && !res_data.success) {
                toast.error(res_data.error as string);
            }
            toast.success("Success in updating the admin");

        } catch (e: any) {
            console.log(e)
            toast.error("Failed to update the admin");
        }
    };

    return (

        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-md:h-[600px] rounded-sm p-6 overflow-y-auto overflow-x-hidden">
                <DialogHeader>Edit the admin details</DialogHeader>
                <DialogDescription>
                    You can change the details of the admin here
                </DialogDescription>
                <Form {...form}>
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
                </Form>
            </DialogContent>
        </Dialog>

    );
}





export function DeleteTeacherModal({ id, name, open, setOpen }: { id: string, name: string, open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
    const [value, setValue] = useState<string>();
    const fetcher = useFetcher();

    const handleDelete = () => {
        try {
            fetcher.submit({ id }, {
                action: "/api/delete-teacher",
                encType: "application/json",
                method: "post"
            });
            const res_data = fetcher.data as ApiResponseType;
            if (res_data && !res_data.success) {
                toast.error(res_data.error);
                setValue("")
                return;
            }
            toast.success("Teacher deleted successfully");
            setValue("")
        } catch (err: any) {
            toast.error("Failed to delete the given value")
            setValue("")
        }
    }
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this teacher?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be reversed</AlertDialogDescription>
                    <AlertDialogDescription>If you are sure you want to do it enter <strong>{name}</strong> and then click proceed</AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                    value={value}
                    onChange={e => setValue(e.target.value)}
                />

                <AlertDialogFooter>
                    <AlertDialogCancel>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={value !== name || fetcher.state === "submitting"}
                        className={buttonVariants({
                            variant: "destructive"
                        })}>
                        {fetcher.state === "submitting" ? "Deleting..." : "Proceed"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )

}



export function DeleteStudentModal({ id, name, open, setOpen }: { id: string, name: string, open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
    const [value, setValue] = useState<string>();
    const fetcher = useFetcher();
    const handleDelete = () => {
        try {
            fetcher.submit({ id }, {
                action: "/api/delete-student",
                encType: "application/json",
                method: "post"
            });
            const res_data = fetcher.data as ApiResponseType;
            if (res_data && !res_data.success) {
                toast.error(res_data.error);
                setValue("")
                return;
            }
            toast.success("Student deleted successfully");
            setValue("")
        } catch (err: any) {
            toast.error("Failed to delete the given value")
            setValue("")
        }
    }
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this student?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be reversed</AlertDialogDescription>
                    <AlertDialogDescription>If you are sure you want to do it enter <strong>{name}</strong> and then click proceed</AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                    value={value}
                    onChange={e => setValue(e.target.value)}
                />

                <AlertDialogFooter>
                    <AlertDialogCancel>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={value !== name || fetcher.state === "submitting"}
                        className={buttonVariants({
                            variant: "destructive"
                        })}>
                        {fetcher.state === "submitting" ? "Deleting..." : "Proceed"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )

}
export function DeleteAdminModal({ id, name, open, setOpen }: { id: string, name: string, open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
    const [value, setValue] = useState<string>();
    const fetcher = useFetcher();
    const handleDelete = () => {
        try {
            fetcher.submit({ id }, {
                action: "/api/delete-admin",
                encType: "application/json",
                method: "post"
            });
            const res_data = fetcher.data as ApiResponseType;
            if (res_data && !res_data.success) {
                toast.error(res_data.error);
                setValue("")
                return;
            }
            toast.success("Admin deleted successfully");
            setValue("")
        } catch (err: any) {
            toast.error("Failed to delete the given value")
            setValue("")
        }
    }
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this admin?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be reversed</AlertDialogDescription>
                    <AlertDialogDescription>If you are sure you want to do it enter <strong>{name}</strong> and then click proceed</AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                    value={value}
                    onChange={e => setValue(e.target.value)}
                />

                <AlertDialogFooter>
                    <AlertDialogCancel>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={value !== name || fetcher.state === "submitting"}
                        className={buttonVariants({
                            variant: "destructive"
                        })}>
                        {fetcher.state === "submitting" ? "Deleting..." : "Proceed"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )

}
