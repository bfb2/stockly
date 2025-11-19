'use client'
import PieChart from "@/components/PieChart"
import Modal from "@/components/Modal"
import {useState} from 'react'
import Button from "@/components/Button"
import React from "react"
import { ReturnedPortfolioData, PortfolioState, PortfolioSettings, ReturnedData } from "@/types"
import ConfigurePortfolio from "./ConfigurePortfolio"
import { months } from "@/constants"

type Asset = {ticker:string; allocation:number;name:string}

const CreatePortfolio = ({setGrowthData, setLoading}:{setGrowthData:(data:ReturnedData)=>void, setLoading:(state:boolean)=>void}) =>{
    const year = new Date().getFullYear()
    const [portfolioSettings, setPortfolioSettings] = useState<PortfolioState>({
        data:{
            assets:{
                0:{ticker:'SPY', name:'SPDR S&P 500 ETF TRUST',allocations:[100,0,0]},
            },
            settings:{
                timePeriod:'Year-to-Year',
                startMonth:'Jan',
                startYear:`${year}`,
                startDay:'01',
                endMonth:'Dec',
                endYear:`${year}`,
                endDay:'31',
                cashflows:'None',
                contributionAmount:0,
                withdrawAmount:0,
                withdrawPercentage:0,
                frequency:'Annually',
                initial_amount:10000,
                rebalancing:'No Rebalancing',
                leverage:1,
                expenseRatio:0,
                dividends:true
            }
        },
        temp:{
            0:{ticker:'SPY', name:'SPDR S&P 500 ETF TRUST',allocations:[100,0,0]}
        }
    })

    const contructTickersAllocationUrl = () => {
        const assets = Object.values(portfolioSettings.temp)
        let allocationsUrl = ''
        let tickers = ''
        assets.forEach(({ticker, allocations}) =>{
            tickers += `tickers=${ticker}&`
            let allocationString = 'allocations='
            allocations.forEach((allocation, index) => {
                if(index == 2)
                    allocationString += `${allocation}&`
                else
                    allocationString += `${allocation},`
            })
            allocationsUrl+= allocationString
        })
        return {tickers, allocationsUrl}
    }

    const calcMonthNum = (month:number) => {
        if(month < 9)
            return String(month+1).padStart(2, '0')
        else
            return month + 1
    }

    const retrieveGrowthData = () =>{
        setLoading(true)
        const portfolios = returnPortfolioAssetsAndAllocations(portfolioSettings.temp) 
        if(!portfolios.every((portfolio)=>checkIfAllocationSum100(portfolio)))
            return
        
        const {settings:{dividends, expenseRatio, startMonth, endMonth, endYear, startYear, initial_amount, cashflows, rebalancing, leverage, frequency, contributionAmount, withdrawAmount,withdrawPercentage}} = portfolioSettings.data
        const startMonthNum  = calcMonthNum(months.indexOf(startMonth))
        const endMonthNum = calcMonthNum(months.indexOf(endMonth))
        const {tickers, allocationsUrl} = contructTickersAllocationUrl()

         fetch(`https://stockly-fvoz.onrender.com/backtrace-portfolio?start_date=${startYear}-${startMonthNum}-01&end_date=${endYear}-${endMonthNum}-${findLastDay(endYear, Number(endMonthNum))}&initial_amount=${initial_amount}&rebalancing=${rebalancing}&leverage=${leverage}&${tickers}${allocationsUrl}frequency=${frequency}&cashflows=${cashflows}&contribution_amount=${contributionAmount}&withdraw_amount=${withdrawAmount}&withdraw_pct=${withdrawPercentage}&reinvest_dividends=${dividends}&expense_ratio=${expenseRatio}`, {
            method:'GET',
            headers:{"Content-Type":'application/json'},
        }).then(res => res.json()).then((portfolios:ReturnedPortfolioData|string)=> {
                setLoading(false)
                const retrievedData = typeof(portfolios) == 'object' && 'annual' in portfolios
                const data = retrievedData? 
                {
                    growth:portfolios.growth, 
                    stats:portfolios.stats, 
                    annual:portfolios.annual,
                    starting:portfolioSettings.data.settings.initial_amount
                } 
                : 
                {error: 'Failed fetching data, please try again'}
                
                setGrowthData(data)
                if(retrievedData)
                    setPortfolioSettings(prev => ({...prev, data:{...prev.data, assets:prev.temp}}))      
        }) 
    }

    const portfolioData = returnPortfolioAssetsAndAllocations(portfolioSettings.data.assets)
    
    return <section>
        {
            portfolioData.map((portfolio, index) => {
                if(portfolio.length >0){
                    let key = ''
                    const labels:string[] = []
                    const items:number[] = []
                    portfolio.forEach(asset => {
                        key += `${asset.ticker} ${asset.allocation}`
                        labels.push(asset.ticker)
                        items.push(asset.allocation)
                    })
                    return <React.Fragment key={key}>
                        <div>
                            <div className="font-semibold text-2xl my-4">Portfolio #{index+1}</div>
                            <div className="flex">
                                <div className="basis-[60%]">    
                                    <table className="w-full">
                                        <thead className="border-1 border-b-gray-600">
                                            <tr className="*:text-left *:last:text-right">
                                                <th>Ticker</th>
                                                <th>Name</th>
                                                <th>Allocation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&>*:nth-child(odd)]:bg-[#344365]">
                                            {
                                                portfolio.map(asset => 
                                                <tr key={asset.ticker} className="*:text-left *:last:text-right border-1 border-b-gray-300">
                                                    <td>{asset.ticker}</td>
                                                    <td>{asset.name}</td>
                                                    <td>{asset.allocation}%</td>
                                                </tr>)
                                            }
                                        </tbody>
                                    </table>    
                                </div>
                            <div className="ml-auto mr-auto">
                                <PieChart key={key} labels={labels} items={items}/>
                            </div>
                            </div>
                        </div>
                    </React.Fragment>
                }
            })
        }
            <div className="mt-2.5">
                <Modal okBtnFN={retrieveGrowthData} formId="portfolio-settings" name="Portfolio Configuration"
                    trigger={<Button name="Edit Portfolio" type="button" extraClass={{base:"py-[5px] px-[10px] border-1 border-white hover:bg-white hover:text-[#1f283d]"}}/>} 
                    okBtnName="Analyze Portfolio">
                    <ConfigurePortfolio  portfolioSettings={portfolioSettings} setPortfolioSettings={setPortfolioSettings}/>
                </Modal>
            </div>
    </section>
} 

const findLastDay = (year:string, month:number) => {
    const day = new Date(Number(year), month, 0).getDay()
    switch (day) {
        case 6:
            return new Date(Number(year), month, -1).getDate()
        case 0:
            return new Date(Number(year), month, -2).getDate()
        default:
            return new Date(Number(year), month, 0).getDate()
    }
    
}

const checkIfAllocationSum100 = (portfolio:Asset[])=>{
    if(portfolio.length == 0)
        return true
    const allocationSum = portfolio.reduce((acc, curr)=> acc+curr.allocation, 0)
    return allocationSum == 100

}

const returnPortfolioAssetsAndAllocations = (data:PortfolioSettings['assets']) => {
    const portfolioData: [Asset[],Asset[],Asset[]] = [[],[],[]]
    Object.values(data).forEach(asset => asset.allocations.forEach((allocation, index) => {
        if(allocation > 0){
            portfolioData[index].push({ticker:asset.ticker, allocation:asset.allocations[index], name:asset.name}) 
        }
    }))
    return portfolioData
}

 export default CreatePortfolio