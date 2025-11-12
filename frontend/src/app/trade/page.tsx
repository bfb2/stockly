import {headers} from 'next/headers'
import PaperTrade from "./_components/PaperTrade"
import { PaperTradeAccInfo } from '@/types'

const page = async () =>{
    const headerStore = await headers()
    const res = await fetch('https://stockly-beryl-zeta.vercel.app/api/proxy/paper-trade',{
        cache:'no-store',
        headers:{
            cookie:headerStore.get('cookie')|| ''
        }
    })
    const data:PaperTradeAccInfo = await res.json() 
    
    return <PaperTrade data={data}/>
} 


 export default page