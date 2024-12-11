import { Outlet } from "@remix-run/react";
import { AppSidebar } from "./components/sidebar";
import Header from "./components/header";



export default function DashBoardLayout() {
  return (
    <div className="w-full h-full md:flex">
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <Outlet />
      </div>

    </div>
  )
}