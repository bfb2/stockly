import {ChartBarIcon, ChartLineUpIcon, CoinIcon} from "@phosphor-icons/react/dist/ssr"
import {Tooltip,TooltipContent,TooltipTrigger,} from "@/components/ui/tooltip"
import Link from "next/link";

const Navbar = () =>{
    return <nav className="bg-[#0f1527] text-white px-2 w-fit h-full  col-1 row-[1/-1] justify-center grid grid-rows-[40px_1fr]">
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
} 

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

 export default Navbar