import { Link } from "@remix-run/react";
import { BookIcon, Clock12Icon } from "lucide-react";
import { cn } from "~/lib/utils";


export function Logo({
    iconSize = 20,
    textClassName
}: {
    iconSize?: number;
    textClassName?: string
}) {
    return (
        <Link
            to={"/"}
            className={cn(
                "flex items-center gap-x-1"
            )}
        >
            <Clock12Icon size={iconSize} className="stroke-primary" />
            <p className={cn("font-bold bg-primary text-transparent bg-clip-text", textClassName)}><span>Timed</span></p>
        </Link>
    )
}