'use client'

const Input = ({autofocus=false, type='text', name, addedClass, onKeydown, value}:
    {value?:string|number, name?:string, onKeydown:(e: React.FormEvent<HTMLInputElement>)=>void, autofocus?:boolean, type?:'email'|'password'|'search'|'text', addedClass?:string}) =>{
    return <input autoFocus={autofocus} value={value} name={name} onInput={(e)=>onKeydown(e)} type={type} 
        className={`outline-2 outline-[#3faacc] rounded-sm h-[30px] px-2.5 ${addedClass}`}/>
} 

 export default Input