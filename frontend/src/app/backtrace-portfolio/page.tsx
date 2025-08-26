'use client'
import LineChart from "@/components/LineChart"
import BarChart from "@/components/BarChart"
import CreatePortfolio from "./_components/CreatePortfolio"
import { JSX, useState } from "react"
import { ReturnedPortfolioData, ChartSeries } from "@/types"
import { formatMoney } from "@/functions/format-money"
import FullscreenLoader from "@/components/FullscreenLoader"

const Backtrace = () =>{
    const [growthData, setGrowthData] = useState<ReturnedPortfolioData>()

    const portfolioGrowth:ChartSeries[] = [] 
    growthData?.growth.forEach((data,index) =>{
        const keys = Object.keys(data)
        if(keys.length != 0)
            portfolioGrowth.push({name:`Portfolio ${index+1}`, data:keys.map(key => ({x:key, y:data[key].total}))})
    } ) 

    const barChartSeries:ChartSeries[] = []
    growthData?.annual.data.forEach((annualReturns,index) => {
        const years = Object.keys(annualReturns)
        if(years.length != 0)
            barChartSeries.push({name:`Portfolio ${index+1}`, data:years.map(year => ({x:Number(year), y:annualReturns[year]})
        )})
    })

    const dates = Object.keys(growthData?.growth[0]||{})
    const [loading, setLoading] = useState(false)
    return <main className="relative">
        <FullscreenLoader displaySpinner={loading}/>
        <CreatePortfolio  setGrowthData={setGrowthData} setLoading={(state:boolean)=>setLoading(state)}/>
        <section>
            <div className="font-semibold text-2xl my-4">Performance Summary</div>
            <table className="border-1 border-gray-400 w-[90%] justify-self-center">
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
                            {growthData?.stats.map((data) => <td key={crypto.randomUUID()}>{typeof(data.end) == 'number' ? '$'+growthData.starting.toLocaleString(): '-'}</td>)?? placeholder}
                        </> 
                    </TableRow>
                    <TableRow>
                        <>
                            <td>End Balance</td>
                            {growthData?.stats.map(data => <td key={crypto.randomUUID()}>{typeof(data.end) == 'number' ? '$'+data.end.toLocaleString(): '-'}</td>)?? placeholder}
                        </>      
                    </TableRow>
                    <TableRow>
                        <>
                            <td>Annualized Return</td>
                            {growthData?.stats.map(data => <td key={crypto.randomUUID()}>{typeof(data.cagr) == 'number' ? data.cagr.toFixed(2)+'%': '-'}</td>)?? placeholder}
                        </>
                    </TableRow>
                    <TableRow>
                        <>
                            <td>Best Year</td>
                            {growthData?.annual.data.map(data => {
                                const annualData = Object.values(data)
                                return <td key={crypto.randomUUID()}>{annualData.length !== 0 ? Math.max(...annualData)+'%': '-'}</td>
                            })?? placeholder}
                        </>
                    </TableRow>
                    <TableRow>
                        <>
                            <td>Worst Year</td>
                            {growthData?.annual.data.map(data => {
                                const annualData = Object.values(data)
                                return <td key={crypto.randomUUID()}>{annualData.length !== 0 ? Math.min(...annualData)+'%': '-'}</td>
                            }) ?? placeholder}
                        </>
                    </TableRow>
                    <TableRow>
                        <>
                            <td>
                                Maximum Drawdown
                            </td>
                            {growthData?.stats.map(data => <td key={crypto.randomUUID()}>{typeof(data.max) == 'number' ? data.max.toFixed(2)+'%' : '-'}</td>)?? placeholder}
                            
                        </>
                        
                    </TableRow>
                </tbody>
            </table>
        </section>
        <section>
            <div className="font-semibold text-2xl my-4">Portfolio Growth</div>
            <LineChart series={portfolioGrowth} xaxisType="datetime" xaxis={dates} row={rowOptions} formatter={(val)=>`$${formatMoney(val)}`} yaxisFormatter={(val)=>`$${formatMoney(val)}`}/>
        </section>
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


 export default Backtrace