import { createCookie } from "@remix-run/node";

export const userCookie = createCookie("user", {
    path: "/",
    httpOnly: process.env.NODE_ENV == "production",
    secure: true,
    sameSite: "lax",
    secrets: ["nathadihte"]
});

