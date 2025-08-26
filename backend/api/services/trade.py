from ..models import Papertradeaccount, Papertradeorder, Assets
from datetime import datetime, timezone, timedelta, time
import pandas as pd
from decimal import Decimal, ROUND_HALF_UP
from .util import retrieve_from_yf, get_todays_stock_price_and_return
from zoneinfo import ZoneInfo

class TradeAccount():
    def __init__(self, user):
        self.total_assets = 0
        self.account_asset_info = {}
        self.account = Papertradeaccount.objects.filter(userid=user).first()
        self.balance = Decimal(self.account.balance)
        self.today = datetime.now(timezone.utc).date() 

    def check_unfinished_orders(self):
        tickers = Papertradeorder.objects.filter(papertradeaccountid=self.account.id, status='Pending').values_list('ticker', flat=True).distinct()
        
        for ticker in tickers:
            orders = Papertradeorder.objects.filter(papertradeaccountid=self.account.id, status='Pending', ticker=ticker).order_by('datelastchecked')
            oldest_order = orders[0].datelastchecked
            stock_data = retrieve_from_yf(oldest_order,self.today, ticker)
            for date, row in stock_data.iterrows():
                for order in orders:
                    if order.datelastchecked.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc):
                        stock_price = row['Close'][order.ticker]
                        match order.ordertype:
                            case "Limit" | 'Stop':
                                limit_price = order.limitprice if order.ordertype == 'Limit' else order.stopprice
                                if (order.side == 'Buy' and limit_price >= stock_price) or (order.side == 'Sell' and limit_price <= stock_price):
                                    self.process_orders(order,  stock_price)
                            case "Stop Limit":
                                if (order.side == 'Buy' and order.stopprice >= stock_price) or (order.side == 'Sell' and order.stopprice <= stock_price):
                                    if order.limitprice > stock_price:
                                        self.process_orders(order,  stock_price)
                                    else:
                                        order.ordertype ='Limit'
                                        order.stopprice = None
                                        order.save(update_fields=['ordertype','stopprice'])
                            case "Trailing Stop":
                                trail_rate = order.trailrate
                                trail_price = order.trailprice
                                trail_dollars = order.traildollars
                                if order.side == 'Sell':
                                    trail = stock_price - trail_dollars if trail_dollars else stock_price*(trail_rate/100)
                                else:
                                    trail = stock_price + trail_dollars if trail_dollars else stock_price * (1+ trail_rate/100)
                                if (order.side == 'Buy' and trail >= stock_price) or (order.side =='Sell' and trail <= stock_price):
                                    self.process_orders(order, stock_price)
                                elif stock_price > trail_price:
                                    order.trailprice = stock_price
                                    order.save(update_fields=['trailprice'])
                        order.datelastchecked = date
                        order.save(update_fields=['datelastchecked'])
    
        
    def process_asset_data(self):
        assets = Assets.objects.filter(papertradeaccountid=self.account.id)
        
        for asset in assets:
            orders = Papertradeorder.objects.filter(assetid=asset, papertradeaccountid=self.account.id).exclude(status='Pending', side="Sell").order_by("submitted")
            data = retrieve_from_yf(orders[0].datelastchecked, self.today, asset.ticker)
            
            if isinstance(data.columns, pd.MultiIndex):
                data.columns = [col[0] for col in data.columns] 

            splits = data['Stock Splits']
            data['Split Factor'] = splits.replace(0, 1)
            latest_price = self.convert_to_decimal(Decimal(data['Close'].iloc[-1])) 
            
            for order in orders:
                subset = data.loc[order.datelastchecked:self.today]
                cum_split_factor = subset['Split Factor'].prod()
                adjusted_beginning_price = self.convert_to_decimal(order.orderprice / cum_split_factor)
                print(adjusted_beginning_price, latest_price, adjusted_beginning_price == latest_price, 'adjusted price b')
                self.calculate_order_growth(adjusted_beginning_price,order)

            start_date = asset.lastdividenddate.date()
            if not start_date == self.today:
                dividend_data = data.loc[start_date:self.today]
                self.calculate_dividends(dividend_data,asset)

            print('the assets are', self.account_asset_info)

    
    def calculate_order_growth(self, beginning_price, order):
        price_and_returns = get_todays_stock_price_and_return(order.ticker)
        latest_price = self.convert_to_decimal(price_and_returns['price'])

        growth = latest_price / beginning_price
        starting_amount = beginning_price*order.qty
        returns = (starting_amount * growth) - starting_amount
        #percentage_increase = (growth -1)*100            
        self.total_assets += order.qty
        
        
        todays_returns = latest_price - beginning_price if self.is_before_next_open_stock_day(order.datelastchecked,datetime.now(timezone.utc)) else price_and_returns['return']

        if order.ticker in self.account_asset_info:
            self.account_asset_info[order.ticker]['returns'] += returns
            self.account_asset_info[order.ticker]['qty'] += order.qty
            self.account_asset_info[order.ticker]['todays_return'] += todays_returns*order.qty
        else:
            self.account_asset_info[order.ticker] = {
                "returns":returns, 
                "qty":order.qty, 
                'todays_return':todays_returns*order.qty, 
                'current price':latest_price, #price_and_returns['price']
                'test':price_and_returns['price']
            }
    
    def calculate_dividends(self,dividend_data, asset):
            if 'Dividends' not in dividend_data.columns:
                return
            dividends = dividend_data[dividend_data["Dividends"] > 0]
            dividend_sum = dividends["Dividends"].sum()
            if dividend_sum > 0:
                self.account.balance += dividend_sum
                self.balance += Decimal(dividend_sum)
                self.account.save(update_fields=['balance'])
                
            asset.lastdividenddate=self.today
            asset.save(update_fields=['lastdividenddate'])

    

    def retrieve_every_order(self):
        return Papertradeorder.objects.filter(papertradeaccountid=self.account.id).order_by('submitted').only('ticker', 'ordertype', 'side', 'qty','orderprice', 'status','submitted')
    
    def process_orders(self, order, price):
        order_cost = price * order.qty
        asset = Assets.objects.filter(papertradeaccountid=self.account.id, ticker=order.ticker).first()
        if asset:
            if order.side == 'Buy':
                if order_cost > self.account.balance:
                    order.status = 'Cancelled'
                    order.save(update_fields=['status'])
                else:
                    asset.qty += order.qty
                    self.account.balance -= order_cost
                    order.status = 'Completed'
                    order.orderprice = price
                    order.assetid = asset
                    order.save(update_fields=['status', 'orderprice', 'assetid'])
                    self.account.save(update_fields=['balance'])
                    asset.save(update_fields=['qty'])
            else:
                if (asset.qty - order.qty) < 0:
                    order_cost = price * asset.qty
                    asset.qty =0
                    asset.delete()
                    
                else:
                    asset.qty -= order.qty
                    asset.save(update_fields=['qty'])
                self.account.balance += order_cost
                
                order.save(update_fields=['status'])
                self.account.save(update_fields=['balance'])
        else:
            if order.side == 'Sell':
                order.status = 'Cancelled'
                order.save(update_fields=['status'])
            else:
                Assets.objects.create(id=self.account.id+order.ticker, ticker=order.ticker, papertradeaccountid=self.account.id, qty=order.qty, lastdividenddate=datetime.now().date())
                order.status = 'Completed'
                self.account.balance -= order_cost
                order.orderprice = price
                order.save(update_fields=['status', 'orderprice'])
                self.account.save(update_fields=['balance'])

    def convert_to_decimal(self, price):
        converted_number = Decimal(price)
        return converted_number.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def is_before_next_open_stock_day(self, saved_date, current_date):
        est = ZoneInfo("America/New_York")

        saved_date_est = saved_date.astimezone(est)
        current_date_est = current_date.astimezone(est)

        # Case 1: Same date
        if saved_date_est.date() == current_date_est.date():
            return True

        # Case 2: Next day but before 8:30 AM EST
        if current_date_est.date() == (saved_date_est.date() + timedelta(days=1)):
            cutoff = datetime.combine(current_date_est.date(), time(8, 30), tzinfo=est)
            return current_date_est < cutoff

        return False