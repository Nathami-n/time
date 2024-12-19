import { Link, Outlet, redirect, useLoaderData } from "@remix-run/react";
import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { userCookie } from "~/lib/user-session";
import { TeacherSidebar } from "./teacherComponents/sidebar";
import Header from "./_dashboard/components/header";
import { AuthUserType, PossibleUsers } from "types/types";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";

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
    const { user } = useLoaderData<{ user: AuthUserType }>();

    if (user.role !== PossibleUsers.STAFF) {
        return (
            <div className="flex items-center w-full min-h-screen justify-center">
                <div className="flex flex-col items-center gap-y-2">
                    <LockKeyhole size={30} className="stroke-rose-600 size-6" />
                    <div className="text-muted-foreground text-sm"> This page is protected. If you believe that this is an error please <span className="text-blue-500 underline cursor-pointer">contact support</span></div>
                <Link  className={buttonVariants()} to="/"><ArrowLeft/> Back Home</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full md:flex">
            <TeacherSidebar />
            <div className="flex flex-col flex-1">
                <Header user={user} />
                <Outlet />
            </div>

        </div>
    )
}