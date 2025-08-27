import {getToken} from "next-auth/jwt"

export const GET = async (req:Request) => {
    const token = await getToken({req, secret:process.env.AUTH_SECRET, raw:true})
    if(!token)
        return Response.json({error:'Not logged in'},{status:401})
    
    const res = await fetch('https://stockly-fvoz.onrender.com/paper-trade', {
        headers:{
            Authorization:`Bearer ${token}`
        }
    })
    const data = await res.json()
    return Response.json(data)  
}