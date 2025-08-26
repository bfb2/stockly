import { PaperTradeAccInfo } from "@/types"
import Holdings from "./Holdings"
import OrderHistory from "./OrderHistory"
import SwitchViews from "@/components/SwitchViews"

const AssetsAndHistory = ({tickers, orders, profits}:{ tickers:string[], orders:PaperTradeAccInfo['orders'], profits:PaperTradeAccInfo['account_asset_info']}) =>{

    const viewData =[
        {viewName:'Assets', view:<Holdings tickers={tickers} profits={profits}/>},
        {viewName:'Orders', view:<OrderHistory orders={orders}/>}
    ]
    
    return <div className="col-[1/9] row-[7/-1] flex flex-col mt-4">
        <SwitchViews viewData={viewData}/>
    </div>
}


 export default AssetsAndHistory