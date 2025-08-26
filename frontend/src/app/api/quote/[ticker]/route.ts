export const GET = async(req:Request, {params}: {params:Promise<{ticker:string}>}) => {
    const apikey = process.env.SECRET_FINNHUB_KEY
    const ticker = (await params).ticker
    const fetchRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apikey}`)
    const data = await fetchRes.json()
    return new Response(JSON.stringify(data.c))
}