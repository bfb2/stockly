'use client'
import ReactApexChart from 'react-apexcharts'
import {ApexOptions} from 'apexcharts'
import { ChartSeries } from '@/types'

const BarChart = ({series, xaxis, xaxisType, xaxisFormatter, formatter}:BarChartProps) =>{
    
    const options:ApexOptions = {
    chart:{
        type:'bar',
        height:350,
        zoom:{
            enabled:false
        },
        foreColor:'#FFF',
        toolbar:{show:false}
    },
    tooltip:{
        theme:'dark',
        y:{
            formatter
        },
        shared:true,
        intersect:false,
        
    },
    dataLabels:{
        enabled:false
    },
    stroke:{
        curve:'straight'
    },
    grid:{
        row:{
            colors: ['#415480', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
        },
        padding: {
          left: 0,
          right: 0
        },
        xaxis:{
            lines: {
              show: false
            }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
    },
    xaxis:{
        categories:xaxis,
        type:xaxisType,
        labels:{
            formatter:xaxisFormatter
        }
    }
}
    return <ReactApexChart options={options} series={series} type='bar' height={350}/>
} 

interface BarChartProps{
    series:ChartSeries[],
    xaxis?:string[]|number[];
    xaxisType?:"category" | "datetime" | "numeric";
    xaxisFormatter?:(value: string, timestamp?: number, opts?: unknown) =>string | string[];
    formatter?:(val: number, opts?: unknown)=> string
}
 export default BarChart