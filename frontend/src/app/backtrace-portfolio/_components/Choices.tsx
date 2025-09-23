
const Choices = ({onChangeFN, defaultValue, options}:Props) => {
    return <select  onChange={onChangeFN} defaultValue={defaultValue}>
                {options.map(option => 
                    <option key={option} value={option} className="bg-[#2b3755]">{option}</option>)
                }
            </select> 
}

interface Props{
    onChangeFN:(selection:React.ChangeEvent<HTMLSelectElement>)=>void, 
    defaultValue:string, 
    options:string[]
}

export default Choices