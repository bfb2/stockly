

const LabelAndItem = ({label, item}:{label:string, item:React.JSX.Element}) => {
    return <div className="flex gap-[30%] mb-5">
        <label className="w-[200px]">{label}</label>
        {item}
    </div>
}

export default LabelAndItem