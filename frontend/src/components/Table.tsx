import NoData from "@/app/trade/_components/NoData"

const Table = ({headers, tableBody, extraClasses}:
    {extraClasses?:{containerClass?:string, tableClass?:string}, headers:string[], tableBody: React.JSX.Element[]}) =>{
    return <div className={`overflow-auto ${extraClasses?.containerClass}`}>
        <table className={`table-fixed w-full border-separate border-spacing-0 ${extraClasses?.tableClass}`}>
        <thead className="text-left sticky top-0 bg-[#1f283d] h-[50px] after:content-[''] after:absolute after:top-0 after:w-full after:h-full after:bg-[#1f283d] after:z-[-1]">
            <tr>
                {headers.map(header =>  <th key={header} className="pl-3.75 border-1 border-gray-400 first:rounded-tl-[10px]">{header}</th>)}
            </tr>
        </thead>
        <tbody className="overflow-y-scroll">
                {tableBody}
                <tr></tr>
        </tbody>
    </table>
        {tableBody.length == 0 && <NoData/>}
    </div>
} 

 export default Table