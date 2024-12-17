import { Link } from "@remix-run/react";
import { LightbulbIcon, TimerIcon, TimerOffIcon } from "lucide-react";
import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";


const links = [
  {
    id: 1,
    title: "FAQ"
  }, {
    id: 2,
    title: "Docs"
  },
  {
    id: 3,
    title: "Integrations",
  },
  {
    id: 4,
    title: "Pricing",
  }
]

export default function HomePage() {
  
  return (
    <div className="min-h-screen w-full relative">
       <div
        className="absolute  -z-20 w-[1000px] h-[1000px] rounded-full -top-32 -left-32 opacity-10"
        style={{
          background: "conic-gradient(from 0deg, #4facfe 0%, #00f2fe 50%, #4facfe 100%)",
        }}
      ></div>

      {/* Purple Conic Gradient */}
      <div
        className="absolute w-[1000px] -z-20 h-[1000px] rounded-full -bottom-32 -right-32 opacity-10"
        style={{
          background: "conic-gradient(from 0deg, #a18cd1 0%, #fbc2eb 50%, #a18cd1 100%)",
        }}
      ></div>

      <nav className="flex items-center justify-between w-full p-3 max-w-7xl mx-auto mt-3">
        <div>
          <Logo />
        </div>
        <ul className="flex items-center gap-x-7 text-sm text-primary">
          {links.map(link => (
            <li key={link.id}>
              <Link to="/">{link.title}</Link>
            </li>
          ))}
        </ul>
        <div className="">
          <Button variant={"secondary"} className="shadow-md text-primary">Start here</Button>
        </div>
      </nav>

      {/* hero image */}
      <div className="mt-[80px] max-md:px-2 max-w-xl mx-auto flex flex-col items-center space-y-1">
        <p className="uppercase text-sm text-primary max-md:text-xs"> An automated Timetable</p>
        <p className=" max-md:text-3xl text-5xl font-semibold flex items-center">Redeem your time <TimerIcon className="stroke-primary" size={40} />,</p>
        <p className=" max-md:text-3xl text-5xl gap-x-1 font-semibold flex items-center "> Move <LightbulbIcon size={40} className="bg-yellow-400 stroke-primary rounded-lg p-1"/> with speed</p>
        <p className="text-muted-foreground max-md:text-sm">Generate and onboard tutors and students in no time</p>
          <div className="mt-6 ring-4 outline-4 rounded-lg shadow-xl ring-inset  border p-4">
            <img src="/table.png" alt="home" />
          </div>
      </div>

    </div>
  )
}
