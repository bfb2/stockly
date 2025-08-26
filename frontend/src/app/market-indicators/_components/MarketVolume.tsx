'use client'
import ReactApexChart from 'react-apexcharts'
import {ApexOptions} from 'apexcharts'

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
                  title: {
                    text: 'S&P Volume',
                    align: 'left',
                    offsetX: 110
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

    return <ReactApexChart options={options} series={series} type='bar' height={350} width={'100%'}/>
      
} 

 export default MarketVolume