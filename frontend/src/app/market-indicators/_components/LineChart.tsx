'use client'
import { ApexOptions } from "apexcharts"
import ReactApexChart from "react-apexcharts"
import Label from "./Label"

const LineChart = ({xaxis, title='', series, rowClass}:{rowClass?:string,series:{name:string, data:number[]}[], xaxis:string[], title?:string}) =>{
    
            const options:ApexOptions= {
                chart: {
                height: 350,
                type: 'line',
                zoom: {
                  enabled: true
                },
                foreColor:'#FFF',
                toolbar:{
                    show:false
                }
              },
              tooltip:{
                theme:'dark'
              },
              dataLabels: {
                enabled: false
              },
              stroke: {
                curve: 'straight'
              },
              xaxis: {
                    categories: xaxis,
                    tickAmount:25
                }
            }
            

    
        return <div className={`${rowClass}`}>
          <Label label={title}/>
          <ReactApexChart options={options} series={series} type='line' height={200} width={'100%'}/>
        </div>
} 

 export default LineChart