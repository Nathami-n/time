import { Link } from "@remix-run/react";
import {

    LogOut,

    Settings,
    User
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

export function UserModal({ children, user }: {
    children: React.ReactNode,
    user: {
        name: string;
        email: string;
        userId: string;
    }
}) {

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <div className="flex flex-col items-start p-1">
                    <p className="font-medium text-md">{user.name}</p>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <User />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                    <Link to="/logout" className="flex items-center gap-x-1">
                        <LogOut size={16}/> log out
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
