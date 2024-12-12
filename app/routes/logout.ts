import { redirect } from "@remix-run/node";
import { userCookie } from "~/lib/user-session";

export async function loader() {
  return redirect("/login", {
    headers: {
      "Set-Cookie": await userCookie.serialize(
        {},
        {
          maxAge: 0,
        }
      ),
    },
  });
}
