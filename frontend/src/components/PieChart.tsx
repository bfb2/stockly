'use client'
import ReactApexChart from 'react-apexcharts'
import {ApexOptions} from 'apexcharts'

const PieChart = ({labels, items}:{labels:string[], items:number[]}) =>{
    const options:ApexOptions = {
    chart:{
        type:'donut',
        height:350,
        zoom:{
            enabled:false
        },
        foreColor:'#FFF'
    },
    tooltip:{
        theme:'dark',
        y:{
            formatter:value => value+'%'
        }
    },
    dataLabels:{
        enabled:false
    },
    stroke:{
        show:false
    },
    labels,
    grid:{
        row:{
            colors: ['#415480', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
        }
    },
    xaxis:{
        categories:['January 31', 'Febuary 28', 'March 30', 'April 30', 'May 31']
    }
}

    return <ReactApexChart options={options} series={items} type='donut' height={350}/>
} 



 export default PieChart