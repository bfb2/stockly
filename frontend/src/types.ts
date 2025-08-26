type Stats = {
    cagr:string|number; 
    end:string|number;
    max:string|number;
    peak_date:string;
    bottom_date:string
}

export type FredData = {data:number[], dates:string[]}
export interface MarketInfo {
    macd:{
            macd:number[],
            histogram:number[], 
            signal:number[]
        }, 
    movingAverage:{
        fiftyDay:number[], 
        twoHundredDay:number[],
        parabolic:number[],
        dates:string[]
    }, 
    closePrices:number[], 
    dates:string[],
    volume:number[],
    vix:number[],
    rsi:number[],
    T10Y2Y:FredData, 
    BAMLH0A0HYM2:FredData, 
    BAMLC0A0CM:FredData,
    SAHMREALTIME:FredData, 
    T10Y3M:FredData, 
    IC4WSA:FredData, 
    CCSA:FredData,
    CPIAUCSL:FredData, 
    CPILFESL:FredData,
    PCEPI:FredData,
    PCEPILFE:FredData, 
    lei:{data:number[],months:string[]}, 
    manufacturingpmi:number[], 
    servicespmi:{data:number[],months:string[]}
} 

type AnnualGrowth = Record<string, number>
type PortfolioGrowth = Record<string ,Record<string, number>&{total:number}>
export interface ReturnedPortfolioData{
    growth:[PortfolioGrowth, PortfolioGrowth, PortfolioGrowth], 
    annual:{
        years:string[]; 
        data:[AnnualGrowth, AnnualGrowth, AnnualGrowth]
    };
    stats:[Stats, Stats, Stats];
    starting:number
}

export type ChartSeries = {name:string, data:{x:string|number, y:number}[]|number[]}

export interface QuoteAlpacaResponse{
  "T": string;
  "S": string;
  "bx": string;
  "bp": number;
  "bs": number;
  "ax": string;
  "ap": number;
  "as": number;
  "t": string;
  "c": [string];
  "z": string
}

export interface ReturnedBarData{
    
  "T": string;
  "S": string,
  "o": number;
  "h": number;
  "l": number;
  "c": number;
  "v": number;
  "n": number;
  "vw": number;
  "t": string
}

export interface PaperTradeAccInfo{
    balance:number;
    'account_asset_info':Record<string,{returns:number; qty:number; todays_return:number; 'current price':number}>;
    'total_assets':number;
    orders:Orders[]

  }

export interface Orders{
  ticker:string, 
  ordertype:string, 
  side:'Buy'|'Sell', 
  qty:number,
  orderprice:number,
  status:'Completed'|'Pending'|'Cancelled',
  submitted:string
}

export interface Assets{
  ticker:string;
  qty:number
}

export interface ProfitPctReturn{
  assets:Record<string, {pctChange:number; assetNum:number}>,
  totalAssets:number
}

export interface StockInfo{old:string; new:string}

export type HoldingData = Record<string, {ticker:string;price:number; qty:number; profit:number}>

export type ReturnedAlpacaData = (QuoteAlpacaResponse|ReturnedBarData)[]

export interface CandleStickChartData{x:string; y:[number, number,number,number]}

export interface QueryResult{
    description:string;
    symbol:string;
    displaySymbol:string;
    type:string
}