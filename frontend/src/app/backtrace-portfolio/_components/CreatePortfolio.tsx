'use client'
import PieChart from "@/components/PieChart"
import Modal from "@/components/Modal"
import {useState} from 'react'
import SearchInput from "@/components/SearchInput"
import Button from "@/components/Button"
import React from "react"
import Input from "@/components/Input"
import { PlusCircleIcon } from "@phosphor-icons/react/dist/ssr"
import { JSX } from "react"
import { QueryResult, ReturnedPortfolioData } from "@/types"

type Months = 'Jan'|'Feb'|'Mar'|'Apr'|'May'|'Jun'|'Jul'|'Aug'|'Sep'|'Oct'|'Nov'|'Dec' 

interface PortfolioSettings{
    assets: Record<number, {ticker:string, allocations:[number, number, number], name:string}>;
    settings: {
        timePeriod:'Month-to-Month'|'Year-to-Year';
        startMonth: Months
        startYear:string;
        endMonth:Months;
        endYear:string;
        cashflows: 'None'|'Contribute fixed amount'|'Withdraw fixed amount'|'Withdraw fixed percentage';
        contributionAmount:number;
        withdrawAmount:number;
        withdrawPercentage:number;
        frequency: 'Annually'|'Monthly'|'Quarterly'
        initial_amount: number;
        rebalancing: string;
        leverage: number;
        expenseRatio:number;
        dividends:boolean
    };
}

interface PortfolioState{
    data:PortfolioSettings;
    temp:PortfolioSettings['assets']
}

type Asset = {ticker:string; allocation:number;name:string}

const CreatePortfolio = ({setGrowthData, setLoading}:{setGrowthData:(data:ReturnedPortfolioData)=>void, setLoading:(state:boolean)=>void}) =>{
    const [portfolioSettings, setPortfolioSettings] = useState<PortfolioState>({
        data:{
            assets:{
                0:{ticker:'SPY', name:'SPDR S&P 500 ETF TRUST',allocations:[100,0,0]},
            },
            settings:{
                timePeriod:'Year-to-Year',
                startMonth:'Jan',
                startYear:'2000',
                endMonth:'Dec',
                endYear:'2020',
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
         fetch('http://127.0.0.1:8000/backtrace-portfolio', {
            method:'POST',
            headers:{"Content-Type":'application/json'},
            body:JSON.stringify({
                start_date:`${startYear}-${startMonthNum}-1`,
                end_date:`${endYear}-${endMonthNum}-${findLastDay(endYear, Number(endMonthNum))}`,
                initial_amount,
                rebalancing,
                leverage,
                assets:portfolioSettings.temp,
                frequency,
                cashflows,
                contribution_amount:contributionAmount,
                withdraw_amount:withdrawAmount,
                withdraw_pct:withdrawPercentage,
                reinvest_dividends:dividends, 
                expense_ratio:expenseRatio
            })
        }).then(res => res.json()).then((portfolios:ReturnedPortfolioData)=> {
               console.log(portfolios);
                setLoading(false)
                setGrowthData({
                    growth:portfolios.growth, 
                    stats:portfolios.stats, 
                    annual:portfolios.annual,
                    starting:portfolioSettings.data.settings.initial_amount
                })
                setPortfolioSettings(prev => ({...prev, data:{...prev.data, assets:prev.temp}}))
            
                
        }) 
    }

    const portfolioData = returnPortfolioAssetsAndAllocations(portfolioSettings.data.assets)
    
    return <section>
        {portfolioData.map((data, index) => data.length >0 && <React.Fragment key={index}>
            <div>
                <div className="font-semibold text-2xl my-4">Portfolio #{index+1}</div>
                <div className="flex">
                    <div className="basis-[60%]">    
                        <table className="w-full" key={crypto.randomUUID()}>
                            <thead className="border-1 border-b-gray-600">
                                <tr className="*:text-left *:last:text-right">
                                    <th>Ticker</th>
                                    <th>Name</th>
                                    <th>Allocation</th>
                                </tr>
                            </thead>
                            <tbody className="[&>*:nth-child(odd)]:bg-[#344365]">
                                {
                                    data.map(asset => 
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
                    <PieChart key={data.map(data => data.ticker).join(',')} labels={data.map(data => data.ticker)} items={data.map(data => data.allocation)}/>
                </div>
                </div>
            </div>
        </React.Fragment>)}
            <div className="mt-2.5">
                <Modal okBtnFN={retrieveGrowthData} formId="portfolio-settings" name="Portfolio Configuration"
                    trigger={<Button name="Edit Portfolio" type="button" extraClass={{base:"py-[5px] px-[10px] border-1 border-white hover:bg-white hover:text-[#1f283d]"}}/>} 
                    okBtnName="Analyze Portfolio">
                    <ConfigurePortfolio  portfolioSettings={portfolioSettings} setPortfolioSettings={setPortfolioSettings}/>
                </Modal>
            </div>
    </section>
} 

const ConfigurePortfolio = ({ setPortfolioSettings, portfolioSettings}:{portfolioSettings:PortfolioState, setPortfolioSettings:React.Dispatch<React.SetStateAction<PortfolioState>>}) => {
    const [page, setPage] = useState({assets:true, settings:false})
    const [assets, setAssets] = useState(10)
    const activeBtnClass = ' border-gray-500  relative border-b-[#2b3755] top-[1px]'
    const inactiveClass = 'border-transparent hover:border-gray-500'
    const assetKeys = Object.keys(portfolioSettings.temp)
    let portfolio1Total= 0, portfolio2Total = 0, portfolio3Total =0
    assetKeys.forEach(key => {
        const allocations = portfolioSettings.temp[Number(key)]?.allocations || [0,0,0]
        portfolio1Total += allocations[0]
        portfolio2Total += allocations[1]
        portfolio3Total += allocations[2]
    })

    const heightClass = portfolioSettings.data.settings.timePeriod == 'Month-to-Month' || portfolioSettings.data.settings.cashflows != 'None' ? 'h-[696px]' : 'h-[519px]'

    const onSelectChange = (e:React.ChangeEvent<HTMLSelectElement>, field:'rebalancing'|'ytd'|'timePeriod'|'endMonth'|'startMonth'|'cashflows'|'frequency'|'fractional'|'dividends') => {
        const booleanString = {Yes:true, No:false}
        const value = e.target.value
        setPortfolioSettings(prev => ({
            ...prev, 
            data:{
                ...prev.data, 
                settings:{
                    ...prev.data.settings,
                    [field]:value in booleanString? 
                        booleanString[value as keyof typeof booleanString]  
                        : value
                }
            }
        }))
    }

    const updatePortfolioField = (e:React.FormEvent<HTMLInputElement>, field:keyof PortfolioSettings['settings'])=> {
        
        if(!isNaN(Number(e.currentTarget.value)))
            setPortfolioSettings(prev => ({...prev, data:{...prev.data, settings:{...prev.data.settings, [field]:e.currentTarget.value}}}))
    }

    const updateStockSelected = (row:number, stockData:QueryResult) => {
        const {description, symbol} = stockData
        setPortfolioSettings(prev => ({
            ...prev,
            temp:{
                ...prev.temp,
                 [row]:{
                    ...prev.temp[row],
                    ticker:symbol,
                    name:description
                }
            }
        }))
    }

    const updateAllocation = (row:number, column:number,allocation:React.FormEvent<HTMLInputElement> ) => {
        const allocationInput = allocation.currentTarget.value
        if(isNaN(Number(allocationInput)))
            return
        setPortfolioSettings(prev => ({
            ...prev,
            temp:{
                ...prev.temp,
                [row]:{
                    ...prev.temp[row], 
                    allocations: (prev.temp?.[row]?.['allocations'] ?? [0,0,0]).toSpliced(column, 1, Number(allocationInput)) as [number, number, number]
                }
            } 
        }))
    }
    
    return (
        <>
            <div className="border-b-1 border-gray-500 mb-3.75">
                <button onClick={()=>setPage({assets:false, settings:true})} className={`cursor-pointer rounded-tl-lg rounded-tr-lg relative px-2.5 py-1.5 border-1 top-[1px]  ${page.settings ? activeBtnClass :inactiveClass}`}>Settings</button>
                <button onClick={()=>setPage({assets:true, settings:false})} className={`cursor-pointer border-1 border-[#2b3755]  rounded-tr-lg top-[1px] rounded-tl-lg  relative px-2.5 py-1.5 ml-[0.5px] ${page.assets ? activeBtnClass : inactiveClass}`}>Portfolio Assets</button>
            </div>
            {page.assets ? 
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr]  auto-rows-auto gap-3.75 mb-5 ">
                    <div className="col-2 row-1">Portfolio #1</div>
                    <div className="col-3 row-1">Portfolio #2</div>
                    <div className="col-4 row-1">Portfolio #3</div>
                    <form className="contents" id="portfolio-settings">
                        {Array(assets).fill(null).map((_, row) => 
                        <React.Fragment key={row}>
                            <div className={`col-1 flex justify-evenly`} style={{gridRow:row+2}}>
                                <span className="flex gap-1.5 items-center w-[100px]">{`Asset ${row+1}`} {row == assets -1 && <PlusCircleIcon className="cursor-pointer" onClick={()=>setAssets(prev => prev+5)}/>}</span>
                                <SearchInput placeholder="Ticker symbol"  getSelection={(stockData:QueryResult)=>updateStockSelected(row, stockData)} value={portfolioSettings.temp?.[row]?.ticker}  />
                            </div>
                            <div className="col-2"><Input onKeydown={e => updateAllocation(row,0,e)} value={portfolioSettings.temp?.[row]?.allocations?.[0] == 0 ? '' : portfolioSettings.temp?.[row]?.allocations?.[0]} />&nbsp;&nbsp;%</div>
                            <div className="col-3"><Input onKeydown={e => updateAllocation(row,1,e)} value={portfolioSettings.temp?.[row]?.allocations?.[1] == 0 ? '' : portfolioSettings.temp?.[row]?.allocations?.[1]} />&nbsp;&nbsp;%</div>
                            <div className="col-4"><Input onKeydown={e => updateAllocation(row,2,e)}  value={portfolioSettings.temp?.[row]?.allocations?.[2] == 0 ? '' : portfolioSettings.temp?.[row]?.allocations?.[2]} />&nbsp;&nbsp;%</div>

                        </React.Fragment>
                    )}
                    </form>
                    
                    <span className="col-1 font-bold">Total</span> 
                    <AssetAmount amount={portfolio1Total} classes="col-2"/>
                    <AssetAmount amount={portfolio2Total} classes="col-3"/>
                    <AssetAmount amount={portfolio3Total} classes="col-4"/>

                </div>
            :
                <form className={`w-[1159px] max-w-[100vw] ${heightClass} mb-5`} id="portfolio-settings" >
                    <LabelAndItem label="Time Period" item={
                        <select name="time period" onChange={(e)=>onSelectChange(e, 'timePeriod')} defaultValue={portfolioSettings.data.settings.timePeriod}>
                            <option className="bg-[#2b3755]" value={'Month-to-Month'}>Month-to-Month</option>
                            <option className="bg-[#2b3755]" value={'Year-to-Year'}>Year-to-Year</option>
                        </select>
                    }/>
                    <LabelAndItem label="Start Year" item={<Input value={portfolioSettings.data.settings.startYear} onKeydown={(e)=>updatePortfolioField(e, 'startYear')}/>}/>
                    {portfolioSettings.data.settings.timePeriod == 'Month-to-Month' && 
                        <LabelAndItem label="First Month" item={<select onChange={e => onSelectChange(e,'startMonth' )} defaultValue={portfolioSettings.data.settings.startMonth}>
                            {months.map(month => <option key={month} className="bg-[#2b3755]" value={month}>{month}</option>)}
                        </select>}/>
                    }
                    <LabelAndItem label="End Year" item={<Input onKeydown={(e)=>updatePortfolioField(e, 'endYear')} value={portfolioSettings.data.settings.endYear}/>}/>
                    {portfolioSettings.data.settings.timePeriod == 'Month-to-Month' && 
                        <LabelAndItem label="Last Month" item={<select onChange={e => onSelectChange(e,'endMonth' )} defaultValue={portfolioSettings.data.settings.endMonth}>
                            {months.map(month => <option key={month} className="bg-[#2b3755]" value={month}>{month}</option>)}
                        </select>}/>
                    }
                    <LabelAndItem label="Initial Amount" item={<Input value={portfolioSettings.data.settings.initial_amount} onKeydown={(e)=>updatePortfolioField(e, 'initial_amount')}/>}/>
                    <LabelAndItem label="Cashflows" item={
                        <select onChange={e => onSelectChange(e, 'cashflows')} defaultValue={portfolioSettings.data.settings.cashflows}>
                            <option className="bg-[#2b3755]" value={'None'}>None</option>
                            <option className="bg-[#2b3755]" value={'Contribute fixed amount'}>Contribute fixed amount</option>
                            <option className="bg-[#2b3755]" value={'Withdraw fixed amount'}>Withdraw fixed amount</option>
                            <option className="bg-[#2b3755]" value={'Withdraw fixed percentage'}>Withdraw fixed percentage</option>
                        </select>
                    }/>
                    {
                        portfolioSettings.data.settings.cashflows == 'Contribute fixed amount' && 
                        <LabelAndItem label="Contribution Amount" item={<Input value={portfolioSettings.data.settings.contributionAmount} onKeydown={e => updatePortfolioField(e, 'contributionAmount')}/>}/>
                    }
                    {
                        portfolioSettings.data.settings.cashflows == 'Withdraw fixed amount' && 
                        <LabelAndItem label="Withdrawal Amount" item={<Input value={portfolioSettings.data.settings.withdrawAmount} onKeydown={e => updatePortfolioField(e, 'withdrawAmount')}/>}/>
                    }
                    {
                        portfolioSettings.data.settings.cashflows == 'Withdraw fixed percentage' &&
                        <LabelAndItem label="Withdraw Fixed Percentage" item={<Input value={portfolioSettings.data.settings.withdrawPercentage} onKeydown={e => updatePortfolioField(e, 'withdrawPercentage')}/>}/>
                    }
                    {
                        (portfolioSettings.data.settings.cashflows == 'Withdraw fixed percentage' || portfolioSettings.data.settings.cashflows == 'Withdraw fixed amount' || portfolioSettings.data.settings.cashflows == 'Contribute fixed amount') &&
                        <LabelAndItem label={portfolioSettings.data.settings.cashflows == 'Contribute fixed amount' ? "Contribution Frequency" : 'Withdrawl Frequency'} 
                            item={<select defaultValue={portfolioSettings.data.settings.frequency} onChange={e => onSelectChange(e, 'frequency')}>
                                <option className="bg-[#2b3755]" value={'Annually'}>Annually</option>
                                <option className="bg-[#2b3755]" value={'Quarterly'}>Quarterly</option>
                                <option className="bg-[#2b3755]" value={'Monthly'}>Monthly</option>
                            </select>}/>
                    }
                    <LabelAndItem label="Rebalancing" item={
                        <select onChange={(e)=>onSelectChange(e, 'rebalancing')} defaultValue={portfolioSettings.data.settings.rebalancing}>
                            <option className="bg-[#2b3755]" value={'No rebalancing'}>No rebalancing</option>
                            <option className="bg-[#2b3755]" value={'Rebalance annually'}>Rebalance annually</option>
                            <option className="bg-[#2b3755]" value={'Rebalance semi-annually'}>Rebalance semi-annually</option>
                            <option className="bg-[#2b3755]" value={'Rebalance quarterly'}>Rebalance quarterly</option>
                            <option className="bg-[#2b3755]" value={'Rebalance monthly'}>Rebalance monthly</option>
                        </select>
                    }/>
                    <LabelAndItem label="Leverage Amount" item={<Input value={portfolioSettings.data.settings.leverage} onKeydown={(e)=>updatePortfolioField(e, 'leverage')}/>}/>
                    <LabelAndItem label="Reinvest Dividends" item={
                        <select name="dividends" onChange={e => onSelectChange(e, 'dividends')} defaultValue={portfolioSettings.data.settings.dividends ? 'Yes':'No'}>
                            <option className="bg-[#2b3755]" >Yes</option>
                            <option className="bg-[#2b3755]">No</option>
                        </select> 
                    }/>
                    
                    <LabelAndItem label="Expense Ratio" item={
                        <div className="flex gap-x-1.25">
                            <Input value={portfolioSettings.data.settings.expenseRatio} onKeydown={e => updatePortfolioField(e, 'expenseRatio')}/>
                            <span className="self-center">%</span>
                        </div>}/>
                
                </form>}
        </>

    )
}

const AssetAmount = ({amount, classes}:{amount:number, classes:string}) => {
    const outlineClass = (amount == 100 ? 'outline-emerald-400' : (amount > 100 || amount < 100 && amount > 0) &&'outline-rose-400')
    return <div className={`${classes} flex`}>
        <div className={`outline-3 rounded-sm h-[30px] px-2.5 flex-1 ${outlineClass}`}>{amount}</div>
        &nbsp;
        %
    </div>
}

const LabelAndItem = ({label, item}:{label:string, item:JSX.Element}) => {
    return <div className="flex gap-[30%] mb-5">
        <label className="w-[200px]">{label}</label>
        {item}
    </div>
}

const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
]

const findLastDay = (year:string, month:number) => {
    console.log('month day', month, year)
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