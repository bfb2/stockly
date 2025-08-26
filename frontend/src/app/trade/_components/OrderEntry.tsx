'use client'
import React, {useState, useEffect, useRef} from "react"
import Input from "@/components/Input"
import InputWithIcon from "@/components/InputWithIcon"
import { PercentIcon, CurrencyDollarIcon } from "@phosphor-icons/react/dist/ssr"
import {QuoteAlpacaResponse, ReturnedAlpacaData, ReturnedBarData, StockInfo } from "@/types"
import { formatMoney } from "@/functions/format-money"

const OrderEntry = ({socketConnection, stockInfo, buyingPower, updateAccountData}:{updateAccountData:(afterFetchActions: () => void) => void,buyingPower:number, stockInfo:StockInfo,socketConnection:WebSocket|undefined}) =>{
    const [stockPrice, setStockPrice] = useState<number>()
    const noStockSelected = stockPrice == undefined
    const latestPriceRef = useRef<number>(null)
    useEffect(()=>{
        fetch(`api/quote/${stockInfo.new}`).then(res => res.json()).then(price => setStockPrice(price))
    },[stockInfo.new])

    useEffect(() => {
        const handleMessage = (e:MessageEvent<string>) => {
            const returnedData:ReturnedAlpacaData = JSON.parse(e.data)
            returnedData.forEach(data => {
                if(isAlpacaQuote(data))
                    latestPriceRef.current = data.ap
            })
        }

        const buffer = setInterval(()=>{
            if(latestPriceRef.current){
                setStockPrice(latestPriceRef.current)
                latestPriceRef.current = null
            }
        }, 5000)
        socketConnection?.addEventListener('message', handleMessage)

        return () => {socketConnection?.removeEventListener('message', handleMessage); clearInterval(buffer)}
    }, [socketConnection])

    
    const [orderDetails, setOrderDetails] = useState<OrderDetails>({
        orderType:'Market',
        orderTypeDetails:{
            limitPrice:null,
            stopPrice:null,
            trailDollars:null,
            trailRate:null
        },
        quantity:1,
        timeInForce:'DAY',
        side:'Buy'
    })

    const updateOrderDetails = (e:React.ChangeEvent<HTMLSelectElement>, field:keyof OrderDetails) =>{
        setOrderDetails(prev => ({...prev, [field]:e.target.value}))
    }

    const updateOrderTypeDetails = (value:string, field:'Stop'|'Limit'|'price'|'rate') =>{
        
        switch (field) {
            case 'Stop':
                setOrderDetails(prev => ({
                    ...prev, 
                    orderTypeDetails:{
                        stopPrice: Number(value),
                        limitPrice: prev.orderType == 'Stop Limit' ? prev.orderTypeDetails.limitPrice : null,
                        trailDollars:null,
                        trailRate:null
                    }
                }))
                break;
            case 'Limit':
                setOrderDetails(prev => ({
                    ...prev, 
                    orderTypeDetails:{
                        stopPrice: prev.orderType == 'Stop Limit' ? prev.orderTypeDetails.stopPrice : null,
                        limitPrice: Number(value),
                        trailDollars:null,
                        trailRate:null
                    }
                }))
                break
            case 'price':
                setOrderDetails(prev => ({
                    ...prev, 
                    orderTypeDetails:{
                        stopPrice: null,
                        limitPrice: null,
                        trailDollars:Number(value),
                        trailRate:null
                    }
                }))
                break
            case 'rate':
                setOrderDetails(prev => ({
                    ...prev, 
                    orderTypeDetails:{
                        stopPrice: null,
                        limitPrice: null,
                        trailDollars:null,
                        trailRate:Number(value)
                    }
                }))
                break
            default:
                break;
        }
    }

    const [trailType, setTrailType] = useState<'rate'|'price'>('price')
    
    const [orderPending, setOrderPending] = useState(false)
    return <div className="grid grid-cols-[50%_50%] col-[9/-1] row-[1/9] auto-rows-max gap-y-8.5 border-1 border-gray-400 px-5 py-5 ">
        
        <button onClick={() => setOrderDetails(prev => ({...prev, side:'Buy'}))} className={`py-1.25 h-fit w-[100%] ${orderDetails.side == 'Buy' ? 'bg-emerald-500 text-white' : 'bg-gray-300	text-gray-600'} cursor-pointer rounded-sm relative left-slanted-btn`}>Buy</button>
        <button onClick={() => setOrderDetails(prev => ({...prev, side:'Sell'}))} className={`${orderDetails.side == 'Sell' ? 'bg-rose-500 text-white' : 'bg-gray-300	text-gray-600	'} h-fit right-slanted-btn py-1.25 w-[100%]  rounded-sm cursor-pointer relative `}>Sell</button>
        
        <span>Market Price</span>
        <span className="text-right">{stockPrice || '-'}</span>
        
        <LabelAndItem label="Order Type" item={<Dropdown options={orderTypes} onSelection={(e)=>updateOrderDetails(e, 'orderType')}/>} extraClass="mr-2"/>
        <LabelAndItem label="Quantity" item={<Input value={orderDetails.quantity} onKeydown={(e)=>
            setOrderDetails(prev => (
                {...prev, 
                'quantity':Number(e.currentTarget.value)
                }
                ))}/>}/>
        
        {(orderDetails.orderType == 'Limit' || orderDetails.orderType == 'Stop') && 
            <LabelAndItem label={`${orderDetails.orderType} Price`} item={<Input onKeydown={e => updateOrderTypeDetails(e.currentTarget.value, orderDetails.orderType as "Limit"|'Stop')}/>} extraClass="col-[1/-1]"/>
        }
        {orderDetails.orderType == 'Stop Limit' && <LabelAndItem label="Stop Price" item={<Input onKeydown={e => updateOrderTypeDetails(e.currentTarget.value, 'Stop')}/>} extraClass="mr-1.5"/>}
        {orderDetails.orderType == 'Stop Limit' && <LabelAndItem label="Limit Price" item={<Input onKeydown={e => updateOrderTypeDetails(e.currentTarget.value, 'Limit')}/>}/>}
        {orderDetails.orderType == 'Trailing Stop' && 
            <div className="col-[1/-1]">
                <input type="radio" checked={trailType == 'rate'} onClick={()=>setTrailType('rate')}/>
                <label>Trail Rate</label>
                <input type="radio" checked={trailType == 'price'} className="ml-1.25" onClick={()=>setTrailType('price')}/>
                <label>Trail Price</label>
            </div>
        }
        {orderDetails.orderType == 'Trailing Stop' && 
            (trailType == 'rate' ? 
                <InputWithIcon onChange={e => updateOrderTypeDetails(e, 'rate')} iconPos="right" icon={<PercentIcon size={20} className="center-pos"/>} extraClass="col-[1/-1]"/>
            :   <InputWithIcon onChange={e => updateOrderTypeDetails(e, 'price')}  iconPos="left" icon={<CurrencyDollarIcon size={20} className="center-pos"/>} extraClass="col-[1/-1]"/>)
        }
        
        <LabelAndItem label="Time-in-Force" item={<Dropdown options={timeInForce} onSelection={(e)=>updateOrderDetails(e, 'timeInForce')}/>} extraClass="col-[1/-1]"/>
        
        <button onClick={()=>{
            if(stockInfo.new !== undefined){
                setOrderPending(true)
                const {quantity, orderType, timeInForce, side, orderTypeDetails} = orderDetails
                const data = {
                    ticker:stockInfo.new,
                    qty:quantity,
                    order_type:orderType,
                    side,
                    time_in_force:timeInForce,
                    order_type_details:orderTypeDetails
                }
                fetch('/api/proxy/create-order', {
                    method:'POST',
                    headers:{"Content-Type":'application/json'},
                    body:JSON.stringify(data)
                }).then(()=>{updateAccountData(()=>setOrderPending(false));})
            }
            }}
            disabled={noStockSelected} 
            title={'You must search for and select a stock in order to purchase'}
            className={`bg-gradient-to-r from-orange-500 to-orange-300 w-full rounded-xs col-[1/-1] py-1.5 ${buyingPower > 0 && !noStockSelected? "cursor-pointer":"cursor-not-allowed opacity-50"} `}>
                {orderPending? <div className="dots-loader justify-self-center"></div>:'Buy'}
        </button>
        <div>Estimated Amount</div>
        <div className="text-right">{stockPrice ? (stockPrice*orderDetails.quantity).toFixed(2) : '-'}</div>
        <div className="col-[1/-1] border-1 border-gray-400"></div>
        <div>Buying Power</div>
        <div className="text-right">${formatMoney(buyingPower)}</div>
    </div>
} 

const orderTypes = ['Market', 'Limit','Stop','Stop Limit','Trailing Stop']
const timeInForce = ['DAY', 'GTC - Good til Cancelled', 'FOK - Fill or Kill', 'IOC - Immediate or Cancel', 'OPG - At the Open', 'CLS - At the Close']

const Dropdown = ({options, onSelection}:{options:string[], onSelection:(e:React.ChangeEvent<HTMLSelectElement>)=>void}) => {
    return <select onChange={(e)=>onSelection(e)}>
        {options.map(option => <option value={option} className="bg-[#1f283d]" key={option}>{option}</option>)}
    </select>
}


interface OrderDetails{
    orderType:'Market'|'Limit'|'Stop'|'Stop Limit'|'Trailing Stop';
    orderTypeDetails:{
        stopPrice:number|null,
        limitPrice:number|null,
        trailRate:number|null,
        trailDollars:number|null
    };
    quantity:number;
    timeInForce: 'DAY'|'GTC - Good til Cancelled',
    side:'Buy'|'Sell',

}

const LabelAndItem = ({label, item, extraClass}:{extraClass?:string, label:string, item:React.JSX.Element}) => {
    return <div className={`flex flex-col h-fit ${extraClass}`}>
        <label>{label}</label>
        {item}
    </div>
}

function isAlpacaQuote(data:QuoteAlpacaResponse | ReturnedBarData): data is QuoteAlpacaResponse{
    return data.T == 'q'
}
 export default OrderEntry