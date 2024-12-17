import { z } from "zod";

export const teacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z
    .string().optional().refine(
      (val) => !val || (val && val?.length >=6),
      {
        message: "Password must be at lease 6 characters"
      }
    ),
  department: z.string().min(1, "Deparment is required"),
  staff_no: z.string().min(1, "Deparment is required"),
  unit: z.string().min(1, "Unit is required"),
});
