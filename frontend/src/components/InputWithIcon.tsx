import React from 'react'

export default function InputWithIcon({icon, placeholder, autofocus, onChange, iconPos, extraClass}:{extraClass?:string,iconPos:'left'|'right', onChange:(value:string)=>void, autofocus?:boolean, icon:React.JSX.Element, placeholder?:string}) {
  return (
    <div className={`outline-2 outline-[#3faacc] rounded-sm flex gap-1.25 px-1.5 ${extraClass}`}>
      {iconPos == 'left' && icon}
      <input  autoFocus={autofocus}  placeholder={placeholder} onChange={(e)=>onChange(e.target.value)} className="outline-none flex-1"/>
        {iconPos == 'right' && icon}
    </div>
  )
}
