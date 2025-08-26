

const Dropdown = ({options, onSelection}:{options:string[], onSelection:(e:React.ChangeEvent<HTMLSelectElement>)=>void}) => {
    return <select onChange={(e)=>onSelection(e)}>
        {options.map(option => <option value={option} className="bg-[#1f283d]" key={option}>{option}</option>)}
    </select>
}

export default Dropdown