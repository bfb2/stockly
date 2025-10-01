
const FullscreenLoader = ({displaySpinner}:{displaySpinner:boolean}) =>{
    if(displaySpinner)
        return <div className="h-[100%] w-[100%] absolute bg-[#1e1d1dc2] flex justify-center z-1">
            <div className="loader relative top-[40vh] "></div>
        </div>
} 

 export default FullscreenLoader