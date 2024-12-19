
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "~/components/ui/breadcrumb";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useLocation } from "@remix-run/react";
import { Logo } from "~/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { UserModal } from "./user-modal";
import { AuthUserType } from "types/types";



export default function Header({
    user
}: { user: AuthUserType }
) {
    const path = useLocation().pathname.trim();
    const array = path.split("/").slice(-1);
    return (
        <div className="flex items-center py-2 px-2 pb-3 border-b pl-4  w-full justify-between">
            <div>
                <div className="md:hidden">
                    <Logo />
                </div>
                <div className="max-md:hidden">
                    <Breadcrumb>
                        <BreadcrumbList>
                            {array.map((link, i) => (
                                <><BreadcrumbItem key={i}>
                                    <BreadcrumbLink href={link == "dashboard" ? "/dashboard" : link}>
                                        {link}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                </>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>
            <div className=" flex items-center gap-x-2">
                <UserModal user={user}>
                    <Avatar className="h-8 w-8">
                        <AvatarImage className="cursor-pointer" src="https://github.com/shadcn.png" alt="user" />
                        <AvatarFallback className="cursor-pointer">US</AvatarFallback>
                    </Avatar>
                </UserModal>
                <SidebarTrigger className="md:hidden" />
            </div>
        </div>
    )
}
