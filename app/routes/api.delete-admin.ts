import { Prisma } from "@prisma/client";
import { ActionFunctionArgs } from "@remix-run/node";
import { db } from "~/lib/db";
import { prismaKnownErrorrs } from "~/lib/errors";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { id } = await request.json();
  try {
    if (!db) {
      return Response.json(
        { success: false, error: "No database connection found" },
        { status: 404 }
      );
    }
    if (!id) {
      return Response.json({ success: false, error: "no id exists" });
    }
    const deletedRecord = await db.administrator.delete({
      where: { id },
    });
    if (!deletedRecord) {
      return Response.json({ success: false, error: "No record found" });
    }

    return Response.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to delete:", error);
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
