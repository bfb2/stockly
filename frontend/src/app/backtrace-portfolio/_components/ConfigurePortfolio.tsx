'use client'
import Choices from "./Choices"
import LabelAndItem from "./LabelAndItem" 
import React, { useState } from "react"
import SearchInput from "@/components/SearchInput"
import Input from "@/components/Input"
import AssetAmount from "./AssetAmount"
import { PlusCircleIcon } from "@phosphor-icons/react/dist/ssr"
import { QueryResult,PortfolioState, PortfolioSettings } from "@/types"
import { months } from "@/constants"

const ConfigurePortfolio = ({ setPortfolioSettings, portfolioSettings}:{portfolioSettings:PortfolioState, setPortfolioSettings:React.Dispatch<React.SetStateAction<PortfolioState>>}) => {
    const [page, setPage] = useState({assets:true, settings:false})
    const [assets, setAssets] = useState(5)
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

    const onSelectChange = (e:React.ChangeEvent<HTMLSelectElement>, field:'rebalancing'|'ytd'|'timePeriod'|'endMonth'|'startMonth'|'startDay'|'endDay'|'cashflows'|'frequency'|'fractional'|'dividends') => {
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
        const input = e.currentTarget.value
        if(!isNaN(Number(input)))
            setPortfolioSettings(prev => ({...prev, data:{...prev.data, settings:{...prev.data.settings, [field]:input}}}))
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
    
    const {
        timePeriod, startDay, startMonth, startYear, endDay, endMonth, endYear, cashflows:cashflow, contributionAmount, withdrawAmount,
        withdrawPercentage, frequency, initial_amount, rebalancing, leverage, expenseRatio, dividends 
    } = portfolioSettings.data.settings

    return (
        <>
            <div className="border-b-1 border-gray-500 mb-3.75">
                <button onClick={()=>setPage({assets:false, settings:true})} 
                        className={`cursor-pointer rounded-tl-lg rounded-tr-lg relative px-2.5 py-1.5 border-1 top-[1px]  ${page.settings ? activeBtnClass :inactiveClass}`}>
                            Settings
                </button>
                <button onClick={()=>setPage({assets:true, settings:false})} 
                        className={`cursor-pointer border-1 border-[#2b3755]  rounded-tr-lg top-[1px] rounded-tl-lg  relative px-2.5 py-1.5 ml-[0.5px] ${page.assets ? activeBtnClass : inactiveClass}`}>
                    Portfolio Assets
                </button>
            </div>
            {page.assets ? 
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] pb-1.25 h-[300px] overflow-auto scrollbar auto-rows-auto gap-3.75 mb-5 ">
                    <div className="col-2 row-1">Portfolio #1</div>
                    <div className="col-3 row-1">Portfolio #2</div>
                    <div className="col-4 row-1">Portfolio #3</div>
                    <form className="contents" id="portfolio-settings">
                        {Array(assets).fill(null).map((_, row) => 
                        <React.Fragment key={row}>
                            <div className={`col-1 flex justify-evenly`} style={{gridRow:row+2}}>
                                <span className="flex gap-1.5 items-center w-[100px]">
                                    {`Asset ${row+1}`} {row == assets -1 && <PlusCircleIcon className="cursor-pointer" onClick={()=>setAssets(prev => prev+5)}/>}
                                </span>
                                <SearchInput 
                                    placeholder="Ticker symbol"  
                                    getSelection={(stockData:QueryResult)=>updateStockSelected(row, stockData)} 
                                    value={portfolioSettings.temp?.[row]?.ticker}  
                                />
                            </div>
                            <div  className="col-2">
                                <Input 
                                    onInput={e => updateAllocation(row,0,e)} 
                                    value={portfolioSettings.temp?.[row]?.allocations?.[0] == 0 ? '' : portfolioSettings.temp?.[row]?.allocations?.[0]}
                                />&nbsp;&nbsp;%
                            </div>
                            <div className="col-3">
                                <Input onInput={e => updateAllocation(row,1,e)} 
                                       value={portfolioSettings.temp?.[row]?.allocations?.[1] == 0 ? '' : portfolioSettings.temp?.[row]?.allocations?.[1]} 
                                />
                                &nbsp;&nbsp;%
                            </div>
                            <div className="col-4">
                                <Input 
                                    onInput={e => updateAllocation(row,2,e)}  
                                    value={portfolioSettings.temp?.[row]?.allocations?.[2] == 0 ? '' : portfolioSettings.temp?.[row]?.allocations?.[2]} />&nbsp;&nbsp;%
                            </div>

                        </React.Fragment>
                    )}
                    </form>
                    
                    <span className="col-1 font-bold">Total</span> 
                    <AssetAmount amount={portfolio1Total} classes="col-2"/>
                    <AssetAmount amount={portfolio2Total} classes="col-3"/>
                    <AssetAmount amount={portfolio3Total} classes="col-4"/>

                </div>
            :
                <form className={`w-[1159px] max-w-[100vw] h-[300px] overflow-auto scrollbar mb-5`} id="portfolio-settings" >
                    <LabelAndItem 
                        label="Time Period" 
                        item={
                            <Choices defaultValue={timePeriod} 
                                     onChangeFN={selection => onSelectChange(selection, 'timePeriod')} 
                                     options={['Month-to-Month','Year-to-Year']}
                            />
                        }
                    />
                    <LabelAndItem 
                        label="Start Year" 
                        item={<Input value={startYear} onInput={(e)=>updatePortfolioField(e, 'startYear')}/>}
                    />
                    {timePeriod == 'Month-to-Month' && 
                        <LabelAndItem 
                            label="Start Month" 
                            item={
                                <Choices 
                                    onChangeFN={selection => onSelectChange(selection, 'startMonth')} 
                                    options={months} 
                                    defaultValue={startMonth}
                                /> 
                            }
                        />
                    }
                    {
                        timePeriod == 'Month-to-Month' &&
                        <LabelAndItem
                            label="Start Day"
                            item={
                                <Choices
                                    onChangeFN={selection => onSelectChange(selection, 'startDay')}
                                    options={generateArrfromNum(getNumOfDays(Number(startYear), months.indexOf(startMonth)+1))}
                                    defaultValue={startDay}
                                />
                            }
                        />
                    }
                    <LabelAndItem 
                        label="End Year" 
                        item={<Input onInput={(e)=>updatePortfolioField(e, 'endYear')} value={endYear}/>}
                    />
                    {timePeriod == 'Month-to-Month' && 
                        <LabelAndItem 
                            label="End Month" 
                            item={
                                <Choices 
                                    onChangeFN={selection => onSelectChange(selection, 'endMonth')} 
                                    options={months} 
                                    defaultValue={endMonth}
                                /> 
                            }
                        />
                    }
                    {
                        timePeriod == 'Month-to-Month' &&
                        <LabelAndItem
                            label="End Day"
                            item={
                                <Choices
                                    onChangeFN={selection => onSelectChange(selection, 'endDay')}
                                    options={generateArrfromNum(getNumOfDays(Number(endYear), months.indexOf(endMonth)+1))}
                                    defaultValue={endDay}
                                />
                            }
                        />
                    }
                    <LabelAndItem 
                        label="Initial Amount" 
                        item={<Input value={initial_amount} onInput={(e)=>updatePortfolioField(e, 'initial_amount')}/>}/>
                    <LabelAndItem 
                        label="Cashflows" 
                        item={
                            <Choices 
                                options={cashflows} 
                                defaultValue={cashflow} 
                                onChangeFN={selection=>onSelectChange(selection, 'cashflows')}
                            />
                         }
                    />
                    {
                        cashflow == 'Contribute fixed amount' && 
                        <LabelAndItem 
                            label="Contribution Amount" 
                            item={<Input value={contributionAmount} onInput={e => updatePortfolioField(e, 'contributionAmount')}/>}
                        />
                    }
                    {
                        cashflow == 'Withdraw fixed amount' && 
                        <LabelAndItem 
                            label="Withdrawal Amount" 
                            item={<Input value={withdrawAmount} onInput={e => updatePortfolioField(e, 'withdrawAmount')}/>}
                        />
                    }
                    {
                        cashflow == 'Withdraw fixed percentage' &&
                        <LabelAndItem 
                            label="Withdraw Fixed Percentage" 
                            item={<Input value={withdrawPercentage} onInput={e => updatePortfolioField(e, 'withdrawPercentage')}/>}
                        />
                    }
                    {
                        (cashflow == 'Withdraw fixed percentage' || cashflow == 'Withdraw fixed amount' || cashflow == 'Contribute fixed amount') &&
                        <LabelAndItem 
                            label={cashflow == 'Contribute fixed amount' ? "Contribution Frequency" : 'Withdrawl Frequency'} 
                            item={
                                <Choices 
                                    options={frequencyOptions} 
                                    onChangeFN={selection => onSelectChange(selection, 'frequency')} 
                                    defaultValue={frequency}
                                />
                            }
                        />
                    }
                    <LabelAndItem 
                        label="Rebalancing" 
                        item={ 
                            <Choices onChangeFN={selection => onSelectChange(selection, 'rebalancing')} 
                                     defaultValue={rebalancing} 
                                     options={rebalanceOptions}/>}
                    />
                    <LabelAndItem label="Leverage Amount" item={<Input value={leverage} onInput={(e)=>updatePortfolioField(e, 'leverage')}/>}/>
                    <LabelAndItem 
                        label="Reinvest Dividends" 
                        item={ 
                            <Choices 
                                options={['Yes','No']} 
                                onChangeFN={selection => onSelectChange(selection, 'dividends')} 
                                defaultValue={dividends ? 'Yes':'No'}
                            />
                        }
                    />
                    
                    <LabelAndItem 
                        label="Expense Ratio" 
                        item={
                            <div className="flex gap-x-1.25">
                                <Input value={expenseRatio} onInput={e => updatePortfolioField(e, 'expenseRatio')}/>
                                <span className="self-center">%</span>
                            </div>
                        }
                    />
                </form>}
        </>

    )
}

const rebalanceOptions = [
    'No Rebalancing',
    'Rebalance Annually',
    'Rebalance Semi-Annually',
    'Rebalance Quarterly',
    'Rebalance Monthly'
]

const frequencyOptions = [
    'Annually',
    'Quarterly',
    'Monthly'
]

const cashflows = [
    'None',
    'Contribute fixed amount',
    'Withdraw fixed amount',
    'Withdraw fixed percentage'
]

const getNumOfDays = (year:number, month:number) => new Date(year, month, 0).getDate()

const generateArrfromNum = (num:number) => Array.from({length:num},(_, i)=>i < 9 ? `0${i+1}`:`${i+1}`)

 export default ConfigurePortfolio