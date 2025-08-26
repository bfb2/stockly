import yfinance as yf
from fredapi import Fred
from ta.trend import MACD, PSARIndicator
from datetime import datetime, timedelta
import os
import pandas as pd
import numpy as np

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
        df = yf.download(['^GSPC', '^VIX'], period='1y', interval='1d')
        df = df.dropna(subset=[col for col in df.columns if col[0] == 'Close'])
        equity_data = {'s&p_volume':df['Volume']['^GSPC'].fillna(0), 'dates':df.index.strftime('%Y-%m-%d'), 'S&P':df['Close']['^GSPC'].fillna(0), 'VIX':df['Close']['^VIX'].fillna(0)}
        

        df.dropna(inplace=True)
        
        close_series = df["Close"]['^GSPC']
        high = df['High']['^GSPC']
        low = df["Low"]['^GSPC']

        #calc daily changes
        delta = close_series.diff()
        gain = delta.clip(lower =0)
        loss = -delta.clip(upper=0)

        avg_gain = gain.ewm(alpha=1/14, adjust=False).mean()
        avg_loss = loss.ewm(alpha=1/14, adjust=False).mean()

        relative_strength = avg_gain/avg_loss 
        rsi = 100 - (100 / (1+relative_strength))
        rsi.index = rsi.index.strftime('%Y-%m-%d')
        equity_data['rsi'] = rsi.fillna(0).to_dict()
        df["RSI"] = rsi

        # === Moving Averages ===
        ma_50 = close_series.rolling(50).mean().fillna(0)
        ma_50.index=ma_50.index.strftime('%Y-%m-%d')
        equity_data['ma_50'] = ma_50.to_dict()
        df["MA_50"] = close_series.rolling(50).mean()
        ma_200 =  close_series.rolling(200).mean().fillna(0)
        ma_200.index=ma_200.index.strftime('%Y-%m-%d')
        equity_data['ma_200'] = ma_200.to_dict()
        df["MA_200"] = close_series.rolling(200).mean()

        # === MACD ===
        macd = MACD(close=close_series, window_slow=26, window_fast=12, window_sign=9)
        output = macd.macd()
        output.index=output.index.strftime('%Y-%m-%d')
        equity_data['macd'] = output.fillna(0).to_dict()
        df['MACD']  = pd.Series(np.squeeze(macd.macd()), index=df.index)
        df['MACD_Signal'] = pd.Series(np.squeeze(macd.macd_signal()), index=df.index)
        macd_signal = macd.macd_signal()
        macd_signal.index=macd_signal.index.strftime('%Y-%m-%d')
        equity_data['macd_signal'] = macd_signal.fillna(0).to_dict()
        df['MACD_Hist'] = pd.Series(np.squeeze(macd.macd_diff()), index=df.index)
        macd_hist = macd.macd_diff().fillna(0)
        macd_hist.index=macd_hist.index.strftime('%Y-%m-%d')
        equity_data['macd_hist'] = macd_hist.to_dict()

        # === Parabolic SAR ===
        psar = PSARIndicator(high=high, low=low, close=close_series)
        df['Parabolic_SAR'] = psar.psar()
        parabolic = psar.psar()
        parabolic.index=parabolic.index.strftime('%Y-%m-%d')
        equity_data['parabolic_SAR'] = parabolic.to_dict()

        return  equity_data