import { z } from "zod";

export const teacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || (val && val?.length >= 6), {
      message: "Password must be at lease 6 characters",
    }),
  department: z.string().min(1, "Deparment is required"),
  staff_no: z.string().min(1, "Deparment is required"),
  unit: z.string().min(1, "Unit is required"),
});
export const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || (val && val?.length >= 6), {
      message: "Password must be at lease 6 characters",
    }),
  reg_no: z.string().min(1, "Deparment is required"),
});

export const AdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  auth_code: z
    .string()
    .optional()
    .refine((val) => !val || (val && val?.length >= 6), {
      message: "Password must be at lease 6 characters",
    }),
});

export const Schemas = {
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
