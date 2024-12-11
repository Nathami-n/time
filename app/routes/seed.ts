import { db } from "~/lib/db";

export async function loader() {
  await db?.administrator.create({
    data: {
      auth_code: "natenate",
      email: "admin@gmail.com",
      name: "Nathan George",
    },
  });

}
