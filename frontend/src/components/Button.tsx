

const Button = ({name, onclick, extraClass, disabled=false, type='button', formId}:{formId?:string, type:"submit" | "reset" | "button", disabled?:boolean, name:string, onclick?:()=>void, extraClass?:{base:string, disabled?:string}}) => {
    return <button type={type} form={formId} disabled={disabled} onClick={()=>onclick?.()} 
        className={`py-1 min-w-[100px] rounded-md cursor-pointer ${extraClass?.base} ${disabled && extraClass?.disabled}`}>
        {name}
    </button>
} 

 export default Button