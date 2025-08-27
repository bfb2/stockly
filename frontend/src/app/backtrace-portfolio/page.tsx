import Backtrace from "./_components/Backtrace"

const page = async () =>{
    const year = new Date().getFullYear()
    const fetchRes = await fetch(`https://stockly-fvoz.onrender.com/backtrace-portfolio?start_date=2020-01-01&end_date=${year}-12-31&initial_amount=10000&rebalancing=No+Rebalancing&leverage=1&tickers=SPY&allocations=100,0,0&frequency=Annually&cashflows=None&contribution_amount=0&withdraw_amount=0&withdraw_pct=0&reinvest_dividends=true&expense_ratio=0`, {
            cache:'no-store',
            method:'Get',
            headers:{
                "Content-Type":'application/json',
            },
            })
    const data = await fetchRes.json()
    console.log(data)
    return <Backtrace data={data} />
}
 export default page