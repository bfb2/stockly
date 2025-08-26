'use client'
import { JSX } from "react"
import { useState } from "react"
import Button from "@/components/Button"

const Modal = ({children, name, trigger, okBtnName = 'OK', formId, okBtnFN}:Props) =>{
    const [modalActive, setModalActive] = useState(false)
    return <>
        {modalActive && 
            <dialog className="fixed center-pos rounded-lg z-1000 min-w-[400px] min-h-[200px] bg-[#2b3755] flex flex-col text-white" onBlur={(e)=>console.log(e)}>
                <div className="text-center bg-[#3c4e76] rounded-t-lg rounded-tr-lg py-1.25 flex">
                    <span className="center-pos flex-1" >{name}</span>
                    <div onClick={()=>setModalActive(false)} className="bg-orange-600 hover:bg-orange-700 self-center mr-2.5 rounded-full cursor-pointer h-3.75 w-3.75 justify-self-end"></div>
                </div>
                
                <div className="flex flex-col justify-between flex-1 p-5">
                    {children}
                    <div className="flex self-end gap-2.5">
                        <Button name="Cancel" onclick={() => setModalActive(false)} extraClass={{base:"border-1 border-gray-300"}} type="button"/>
                        <Button formId={formId} type="submit" name={okBtnName} onclick={()=>{okBtnFN(); setModalActive(false)}}  extraClass={{base:'bg-[#019dfb] text-white', disabled:'bg-[#006399] text-gray-300'}}/>
                        
                     </div>
                </div>
            </dialog>}

            <div onClick={() => setModalActive(true)} className="contents">
                {trigger}
            </div>
    </>  
} 




interface Props{
    children:JSX.Element; 
    name:string; 
    trigger:JSX.Element;
    okBtnName?:string;
    formId:string;
    okBtnFN:()=>void
}

 export default Modal