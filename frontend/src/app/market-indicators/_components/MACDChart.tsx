'use client'
import ReactApexChart from 'react-apexcharts'
import {ApexOptions} from 'apexcharts'
import { MarketInfo } from '@/types'

const MACDChart = ({data, dates=[]}:{dates:string[], data:MarketInfo['macd']}) =>{
    const {histogram, macd, signal} = data
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
                    foreColor:'#FFF',
                    stacked:false
                 },
                  dataLabels: {
                    enabled: false
                  },
                  stroke: {
                    width: [2, 2, 2]
                  },
                  plotOptions:{
                    bar:{
                        colors:{
                            ranges:[
                                {
                                    from:-Infinity,
                                    to:0,
                                    color:'#FF4560'
                                },
                                {
                                    from:0,
                                    to:Infinity,
                                    color:'#00E396'
                                }
                            ]
                        }
                    }
                  },
                  title: {
                    text: 'Advance / Decline Line',
                    align: 'left',
                    offsetX: 110
                  },
                  xaxis: {
                    categories: dates,
                    tickAmount:25
                  },
                  
                  tooltip: {
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
                  name: 'MACD',
                  type: 'line',
                  data: macd
                }, {
                  name: 'Signal',
                  type: 'line',
                  data: signal
                }, {
                  name: 'Histogram',
                  type: 'bar',
                  data: histogram
                }]
    
    return <div className="h-full">
      <ReactApexChart options={options} series={series} type='line' height={350} width={'100%'}/>
      </div>
} 

 export default MACDChart