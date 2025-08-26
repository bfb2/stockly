import { PaperTradeAccInfo } from "@/types"
import { formatMoney } from "@/functions/format-money"
import Profit from "@/components/Profit"
import TableDataCell from "@/components/TableDataCell"
import Table from "@/components/Table"

const Holdings = ({tickers, profits}:{ tickers:string[], profits:PaperTradeAccInfo['account_asset_info']}) =>{
    return <Table headers={tableHeader} tableBody={generateTableBody(tickers, profits)}/>
} 

const tableHeader = [
    'Asset',
    'Price',
    'Qty',
    'Market Value',
    'Total P/L'
]

const generateTableBody = (tickers:string[], profits:PaperTradeAccInfo['account_asset_info']) => 
        tickers.map(ticker => <tr key={ticker+'assets'} className="h-[50px] [&:nth-last-child(2)>td:first-child]:rounded-bl-[10px]">
            <TableDataCell value={ticker}/>
            <TableDataCell value={profits[ticker]['current price']}/>
            <TableDataCell value={profits[ticker].qty}/>
            <TableDataCell value={formatMoney(profits[ticker]['current price']*profits[ticker].qty)}/>
            <TableDataCell value={<Profit profit={profits[ticker].returns} beforeSymbol="$"/>} />
        </tr>)
 export default Holdings