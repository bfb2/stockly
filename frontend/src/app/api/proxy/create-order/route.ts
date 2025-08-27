import {getToken} from "next-auth/jwt"

export const POST = async (req:Request) => {
    const token = await getToken({req, secret:process.env.AUTH_SECRET, raw:true})
    if(!token)
        return Response.json({error:'Not logged in'},{status:401})
    

    try {
        const body = await req.json()
        const res = await fetch('https://stockly-fvoz.onrender.com/create-order', {
            method:'POST',
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type":'application/json'
            },
            body:JSON.stringify(body)
        })
        const data = await res.json()
        return Response.json(data)
    } catch (error) {
        return Response.json(error)
    }

}