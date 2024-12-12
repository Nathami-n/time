import { Outlet, redirect, useLoaderData } from "@remix-run/react";
import { AppSidebar } from "./components/sidebar";
import Header from "./components/header";
import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { userCookie } from "~/lib/user-session";

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  const user = await userCookie.parse(request.headers.get("cookie"));
  if (!user) {
    return redirect("/login", {
      headers: {
        "Set-Cookie": await userCookie.serialize({}, {
          maxAge: 0
        })
      }
    });
  }
  return Response.json({
    user
  })
}

export default function DashBoardLayout() {
  const { user } = useLoaderData<{ user: { name: string, email: string, userId: string } }>();

  return (
    <div className="w-full h-full md:flex">
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <Header user={user} />
        <Outlet />
      </div>

    </div>
  )
}