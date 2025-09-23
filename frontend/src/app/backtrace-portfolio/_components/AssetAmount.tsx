const AssetAmount = ({amount, classes}:{amount:number, classes:string}) => {
    const outlineClass = (amount == 100 ? 'outline-emerald-400' : (amount > 100 || amount < 100 && amount > 0) &&'outline-rose-400')
    return <div className={`${classes} flex`}>
        <div className={`outline-3 rounded-sm h-[30px] px-2.5 flex-1 ${outlineClass}`}>{amount}</div>
        &nbsp;
        %
    </div>
}

export default AssetAmount