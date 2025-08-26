import ReactApexChart from 'react-apexcharts'
import {ApexOptions} from 'apexcharts'
import { CandleStickChartData } from '@/types'

const CandleStickChart = ({data}:{data:CandleStickChartData[]}) =>{
    const series = [{name:'data',data:data}]
    const options:ApexOptions =  {
              chart: {
                type: "candlestick",
                foreColor:'#FFF',
                toolbar:{
                    show:false,
                    
                },
              },
              tooltip:{
                style:{
                        fontSize: '14px',
                        fontFamily: undefined,
                    },
                theme:'dark',    
              },
              
              xaxis: {
                type: 'datetime'
              },
              yaxis: {
                tooltip: {
                  enabled: true
                }
              },
            }
    
    return <ReactApexChart options={options} series={series} type='candlestick' height={'100%'} width={'100%'}/>
} 

 export default CandleStickChart