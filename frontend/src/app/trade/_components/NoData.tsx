import { FileIcon } from "@phosphor-icons/react/dist/ssr"

const NoData = () =>{
    return <div className="flex items-center justify-center mt-[15px]">        
            <FileIcon size={60} color="#d1d5dc" weight="fill"/>
            <span className="text-[27px] text-gray-300">No Data</span>    
    </div>
} 

 export default NoData