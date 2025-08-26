'use client'
import { useState, useEffect } from "react"
import MovingAverages from "./_components/MovingAverages"
import MACDChart from "./_components/MACDChart"
import MarketVolume from "./_components/MarketVolume"
import FullscreenLoader from "@/components/FullscreenLoader"
import { MarketInfo } from "@/types"
import LineChart from "@/components/LineChart"


const Page = () =>{
    const [stockData, setStockData] = useState<MarketInfo>({
        macd:{
            macd:[],
            histogram:[], 
            signal:[]
        }, 
        movingAverage:{
            fiftyDay:[], 
            twoHundredDay:[],
            parabolic:[],
            dates:[]
        }, 
        closePrices:[], 
        dates:[],
        volume:[],
        vix:[],
        rsi:[],
        T10Y2Y:{data:[], dates:[]}, 
        BAMLH0A0HYM2:{data:[], dates:[]}, 
        BAMLC0A0CM:{data:[], dates:[]},
        SAHMREALTIME:{data:[], dates:[]}, 
        T10Y3M:{data:[], dates:[]}, 
        IC4WSA:{data:[], dates:[]}, 
        CCSA:{data:[], dates:[]},
        CPIAUCSL:{data:[], dates:[]}, 
        CPILFESL:{data:[], dates:[]},
        PCEPI:{data:[], dates:[]},
        PCEPILFE:{data:[], dates:[]}, 
        lei:{data:[],months:[]}, 
        manufacturingpmi:[], 
        servicespmi:{data:[],months:[]}
    })

    useEffect(()=>{
        const worker = new Worker('/workers/fredWorker.js')
        worker.onmessage = e => {
            setStockData({...e.data})
            worker.terminate()
        }
        fetch('http://127.0.0.1:8000/market-analysis').then(res => res.json()).then(data => worker.postMessage(data))
    },[]) 
        
    return <main className="relative grid-cols-2 grid-rows-[50px_1fr_1fr_1fr_50px_1fr_1fr] grid">
        <FullscreenLoader displaySpinner={stockData.closePrices.length ==0}/>
        <div className="col-[1/-1] text-2xl font-bold">Market Stats</div>
        <MovingAverages data={stockData.movingAverage} stockPrices={stockData.closePrices} dates={stockData.dates} />
        <MarketVolume volume={stockData.volume} dates ={stockData.dates}/>
        <LineChart xaxis={stockData.dates} title="RSI" series={[{name:'RSI', data:stockData.rsi}]}/>
        <LineChart series={[{name:'VIX', data:stockData.vix}]} xaxis={stockData.dates} title="VIX"/>
        <MACDChart dates={stockData.dates} data={stockData.macd}/>
        <div className="col-[1/-1] text-2xl font-bold">Economic Stats</div>
        <LineChart series={[
            {
                data:stockData.T10Y2Y.data, 
                name:'10 Year and 2 Year'
            },
            {
                data:stockData.T10Y3M.data, 
                name:'10 Year and 3 Months'
            }]} 
            xaxis={stockData.T10Y2Y.dates} 
            title="Interest Rate Spreads"
        />
        <LineChart 
            series={
                [
                    {
                        data:stockData.BAMLH0A0HYM2.data, 
                        name:'High Yield Index Option-Adjusted Spread'
                    }, 
                    {
                        data:stockData.BAMLC0A0CM.data, 
                        name:'Corporate Index Option-Adjusted Spread'
                    }
                ]} 
            xaxis={stockData.BAMLH0A0HYM2.dates} 
            title="Corporate Bond Spreads"
        />
        <LineChart series={[{data:stockData.IC4WSA.data, name:'Claims'}]} xaxis={stockData.IC4WSA.dates} title="Unemployment Initial Claims, 4-Week Moving Average"/>
        <LineChart series={[{data:stockData.CCSA.data, name:'Claims'}]} xaxis={stockData.CCSA.dates} title="Continued Claims, Seasonally Adjusted"/>
        <LineChart 
            series={
                [
                    {
                        data:stockData.CPIAUCSL.data, 
                        name:'CPI'
                    },
                    {
                        data:stockData.CPILFESL.data, 
                        name:'Core CPI'
                    },
                    {
                        data:stockData.PCEPI.data,
                        name:'PCE'
                    },
                    {
                        data:stockData.PCEPILFE.data,
                        name:'Core PCE'
                    }
                ]} 
                xaxis={stockData.CPIAUCSL.dates} 
                title="Inflation"
        />
        <LineChart  title="U.S.A L.E.I" series={[{data:stockData.lei.data, name:'L.E.I'}]} xaxis={stockData.lei.months}/>
        <LineChart title="Manufacturing and Services PMI" 
            series={[{data:stockData.manufacturingpmi, name:'Manufacturing PMI'},{data:stockData.servicespmi.data, name:'Services PMI'}]} 
            xaxis={stockData.servicespmi.months}
        />
        <LineChart series={[{data:stockData.SAHMREALTIME.data, name:'Sahm Rule Recession Indicator'}]} xaxis={stockData.SAHMREALTIME.dates} title="Sahm Rule Recession Indicator"/>

    </main>
} 


 export default Page