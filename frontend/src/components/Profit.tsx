import { formatMoney } from "@/functions/format-money"

const Profit = ({profit, beforeSymbol='', afterSymbol=''}:{profit:number, beforeSymbol?:string, afterSymbol?:string}) => {
    let formattedProfit = formatMoney(profit)
    const classes = formattedProfit == '0' ? 
        'text-gray-400' 
        : 
        (profit > 0 ? "text-emerald-500 before:content-['+']" : "text-rose-500 before:content-['-']")

    if (formattedProfit[0] == '-')
        formattedProfit = formattedProfit.split('-')[1]
    return <span className={`${classes} font-semibold`}>{beforeSymbol + formattedProfit +afterSymbol}</span>
}

export default Profit