import yfinance as yf
from datetime import timedelta
import requests
import os
def retrieve_from_yf(start, end, ticker):
        try:
            data = yf.download(ticker, start=start, end=end+ timedelta(days=1), actions=True, auto_adjust=False)
        except Exception as e:
            raise RuntimeError('Failed fetching data try again', str(e))
        return data

def get_todays_stock_price_and_return(ticker):
        finnhub_response = requests.get(f"https://finnhub.io/api/v1/quote?symbol={ticker}&token={os.environ.get('SECRET_FINNHUB_KEY')}")
        fh_data = finnhub_response.json()
        return {"price":fh_data['c'], "return":fh_data['d']}