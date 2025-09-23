'use client'
import ReactApexChart from 'react-apexcharts'
import {ApexOptions} from 'apexcharts'
import { ChartSeries } from '@/types'
import Label from '@/app/market-indicators/_components/Label'

const LineChart = ({height = 350,series, xaxis, formatter, title='', row, xaxisType, tickAmount=50, yaxisFormatter}:LineChartProps) =>{
    

    const options:ApexOptions = {
    chart:{
        type:'line',
        height:350,
        zoom:{
            enabled:true
        },
        toolbar:{
            show:false
        },
        foreColor:'#FFF'
    },
    tooltip:{
        theme:'dark',
        y:{
            formatter
        },
        shared:true,
        intersect:false,
        x: {
          format: "yyyy-MM-dd"   
        }
    },
    dataLabels:{
        enabled:false
    },
    stroke:{
        curve:'straight'
    },
    grid:{
        row
    },
    xaxis:{
        categories:xaxis,
        type:xaxisType,
        tickAmount,
    labels: {
      datetimeFormatter: {
        year: "yyyy-MM-dd",   
        month: "yyyy-MM-dd",
        day: "yyyy-MM-dd",
        hour: "yyyy-MM-dd HH:mm"
      }
    }
    },
    
    yaxis:{
        labels:{
            formatter:yaxisFormatter
        }
    }
}
    return <div>
        <Label label={title}/>
        <ReactApexChart options={options} series={series} type='line' height={height} />

    </div>
} 

interface LineChartProps{
    row?:{colors:string[], opacity:number};
    title?:string;
    formatter?:(val: number, opts?: unknown)=> string;
    series:ChartSeries[];
    xaxis?:string[]|number[];
    xaxisType?:"category" | "datetime" | "numeric";
    tickAmount?:number;
    yaxisFormatter?:(val: number, opts?: unknown)=> string | string[];
    height?:string|number
}

 export default LineChart