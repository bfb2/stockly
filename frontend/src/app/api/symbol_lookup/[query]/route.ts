export const GET = async(req:Request, {params}: {params:Promise<{query:string}>}) =>{
    const apiKey = process.env.SECRET_FINNHUB_KEY
    const query = (await params).query
    const fetchReq = await fetch(`https://finnhub.io/api/v1/search?q=${query}&token=${apiKey}`)
    const data = await fetchReq.json()
    return new Response(JSON.stringify(data.result))
}