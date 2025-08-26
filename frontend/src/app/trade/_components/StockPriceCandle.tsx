'use client'
import CandleStickChart from "./CandleStickChart"
import { useState, useEffect} from "react"
import SearchInput from "@/components/SearchInput"
import { CandleStickChartData, ReturnedAlpacaData, ReturnedBarData, QuoteAlpacaResponse, StockInfo, QueryResult } from "@/types"

const StockPriceCandle = ({socketConnection, stockInfo, updateStockInfo}:
    {stockInfo:StockInfo, updateStockInfo:React.Dispatch<React.SetStateAction<StockInfo>>,socketConnection:WebSocket|undefined}) =>{
    
    const [displaySpinner, setDisplaySpinner] = useState(false)
    const updateStock = (stockInfo:QueryResult) => {
        updateStockInfo(prev => ({old:prev.new, new:stockInfo.symbol}))
    }
    const [barData, setBarData] = useState<CandleStickChartData[]>([])

    useEffect(()=>{        
             if(socketConnection?.readyState == 1 && stockInfo.new !== ''){
                const tickerActions = stockInfo.old == '' ? 
                [{action:'subscribe', ticker:[stockInfo.new]}] : 
                [{action:'unsubscribe', ticker:[stockInfo.old]},{action:'subscribe', ticker:[stockInfo.new]}]

                tickerActions.forEach(tickerAction =>  socketConnection.send(JSON.stringify(tickerAction)))
            } 
            
            fetch(`/api/bars/${stockInfo.new}`).then(res => res.json()).then((data:ReturnedAlphaAdvantageBarData) => {
                console.log('bars', data)
                const keys = Object.keys(data)
                const transformedData = keys.map(key => (
                    {
                        x:key, 
                        y:[
                            Number(data[key]['1. open']), 
                            Number(data[key]['2. high']), 
                            Number(data[key]['3. low']), 
                            Number(data[key]['4. close'])
                        ] as [number, number, number, number]
                    }))
                setBarData(transformedData)
                setDisplaySpinner(false)
            })
            
    },[stockInfo, socketConnection])

    useEffect(()=>{
        const handleMessage = (e:MessageEvent) => {
                const returnedData:ReturnedAlpacaData = JSON.parse(e.data)
                    returnedData.forEach(data => {
                        if(isBarData(data))
                            setBarData(prev => [...prev, {x:data.t, y:[data.o, data.h, data.l, data.c]}])
                    })
        }

        socketConnection?.addEventListener('message', handleMessage)
            
            return () => socketConnection?.removeEventListener('message', handleMessage)
    },[socketConnection])
    
    return <div className="col-[1/9]  row-[1/7]  h-full">
            <SearchInput getSelection={updateStock} displaySpinner={()=>setDisplaySpinner(true)}/>
            <div className="h-full relative">
                <CandleStickChart data={barData}/>
                {displaySpinner && <div className="loader absolute justify-self-center top-[50%]"></div>}
            </div>
    </div>
} 

type ReturnedAlphaAdvantageBarData = Record<string, {
    '1. open':string;
    '2. high':string;
    '3. low':string;
    '4. close':string;
    '5. volume':string
}>

function isBarData(data:QuoteAlpacaResponse | ReturnedBarData): data is ReturnedBarData{
    return data.T == 'b'
}

 export default StockPriceCandle