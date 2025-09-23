import yfinance as yf
from fredapi import Fred
from ta.trend import MACD, PSARIndicator
from datetime import datetime, timedelta
import os
import pandas as pd
import numpy as np
import google.generativeai as genai
from .util import retrieve_from_yf
class EconomicInfo():
    def retrieve_fred_info(self):
        fred = Fred(api_key=f'{os.environ.get('FRED_KEY')}')
        end_date = datetime.today()
        start_date = end_date - timedelta(days=365)
        
        fred_ids = ['T10Y2Y','BAMLH0A0HYM2','BAMLC0A0CM', 'T10Y3M','SAHMREALTIME','CPIAUCSL', 'CPILFESL','PCEPI','PCEPILFE', 'IC4WSA', 'CCSA'] 
        fred_stats = {}
        for id in fred_ids:
            fred_df = fred.get_series(id, observation_start=start_date, observation_end=end_date).reset_index()
            fred_df.columns = ['date', 'value']
            fred_df['date'] = fred_df['date'].dt.strftime('%Y-%m-%d')
            fred_df['value'] = fred_df['value'].ffill()
            fred_stats[id] = fred_df.to_dict(orient='records')
        return fred_stats

    def get_market_data(self):
        df = yf.download(['^VIX'], period='1y', interval='1d')
        df = df.dropna(subset=[col for col in df.columns if col[0] == 'Close'])
        today = datetime.today().date()
        two_years_ago = today - timedelta(days=730)
        gspc = retrieve_from_yf(two_years_ago, today, '^GSPC')
        years_gspc = gspc[gspc.index >= df.index[0]]
        equity_data = {'s&p_volume':years_gspc['Volume']['^GSPC'], 'dates':df.index.strftime('%Y-%m-%d'), 'S&P':years_gspc['Close']['^GSPC'], 'VIX':df['Close']['^VIX'].fillna(0)}
        

        df.dropna(inplace=True)
        print(gspc, 'gspc')
        close_series = gspc["Close"]['^GSPC']
        high = gspc['High']['^GSPC']
        low = gspc["Low"]['^GSPC']

        #calc daily changes
        delta = close_series.diff()
        gain = delta.clip(lower =0)
        loss = -delta.clip(upper=0)

        avg_gain = gain.ewm(alpha=1/14, adjust=False).mean()
        avg_loss = loss.ewm(alpha=1/14, adjust=False).mean()

        relative_strength = avg_gain/avg_loss 
        rsi = 100 - (100 / (1+relative_strength))
        rsi = rsi[rsi.index >= df.index[0]]
        rsi.index = rsi.index.strftime('%Y-%m-%d')
        equity_data['rsi'] = rsi.fillna(0).to_dict()

        # === Moving Averages ===
        ma_50 = close_series.rolling(50).mean().fillna(0)
        ma_50 = ma_50[ma_50.index >= df.index[0]]
        ma_50.index=ma_50.index.strftime('%Y-%m-%d')
        equity_data['ma_50'] = ma_50.to_dict()

        ma_200 =  close_series.rolling(200).mean().fillna(0)
        ma_200 = ma_200[ma_200.index >= df.index[0]]
        ma_200.index=ma_200.index.strftime('%Y-%m-%d')
        equity_data['ma_200'] = ma_200.to_dict()

        # === MACD ===
        macd = MACD(close=close_series, window_slow=26, window_fast=12, window_sign=9)
        output = macd.macd()
        output = output[output.index >= df.index[0]]
        output.index=output.index.strftime('%Y-%m-%d')
        equity_data['macd'] = output.fillna(0).to_dict()
        macd_signal = macd.macd_signal()
        macd_signal = macd_signal[macd_signal.index >= df.index[0]]
        macd_signal.index=macd_signal.index.strftime('%Y-%m-%d')
        equity_data['macd_signal'] = macd_signal.fillna(0).to_dict()
        macd_hist = macd.macd_diff().fillna(0)
        macd_hist = macd_hist[macd_hist.index >= df.index[0]]
        macd_hist.index=macd_hist.index.strftime('%Y-%m-%d')
        equity_data['macd_hist'] = macd_hist.to_dict()

        # === Parabolic SAR ===
        psar = PSARIndicator(high=high, low=low, close=close_series)
        parabolic = psar.psar()
        parabolic = parabolic[parabolic.index >= df.index[0]]
        parabolic.index=parabolic.index.strftime('%Y-%m-%d')
        equity_data['parabolic_SAR'] = parabolic.to_dict()

        return  equity_data
    
    def interpret_data(self, fred_info, market_data):
        genai.configure(api_key=os.getenv('GEMINI_KEY'))
        model = genai.GenerativeModel('gemini-2.5-pro')
        prompt = f"Analyze the market data and give insights on the current state of the US markets and how its trending based on the data. Here is the market data {market_data}"
        response = model.generate_content(prompt)
        economic_health_prompt = f"Analyze the data and give insights on the current state of the US Economy and how its trending based on the data, here's the data {fred_info}"
        econ_response = model.generate_content(economic_health_prompt)
        #print(response, 'Response')
        return (response['result']['candidates'][0]['content']['parts'][0], econ_response['result']['candidates'][0]['content']['parts'][0])