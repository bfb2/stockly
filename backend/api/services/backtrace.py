from .util import retrieve_from_yf
from math import isnan
from ..utils import OrderedSet
from datetime import datetime
import pandas as pd
import math
from itertools import islice
from collections import defaultdict

class Backtrace():
    def __init__(self, assets, start_date,end_date,initial_amount,rebalancing,leverage,cashflows,contribution_amount,
                 withdraw_amount,withdraw_pct,frequency,expense_ratio, reinvest_dividends):
        self.tickers = []
        self.allocations = []
        self.portfolio_info = [{},{},{}]
        self.start_date = start_date
        self.end_date = end_date
        self.initial_amount = float(initial_amount)
        self.rebalancing = rebalancing
        self.leverage = leverage
        self.cashflows = cashflows
        self.contribution_amount = contribution_amount
        self.withdraw_amount = withdraw_amount
        self.withdraw_pct = withdraw_pct
        self.frequency = frequency
        self.expense_ratio = expense_ratio
        self.reinvest_dividends = reinvest_dividends
        self.portfolio_annual ={'years':OrderedSet(), 'data':[{},{},{}]}
        self.portfolio_growth = [{},{},{}]
        self.stats = [
            {'cagr':'-', 'end':'-','max':'-','peak_date':'', 'bottom_date':'', 'shares':{}, 'divs':{}, 'excess cash':{}},
            {'cagr':'-', 'end':'-','max':'-','peak_date':'', 'bottom_date':'', 'shares':{}, 'divs':{}, 'excess cash':{}},
            {'cagr':'-', 'end':'-','max':'-','peak_date':'', 'bottom_date':'', 'shares':{}, 'divs':{}, 'excess cash':{}}
        ]

        for data in assets.values():
                if not all(allocation == 0 for allocation in data['allocations']):
                    self.tickers.append(data['ticker']) 
                    self.allocations.append(data['allocations'])
                    for portfolio_num, allocation in enumerate(data['allocations']):
                        if allocation != 0:
                            self.portfolio_info[portfolio_num][data['ticker']] = allocation

                    
    def calculate_growth_between_dates(self, beginning_date, end_date, portfolio):
        beginning = self.portfolio_growth[portfolio][beginning_date]['total']
        end = self.portfolio_growth[portfolio][end_date]['total']
        if beginning == 0:
            return 0
        return ((end - beginning) / beginning) * 100

    def calculate_portfolio_growth(self):
        stock_data = retrieve_from_yf(datetime.strptime(self.start_date,"%Y-%m-%d"), datetime.strptime(self.end_date,"%Y-%m-%d"), self.tickers)        
        stock_prices = stock_data['Adj Close'] if self.reinvest_dividends else stock_data['Close'] 
        stock_dividends = stock_data['Dividends']
        daily_er_fee = (float(self.expense_ratio)/100) / 252

        for portfolio_num, portfolio in enumerate(self.portfolio_info): 
            portfolio_tickers = portfolio.keys()
            normalized_prices = stock_prices[portfolio_tickers].dropna()
            percent_change = normalized_prices.pct_change()
            first_open_days = normalized_prices.groupby([normalized_prices.index.year, normalized_prices.index.month]).head(1)
            last_date = None
            for date in percent_change.index:
                stock_date = str(date).split()[0]
                date_to_check = pd.to_datetime(date)   
                self.portfolio_annual['years'].add(stock_date[:4])
                for ticker, allocation in portfolio.items():
                    pct_change = percent_change.at[date, ticker]
                                     
                    #first day always nan
                    if isnan(pct_change): 
                        starting_point = self.initial_amount*(allocation/100)
                        current_price = stock_data.loc[date_to_check, ("Close", ticker)]
                        shares = starting_point / current_price 
                        
                        self.stats[portfolio_num]['shares'][ticker] = shares
                        self._add_to_portfolio_growth(portfolio_num, stock_date, ticker, starting_point)
                        last_date = stock_date
                        continue

                    #after first day
                    stock_growth = 1 + ((pct_change*float(self.leverage)) - daily_er_fee)
                    previous_amount = self.portfolio_growth[portfolio_num][last_date][ticker] #previous_amount_per_portfolio[portfolio_num]
                    amount = previous_amount*stock_growth
                    amount = amount if amount > 0 else 0
                    self._add_to_portfolio_growth(portfolio_num, stock_date, ticker, amount)
                    
                   
                    #dividends
                    if not self.reinvest_dividends: 
                        div_amount = stock_dividends.loc[date_to_check, ticker]
                        if div_amount:
                            cash_recieved = div_amount * self.stats[portfolio_num]['shares'][ticker]
                            self.stats[portfolio_num]['divs'][ticker] = self.stats[portfolio_num]['divs'].get(ticker, 0)+cash_recieved
                    
                    stock_month = stock_date[5:7]
                    #cashflows
                    if date_to_check in first_open_days.index:
                        action_day = (self.frequency == 'Annually' and stock_month == '01') or (self.frequency == 'Monthly') or (self.frequency == 'Quarterly' and (stock_month == '01' or stock_month == '04' or stock_month == '07' or stock_month == '10'))    
                        match self.cashflows:
                            case 'Contribute fixed amount':
                                if action_day:
                                    contribution = float(self.contribution_amount)*(allocation/100)
                                    current_price = stock_data.loc[date_to_check, ("Close", ticker)]
                                    shares = contribution/current_price
                                    self.portfolio_growth[portfolio_num][stock_date][ticker] += contribution
                                    self.portfolio_growth[portfolio_num][stock_date]['total'] += contribution
                                    self.stats[portfolio_num]['shares'][ticker] += shares
                            case 'Withdraw fixed percentage':
                                if action_day:
                                    withdraw = ((100-float(self.withdraw_pct))/100)*(allocation/100)
                                    amount_withdrawn = self.portfolio_growth[portfolio_num][stock_date][ticker] * withdraw
                                    current_price = stock_data.loc[date_to_check, ("Close", ticker)]
                                    shares = amount_withdrawn / current_price
                                    self.portfolio_growth[portfolio_num][stock_date]['total'] -= amount_withdrawn
                                    self.portfolio_growth[portfolio_num][stock_date][ticker] -= amount_withdrawn
                                    self.stats[portfolio_num]['shares'][ticker]-= shares
                            case 'Withdraw fixed amount':
                                if action_day:
                                    withdraw = float(self.withdraw_amount)*(allocation/100)
                                    current_price = stock_data.loc[date_to_check, ("Close", ticker)]
                                    shares = withdraw / current_price
                                    self.stats[portfolio_num]['shares'][ticker]-= shares
                                    self.portfolio_growth[portfolio_num][stock_date]['total'] -= withdraw
                                    self.portfolio_growth[portfolio_num][stock_date][ticker] -= withdraw
                        
                last_date = stock_date
                if date_to_check in first_open_days.index and ((self.rebalancing == 'Rebalance annually' and stock_month == '01') or (self.rebalancing == 'Rebalance semi-annually' and (stock_month == '01' or stock_month == '07' )) or (self.rebalancing == 'Rebalance quarterly' and (stock_month == '03'  or stock_month == '06'  or stock_month == '09' or stock_month == '12' )) or self.rebalancing == 'Rebalance monthly'):
                    for ticker, allocation in portfolio.items():
                        current_amount = self.portfolio_growth[portfolio_num][stock_date][ticker]
                        rebalanced_amount = self.portfolio_growth[portfolio_num][stock_date]['total'] * (allocation/100) 
                        current_price = stock_data.loc[date_to_check, ("Close", ticker)]
                        shares = (current_amount - rebalanced_amount)/current_price
                        self.stats[portfolio_num]['shares'] -= shares
                        self.portfolio_growth[portfolio_num][stock_date][ticker] = rebalanced_amount#round(rebalanced_amount,2)

        self.portfolio_annual['years'] = list(self.portfolio_annual['years'])  
        
    
    def calculate_portfolio_stats(self):
        for index, portfolio in enumerate(self.portfolio_growth):
            if not portfolio:
                continue
            peak = 0
            peak_date=''
            bottom = 0
            bottom_date =''
            max_drawdown = 0
            last_date = next(reversed(portfolio))
            beginning = next(iter(portfolio))
            last_date_in_loop = ''

            for date in portfolio:
                if date == last_date or (date[5:7] == '01' and last_date_in_loop[5:7] == '12'):
                    end_date = date if date == last_date else last_date_in_loop
                    growth = self.calculate_growth_between_dates(beginning, end_date, index)
                    self.portfolio_annual['data'][index][end_date[:4]] =round(growth, 2)
                    beginning = last_date_in_loop #growth from last day of last year to last day of this year
                
                last_date_in_loop = date
                if portfolio[date]['total'] > peak:
                    if peak != 0:#or bottom != 0
                        drawdown = ((bottom - peak) / peak) * 100
                        if drawdown < max_drawdown:
                            max_drawdown = drawdown
                            self.stats[index]['peak_date'] = peak_date
                            self.stats[index]['bottom_date'] = bottom_date
                    peak = portfolio[date]['total']
                    peak_date = date
                    bottom_date = date
                    bottom = portfolio[date]['total']
                if portfolio[date]['total'] < bottom:
                    bottom = portfolio[date]['total']
                    bottom_date = date

            self.stats[index]['max'] = max_drawdown

            self.stats[index]['end'] = portfolio[last_date]['total']
            self.stats[index]['cagr'] = ((self.stats[index]['end']/self.initial_amount)**(1/len(self.portfolio_annual['years']))-1)*100  


    def _add_to_portfolio_growth(self, portfolio_num, stock_date, ticker, amount):
        self.portfolio_growth[portfolio_num].setdefault(stock_date, {})[ticker] =amount
        self.portfolio_growth[portfolio_num][stock_date]['total'] = self.portfolio_growth[portfolio_num][stock_date].get('total',0)+ amount

    def _calc_shares_bought_and_value(self, capital, stock_price, ):
        shares = capital / stock_price 
        amount_used = capital 
        return {'shares':shares, 'amount_bought':amount_used}