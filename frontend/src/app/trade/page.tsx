import {headers} from 'next/headers'
import PaperTrade from "./_components/PaperTrade"

const page = async () =>{
    const headerStore = await headers()
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/proxy/paper-trade`,{
        cache:'no-store',
        headers:{
            cookie:headerStore.get('cookie')|| ''
        }
    })
    const data = await res.json()
    return <PaperTrade data={data}/>
} 


 export default page