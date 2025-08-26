import Profit from "@/components/Profit"

const AccountValue = ({balance, marketValue, profitPercentData}:{profitPercentData:number, marketValue:number, balance:number}) =>{
    const percentGain = profitPercentData/marketValue *100
 
    return <div className="p-2.5 col-[9/-1] row-[9/-1] border-1 border-gray-400">
        <div className="leading-[1.2] mb-[20px]">
            <div className="text-gray-300 font-medium">Net Account Value</div>
            <div className="text-[2rem]">${formatNumber(marketValue+balance)}</div>
        </div>
        <div className="flex gap-x-2.5">
        
            <AccountItem label="Market Value" value={'$'+formatNumber(marketValue)}/>
            <AccountItem label="Buying Power" value={'$'+formatNumber(balance)}/>
            <AccountItem label="Days P/L" value={
                <div className='flex gap-x-1'>
                    <Profit profit={profitPercentData} beforeSymbol="$"/>
                    <span className='text-[12px]'>
                        (<Profit profit={percentGain} afterSymbol="%"/>)
                    </span>
                    
                </div>
            }/>
            
        </div>
    </div>
} 

const AccountItem = ({label, value}:{label:string, value:string|number|React.JSX.Element}) => {
    return <div>
                <div className="text-gray-300 font-medium text-nowrap">{label}</div>
                {
                    typeof(value) == 'string' || typeof(value) == 'number'?
                    <div className="font-semibold">{value}</div>
                    :
                    value
                }
    </div>
}

const formatNumber = (number:number) => number.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})


 export default AccountValue