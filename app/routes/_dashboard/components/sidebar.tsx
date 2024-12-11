import { Link } from "@remix-run/react"
import { BookAIcon, Calendar1Icon, KeyIcon, User2, UserIcon } from "lucide-react"
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
                    title: "Current",
                    url: "/",
                    icon: Calendar1Icon
                },
            ],
        },
        {
            title: "Managed",
            items: [
                {
                    title: "Academic Years",
                    url: "/academic-years",
                    icon: BookAIcon
                },
                {
                    title: "Students",
                    url: "students",
                    icon: User2
                },
                {
                    title: "Teachers",
                    url: "teachers",
                    icon: UserIcon
                },
                {
                    title: "Admins",
                    url: "admins",
                    icon: KeyIcon
                },
            ],
        },

    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <Logo iconSize={24}/>
            </SidebarHeader>
            <Separator />
            <SidebarContent>
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
                                            <Link to={item.url} className="flex items-center gap-x-1"> <item.icon /> {item.title}</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
