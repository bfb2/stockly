'use client'
import React from 'react'
import { useState } from 'react'
import { PaperTradeAccInfo } from '@/types'
import StockData from './StockData'
import AssetsAndHistory from './AssetsAndHistory'
import AccountValue from './AccountValue'

export default function PaperTrade({data}:{data:PaperTradeAccInfo }) {
    const [accountData, setAccountData] = useState('balance' in data ? data :dummyData)
    const fetchAccountData = (updateLoadingState:()=>void) => fetch('/api/proxy/paper-trade').then(res => res.json()).then(data => {setAccountData(data); updateLoadingState?.()})
    const buyingPower = accountData.balance
    let accountInfo: PaperTradeAccInfo['account_asset_info'] ={} 
    let tickers:string[] = []
    let daysProfits = 0
    let marketValue =0
    accountInfo = accountData.account_asset_info
    tickers = Object.keys(accountInfo)
    tickers.forEach(ticker => {
        marketValue += accountInfo[ticker]['current price'] * accountInfo[ticker].qty
        daysProfits += accountInfo[ticker].todays_return
    })
    
  return <main className="grid grid-cols-10 grid-rows-10 min-h-0">
        <StockData buyingPower={buyingPower} updateAccountData={fetchAccountData}/>
        <AssetsAndHistory tickers={tickers} orders={accountData.orders} profits={accountInfo} />
        <AccountValue balance={buyingPower} marketValue={marketValue} profitPercentData={daysProfits}/>
    </main>
}

const dummyData={
        balance:10000,
        'account_asset_info':{},
        'total_assets':0,
        orders:[]
    }