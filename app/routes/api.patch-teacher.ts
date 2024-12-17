import { ActionFunction, ActionFunctionArgs } from "@remix-run/node";
import { db } from "~/lib/db";
import bcrypt from "bcryptjs";
import { prismaKnownErrorrs } from "~/lib/errors";
import { Prisma } from "@prisma/client";

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const body = await request.json();
  console.log(body);
  if (!db) {
    return Response.json({
      success: false,
      error: "Database connection not found",
    });
  }
  try {
    const teacher = await db.teacher.findUnique({
      where: {
        id: body.id,
      },
      include: {
        department: true,
        unit: true,
      },
    });

    if (!teacher) {
      return Response.json({ success: false, error: "Teacher missing" });
    }

    const updatedData: Prisma.TeacherUpdateInput = {};

    if (body.password) {
      updatedData.password = await bcrypt.hash(body.password, 10);
    }

    if (body.unit && body.unit !== teacher.unit.id) {
      updatedData.unit = { connect: { id: body.unit } };
    }
    if (body.department && body.department !== teacher?.department?.id) {
      updatedData.unit = { connect: { id: body.unit } };
    }

    if (body.staff_no && body.staff_no !== teacher.staff_no) {
      updatedData.staff_no = body.staff_no;
    }
    if (body.name && body.name !== teacher.name) {
      updatedData.name = body.name;
    }
    if (body.email && body.email !== teacher.email) {
      updatedData.email = body.email;
    }

    console.log(updatedData);
    if (Object.keys(updatedData).length == 0) {
      return Response.json({ success: false, error: "No data provided" });
    }

    await db.teacher.update({
      where: {
        id: body.id,
      },
      data: updatedData,
    });

    return Response.json({ success: true, error: null });

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
};
