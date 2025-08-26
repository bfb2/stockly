

const UnderlineBtn = ({name, active}:{name:string, active:boolean}) =>{
    return <div className="px-1.5 py-1.25">
        <button className={`${active ? 'text-[#3faacc]' : 'hover:text-[#3faacc]'} cursor-pointer font-semibold`}>{name}</button>
        <div className={`h-[4px] w-[20px] justify-self-center rounded-[10px] ${active && 'bg-[#3faacc]'}`}></div>
    </div>
} 

 export default UnderlineBtn