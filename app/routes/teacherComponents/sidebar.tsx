import { Link, useLocation } from "@remix-run/react"
import { BookAIcon, Calendar1Icon, GraduationCap, KeyIcon, LogOutIcon, PlusCircle, Settings2, User2, UserIcon } from "lucide-react"
import * as React from "react"
import { Logo } from "~/components/logo"
import { Separator } from "~/components/ui/separator"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,

} from "~/components/ui/sidebar"
import { cn } from "~/lib/utils"


const data = {
    navMain: [
        {
            title: "Timetables",
            items: [
                {
                    title: "Schedule",
                    url: "/teacher/dashboard",
                    icon: Calendar1Icon
                },
            ],
        },
        {
            title: "Managed",
            items: [
                {
                    title: "Units",
                    url: "/teacher/units",
                    icon: BookAIcon
                },
            ],
        },

    ],
}

export function TeacherSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const path = useLocation().pathname;
    return (
        <Sidebar {...props} >
            <SidebarHeader>
                <Logo iconSize={24} />
            </SidebarHeader>
            <Separator />
            <SidebarContent className="flex flex-col">
                {/* We create a SidebarGroup for each parent. */}
                {data.navMain.map((item) => (
                    <SidebarGroup key={item.title}>
                        <SidebarGroupLabel className="uppercase b">{item.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {item.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild className={cn(

                                            )}>
                                            <Link
                                                to={item.url}
                                                className={cn("flex hover:bg-primary/10 transition-colors items-center text-muted-foreground gap-x-1",
                                                    item.url === path && "!hover:none bg-primary/20 text-primary"
                                                )}>
                                                <item.icon size={20} /> <span >{item.title}</span></Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
                <SidebarGroup className="mt-[50%]">
                    <SidebarGroupLabel className="uppercase">Other</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton className="w-full" asChild>
                                    <Link to="/logout" className={cn("flex hover:bg-primary/10 transition-colors items-center text-muted-foreground gap-x-1",
                                        "/logout" === path && "!hover:none bg-primary/20 text-primary"
                                    )}>
                                        <LogOutIcon size={20} className="text-muted-foreground" />
                                        <span className="text-muted-foreground">Logout</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
