'use client'
import React, { useState, useEffect } from "react"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"
import { QueryResult } from "@/types"

const SearchInput = ({placeholder, value, autofocus=false, getSelection, displaySpinner}:{displaySpinner?:()=>void,getSelection:(selection:QueryResult)=>void , autofocus?:boolean, value?:string, placeholder?:string,}) =>{
    const [query, setQuery] = useState<string>()
    const [queryResults, setQueryResults] = useState<QueryResult[]>([])
    const [hideResults, setHideResults] = useState<boolean>(false)
    const [loading, setLoading] = useState(false)
    const [searchbarValue, setSearchBarValue] = useState(value)
    const [selectedStock, setSelectedStock] = useState<string>()

    useEffect(() => {
        const timeout = setTimeout(()=>{
            if(query != undefined && query.length >0){
                
                setLoading(true)
                const pattern = new RegExp(`\\b${query}\\b`, "i");
                const matches:QueryResult[] = []
                composites.forEach(composite => {
                    if(pattern.test(composite.description)||pattern.test(composite.symbol))
                        matches.push(composite)
                })
                fetch(`/api/symbol_lookup/${query}`).then(res => res.json()).then((data:QueryResult[]) => {setQueryResults([...matches,...data]); setLoading(false)})
            }
            else
                setLoading(false)
                
        }, 300)

        return () => clearTimeout(timeout)
    },[query])

    if(query?.length == 0 && queryResults.length > 0)
        setQueryResults([])

    if(query == undefined && loading == true)
        setLoading(false)
    
    return <div className="relative">
        <div className="flex gap-x-1.25">
            <div className="outline-2 outline-[#3faacc] rounded-sm flex gap-1.25 px-1.5">
                <MagnifyingGlassIcon size={20} className="center-pos"/>
                <input type="search" onFocus={()=>setHideResults(false)} onBlur={()=>setHideResults(true)} value={query ?? searchbarValue} autoFocus={autofocus} placeholder={placeholder} onChange={(e)=>setQuery(e.target.value)} className="outline-none flex-1"/>
            </div>
            <div className={`wheel-loader ${!loading && 'invisible'}`}></div>
        </div>
        <ul className={`overflow-auto max-h-45 absolute z-1 bg-[#1f283d] ${hideResults && 'hidden'} w-[calc(100%-34px)] scrollbar`}>
            {queryResults.map((result, index) => <li onPointerDown={()=>{getSelection(result); setQuery(undefined); setSearchBarValue(result.symbol); setSelectedStock(result.symbol); displaySpinner?.()}} key={result.symbol+index} className={`${selectedStock == result.symbol && 'bg-[#3a4b73]'} flex flex-col px-1.25 py-0.5 cursor-pointer hover:bg-[#3a4b73]`}>
                <span className="font-bold">{result.symbol}</span>
                <span className="text-xs">{result.description}</span>
            </li>)}
        </ul>
    </div>
} 


const composites:QueryResult[] = [
    {description:'Nasdaq Composite', symbol:'^IXIC', displaySymbol:'^IXIC', type:'composite'},
    {description:'S&P 500 Composite', symbol:'^GSPC', displaySymbol:'^GSPC', type:'composite'},
    {description:'Nasdaq 100 Composite', symbol:'^NDX', displaySymbol:'^NDX', type:'composite'},
    {description:'Dow Jones Industrial Composite', symbol:'^DJI', displaySymbol:'^DJI', type:'composite'}
]


 export default SearchInput