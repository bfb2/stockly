'use client'
import { useState, useEffect } from "react"
import StockPriceCandle from "./StockPriceCandle"
import OrderEntry from "./OrderEntry"
import { StockInfo } from "@/types"

const StockData = ({buyingPower, updateAccountData}:{buyingPower:number, updateAccountData:(afterFetchActions: () => void) => void}) =>{
    const [socket, setSocket] = useState<WebSocket>()
    const [stock, setStock] = useState<StockInfo>({old:'', new:''})

    useEffect(()=>{
            if(!socket)
                setSocket(new WebSocket('ws://localhost:8000/ws/stream/'))
            return () => socket?.close()
        },[socket]) 
    return <>
        <StockPriceCandle socketConnection={socket} stockInfo={stock} updateStockInfo={setStock}/>
        <OrderEntry socketConnection={socket} stockInfo={stock} buyingPower={buyingPower} updateAccountData={updateAccountData}/>
    </>
} 

 export default StockData