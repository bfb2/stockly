'use client'
import { useState } from "react"

const SwitchViews = ({viewData}:{viewData:{viewName:string, view:React.JSX.Element}[]}) =>{
    const views:string[] = []
    const viewComponents:React.JSX.Element[] = []
    viewData.forEach(data => {
        views.push(data.viewName)
        viewComponents.push(data.view)
    })
    
    const [currentView, setView] = useState<string>(views[0])
    const activeBtnClass = ' border-gray-500  relative border-b-[#2b3755] top-[1px]'
    const inactiveClass = 'border-transparent hover:border-gray-500'
    /*<button onClick={()=>setPage({assets:false, settings:true})} className={`cursor-pointer rounded-tl-lg rounded-tr-lg relative px-2.5 py-1.5 border-1 top-[1px]  ${page.settings ? activeBtnClass :inactiveClass}`}>Settings</button>
                <button onClick={()=>setPage({assets:true, settings:false})} className={`cursor-pointer border-1 border-[#2b3755]  rounded-tr-lg top-[1px] rounded-tl-lg  relative px-2.5 py-1.5 ml-[0.5px] ${page.assets ? activeBtnClass : inactiveClass}`}>Portfolio Assets</button> */
    return <>
        <div className="border-b-1 border-gray-500 mb-3.75">
            {views.map(view => 
                <button key={view} 
                    onClick={()=>setView(view)}
                    className={`cursor-pointer rounded-tl-lg rounded-tr-lg relative px-2.5 py-1.5 border-1 top-[1px]  ${currentView == view ? activeBtnClass :inactiveClass}`}
                >
                    {view}
                </button>
            )}
        </div>
        {viewComponents[views.indexOf(currentView)]}
    </>
} 

 export default SwitchViews