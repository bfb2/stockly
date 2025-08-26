export const GET = async(req:Request, {params}: {params:Promise<{ticker:string}>}) => {
    const ticker = (await params).ticker
    const apikey = process.env.ALPHAVANTAGE_API_KEY
    const res = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=1min&apikey=${apikey}`)
    const data = await res.json()
    const returnedData = data['Time Series (1min)']
    return new Response(JSON.stringify(returnedData))
}