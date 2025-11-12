import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import {UserCircleIcon} from "@phosphor-icons/react/dist/ssr"
import {auth, signOut} from "@/auth"
import { redirect } from "next/navigation";
import SessionWrapper from "@/components/SessionWrapper";
import Navbar from "@/components/Navbar"


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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()
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
          <Navbar/>
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