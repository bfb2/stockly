'use client'
import ReactApexChart from 'react-apexcharts'
import {ApexOptions} from 'apexcharts'
import { MarketInfo } from '@/types'

const MovingAverages = ({data, stockPrices, dates}:{dates:string[],data:MarketInfo['movingAverage'], stockPrices:number[]}) =>{
    const {fiftyDay, parabolic, twoHundredDay} = data
    const options:ApexOptions = {
                  chart:{
                    id:'price',
                    group:'price-volume',
                    type:'line',
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
                  stroke: {
                    width: [2, 2, 0,2,2]
                  },
                  markers: {
                      size: [0, 0, 1, 0,0]
                },
                  title: {
                    text: 'MACD',
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
                  name: '50 Day Moving Average',
                  type: 'line',
                  data: fiftyDay
                }, {
                  name: '200 Day Moving Average',
                  type: 'line',
                  data: twoHundredDay
                }, {
                  name: 'Parabolic SAR',
                  type: 'scatter',
                  data: parabolic
                },{
                    name:'S&P 500 Price',
                    type:'line',
                    data:stockPrices
                }]
    
        return <div className="h-full">
          <ReactApexChart options={options} series={series} type='line' height={350} />
          </div>
} 



 export default MovingAverages