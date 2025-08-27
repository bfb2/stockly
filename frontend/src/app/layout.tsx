import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import {ChartBarIcon, ChartLineUpIcon, CoinIcon, UserCircleIcon} from "@phosphor-icons/react/dist/ssr"
import {auth, signOut} from "@/auth"
import { redirect } from "next/navigation";
import SessionWrapper from "@/components/SessionWrapper";
import {Tooltip,TooltipContent,TooltipTrigger,} from "@/components/ui/tooltip"


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stockly",
  description: "Practice your stock trading skills or backtest your strategies with Stockly",
};

const navItems = [

  {
    label: <ChartBarIcon size={32} weight="fill"/>,
    href: "/market-indicators",
    name:'Economic Health'
  },
  {
    label: <CoinIcon size={32} weight="fill"/>,
    href: "/trade",
    name:'Trade'
  },
  {
    label: <ChartLineUpIcon size={32} weight="fill"/>,
    href: "/backtrace-portfolio",
    name:'Backtest'
  },
  
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()
  console.log(session, 'the sesion')
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} dark antialiased grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] h-[100vh]`}
      >
        
          <header className="pr-1.5 pt-2 flex justify-end">
            {session ? 
              <form action={logoutAction}>
                <button type="submit" className="flex px-2.5 py-0.75 w-fit rounded-2xl border-1 border-white justify-self-end cursor-pointer gap-x-1">Sign out</button> 
              </form>
              :
              <Link href={'/signin'} className="flex px-2.5 py-0.75 rounded-2xl w-fit border-1 border-white justify-self-end cursor-pointer gap-x-1"><span>Sign in</span> <UserCircleIcon size={20} className="center-pos"/></Link>}
          </header>
          <nav className="bg-[#0f1527] text-white px-2 w-fit h-full  col-1 row-[1/-1] justify-center grid grid-rows-[40px_1fr]">
            <ul className="justify-items-center flex flex-col row-2">
              {navItems.map((item) => 
                <Tooltip key={item.href}>
                  <TooltipTrigger>
                    <li className="my-3" >
                      <Link href={item.href}>{item.label}</Link>
                    </li>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-black text-white">{item.name}</TooltipContent>
                </Tooltip>
                
              )}
            </ul>
          </nav>
          <SessionWrapper>
            {children}
          </SessionWrapper>
      </body>
    </html>
  );
}

const logoutAction = async () => {
  "use server";
  await signOut(); 
  redirect('/signin')
}


export const runtime = "nodejs"