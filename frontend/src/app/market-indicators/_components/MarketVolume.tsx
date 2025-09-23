'use client'
import ReactApexChart from 'react-apexcharts'
import {ApexOptions} from 'apexcharts'
import Label from './Label'

const MarketVolume = ({volume, dates}:{volume:number[], dates:string[]}) =>{
    const options:ApexOptions = {
                  chart:{
                    id:'volume',
                    type:'bar',
                    height:350,
                    zoom:{
                        enabled:true
                    },
                    
                    toolbar:{
                        show:false
                    },
                    foreColor:'#FFF',
                    stacked:false
                 },
                  dataLabels: {
                    enabled: false
                  },
                 
                  xaxis: {
                    categories: dates,
                    tickAmount:25
                  },
                  
                  tooltip: {
                    shared:true,
                    intersect:false,
                    fixed: {
                      enabled: true,
                      position: 'topLeft', // topRight, topLeft, bottomRight, bottomLeft
                      offsetY: 30,
                      offsetX: 60,
                    },
                    theme:'dark',
                    
                  },
                  legend: {
                    horizontalAlign: 'left',
                    offsetX: 40
                  }
                }
              
               const series=  [{
                  name:'Volume',
                  data: volume
                }]

    return <div className='row-[10-12] xl:row-[4/6] xl:col-2'>
      <Label label='S&P Volume'/>
      <ReactApexChart options={options} series={series} type='bar' height={200} width={'100%'}/>
    </div>
    
      
} 

 export default MarketVolume