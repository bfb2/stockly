
const AISummary = ({rowClass, summary}:{summary:string, rowClass:string}) =>{
    return <div className={`pl-[15px] w-[50%] leading-[30px] bg-[#1f2c51] row-[2/6] col-1 relative left-[15px] mb-[15px] ${rowClass}`}>
                <div className="font-bold flex relative justify-center right-[15px]">AI-Generated Summary</div>
                <p className="h-[448px] scrollbar overflow-y-auto">{summary.replace(/\\n/g, "\n")}</p>
            </div>  
} 

 export default AISummary