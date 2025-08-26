onmessage = (e) => {
    const fredData = e.data.fred_stats
    const marketData = e.data.market
    const economicStats = e.data.stats
    const formattedData = {}

    
    formattedData.macd = {
        macd:Object.values(marketData.macd),
        histogram:Object.values(marketData.macd_hist),
        signal:Object.values(marketData.macd_signal)
    }
    const maDates = Object.keys(marketData.parabolic_SAR)
    formattedData.movingAverage = {
        dates:maDates,
        fiftyDay:Object.values(marketData.ma_50),
        twoHundredDay: Object.values(marketData.ma_200),
        parabolic:maDates.map(key => [marketData.parabolic_SAR[key],key])
    }
    
    formattedData.dates = marketData.dates
    formattedData.closePrices = marketData['S&P']

    formattedData.volume = marketData['s&p_volume'] 
    formattedData.vix=marketData['VIX']
    formattedData.rsi = Object.values(marketData.rsi)

    for (const key in fredData){
        const series = fredData[key]
        const dates = []
        const data = []
        series.forEach(seriesData => {
            dates.push(seriesData.date)
            data.push(seriesData.value)
        })
        formattedData[key] = {dates, data}
    }

    for (const key in economicStats){
        formattedData[key] = economicStats[key]
    }
    
    postMessage(formattedData)
}