'use client'
import LineChart from "@/components/LineChart"
import BarChart from "@/components/BarChart"
import CreatePortfolio from "./CreatePortfolio"
import React, { JSX, useState } from "react"
import { ReturnedPortfolioData, ChartSeries, ReturnedData } from "@/types"
import { formatMoney } from "@/functions/format-money"
import FullscreenLoader from "@/components/FullscreenLoader"
import ErrorMsg from "@/components/ErrorMsg"

const Backtrace = ({data}:{data:ReturnedData}) =>{
    const [errorMsg, setErrorMsg] = useState<string>()

    const [growthData, setGrowthData] = useState<ReturnedPortfolioData>()
    const updateGrowthData = (data:ReturnedData) => {
        if (isReturnedPortfolioData(data)){
            setErrorMsg(undefined)
            return setGrowthData(data)
        }
            
        setErrorMsg(data.error)
    }

    if(growthData == undefined && errorMsg == undefined)
        updateGrowthData(data)
    
    const portfolioGrowth:ChartSeries[] = [] 
    growthData?.growth.forEach((data,index) =>{
        const keys = Object.keys(data)
        if(keys.length != 0)
            portfolioGrowth.push({name:`Portfolio ${index+1}`, data:keys.map(key => ({x:key, y:data[key].total}))})
    } ) 

    const barChartSeries:ChartSeries[] = []
    const bestYears:JSX.Element[] =[]
    const worstYears:JSX.Element[] = []
    growthData?.annual.data.forEach((annualReturns,index) => {
        const years = Object.keys(annualReturns)
        if(years.length != 0)
            barChartSeries.push({name:`Portfolio ${index+1}`, data:years.map(year => ({x:Number(year), y:annualReturns[year]})
        )})

        const returns = Object.values(annualReturns)
        const bestYear = returns.length > 0 ? `${Math.max(...returns)}%` : '-'
        bestYears.push(<td key={`${bestYear}${index}`}>{bestYear}</td>)

        const worstYear = returns.length > 0 ? `${Math.min(...returns)}%` : '-'
        worstYears.push(<td key={`${worstYear}${index}`}>{worstYear}</td>)
    })

    const withdrawals:ChartSeries[] = []
    const startBalance: React.JSX.Element[] =[]
    const endBalance: React.JSX.Element[] = []
    const annualizedReturns:React.JSX.Element[] = []
    const drawdown:JSX.Element[] = []
    growthData?.stats.forEach(({withdraws, end, cagr, max}, index) => {
        startBalance.push(
            <td key={`${growthData.starting}${index}`}>
                {
                    typeof(end) == 'number' ? 
                    '$'+growthData.starting.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
                    : '-'
                }
            </td>
        )

        endBalance.push(
            <td key={`${end}${index}`}>{
                typeof(end) == 'number' ? 
                    `$${end.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`
                    : '-'
            }</td>
        )

        annualizedReturns.push(<td key={`${cagr}${index}`}>
                                    {typeof(cagr) == 'number' ? `${cagr.toFixed(2)}%`: '-'}
                                </td>)

        drawdown.push(<td key={`${max}${index}`}>{typeof(max) == 'number' ? `${max.toFixed(2)}%` : '-'}</td>)

        if(withdraws == undefined)
            return
        const years = Object.keys(withdraws)
        if(years.length != 0)
            withdrawals.push(
            {
                name:`Portfolio ${index+1}`, 
                data: years.map(year=> (
                    {
                        x:year, 
                        y:withdraws[year]
                    }
                ))
            })
    })

    const dates = Object.keys(growthData?.growth[0]||{})
    const [loading, setLoading] = useState(false)
    return <main className="relative">
        <FullscreenLoader displaySpinner={loading}/>
        {errorMsg && <ErrorMsg msg={errorMsg}/>}
        <CreatePortfolio setGrowthData={updateGrowthData} setLoading={(state:boolean)=>setLoading(state)}/>
        <section>
            <div className="font-semibold text-2xl my-4">Performance Summary</div>
            <table className="border-1 border-gray-400 w-[90%] justify-self-center ml-auto mr-auto">
                <thead>
                    <TableRow>
                        <>
                            <th>Metric</th>
                            <th>Portfolio #1</th>
                            <th>Portfolio #2</th>
                            <th>Portfolio #3</th>                            
                        </>
                    </TableRow>    
                </thead>
                <tbody>
                    <TableRow>
                        <>
                            <td>Start Balance</td>
                            {startBalance.length != 0 ? startBalance: placeholder}
                        </> 
                    </TableRow>
                    <TableRow>
                        <>
                            <td>End Balance</td>
                            {endBalance.length!=0? endBalance: placeholder}
                        </>      
                    </TableRow>
                    <TableRow>
                        <>
                            <td>Annualized Return</td>
                            {annualizedReturns.length!= 0? annualizedReturns: placeholder}
                        </>
                    </TableRow>
                    <TableRow>
                        <>
                            <td>Best Year</td>
                            {bestYears.length!=0? bestYears: placeholder}
                        </>
                    </TableRow>
                    <TableRow>
                        <>
                            <td>Worst Year</td>
                            {worstYears.length!=0? worstYears: placeholder}
                        </>
                    </TableRow>
                    <TableRow>
                        <>
                            <td>
                                Maximum Drawdown
                            </td>
                            {drawdown.length!= 0 ? drawdown:placeholder}
                        </>
                        
                    </TableRow>
                </tbody>
            </table>
        </section>
        <section>
            <div className="font-semibold text-2xl my-4">Portfolio Growth</div>
            <LineChart series={portfolioGrowth} xaxisType="datetime" xaxis={dates} row={rowOptions} formatter={(val)=>`$${formatMoney(val)}`} yaxisFormatter={(val)=>`$${formatMoney(val)}`}/>
        </section>
        {
            withdrawals.length > 0 &&
            <section>
                <div className="font-semibold text-2xl myw-4">Annual Withdrawals</div>
                <LineChart series={withdrawals} xaxis={growthData?.annual.years} xaxisType="category" row={rowOptions} yaxisFormatter={(val)=>`$${formatMoney(val)}`} tickAmount={growthData?.annual&&growthData.annual.years.length-1}/>
            </section>
        }
        <section>
            <div className="font-semibold text-2xl myw-4">Annual Returns</div>
            <BarChart series={barChartSeries}  xaxisType="numeric" xaxis={growthData?.annual.years} xaxisFormatter={(val) => Number(val).toFixed(0) } formatter={(val)=>`${val}%`}/>
        </section>
    </main>
} 

const TableRow = ({children}:{children:JSX.Element}) => {
    return <tr className="[&>*]:border-1 [&>*]:border-gray-400 [&>*]:text-right [&>*]:first:text-left [&>*]:py-1.5 [&>*]:px-3" >
        {children}
    </tr>
}
const placeholder = [<td key={1}>-</td>,<td key={2}>-</td>,<td key={3}>-</td>]
const rowOptions = {
    colors: ['#415480', 'transparent'], 
    opacity: 0.5
}


function isReturnedPortfolioData(data:ReturnedData): data is ReturnedPortfolioData{
    return 'annual' in data
}

 export default Backtrace