import Table from "@/components/Table"
import { PaperTradeAccInfo } from "@/types"
import TableDataCell from "@/components/TableDataCell"
import { formatMoney } from "@/functions/format-money"

const OrderHistory = ({orders}:{orders:PaperTradeAccInfo['orders']}) =>{
    
    return <Table headers={tableHeader} tableBody={generateTableBody(orders)}/>
} 

const tableHeader = [
    'Asset',
    'Order Type',
    'Side',
    'Qty',
    'Price',
    'Status',
    'Submitted At',
]

const generateTableBody = (orders:PaperTradeAccInfo['orders']) => {
    return orders.map((data, key) => <tr key={data.ticker+key} className="h-[50px]">
            <TableDataCell value={data.ticker}/>
            <TableDataCell value={data.ordertype}/>
            <TableDataCell value={data.side}/>
            <TableDataCell value={data.qty}/>
            <TableDataCell value={data.orderprice?formatMoney(data.orderprice) : '-'}/>
            <TableDataCell value={data.status}/>
            <TableDataCell value={new Date(data.submitted).toLocaleDateString()}/>
        </tr>)
    
}

 export default OrderHistory