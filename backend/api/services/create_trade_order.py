from .util import get_todays_stock_price_and_return
from ..models import Papertradeaccount, Papertradeorder, Assets
from datetime import datetime, timezone 

class CreateTradeOrder():
    def __init__(self,order_type, side, ticker, qty, order_type_details, userid):
        self.order_type = order_type
        self.side = side
        self.ticker = ticker
        self.qty = qty
        self.order_type_details = order_type_details
        self.paper_trade_account = Papertradeaccount.objects.filter(userid =userid).first()
        try:
            self.stock_price = get_todays_stock_price_and_return(self.ticker)['price']
        except Exception as e:
            raise RuntimeError('Failed fetching data try again', str(e))

    def process_order(self):
        match self.order_type:
                case "Market":
                    self.update_asset_info()
                case "Limit" | 'Stop':
                    limit_price = self.order_type_details['limitPrice'] if self.order_type == 'Limit' else self.order_type_details['stopPrice']
                    if (self.side == 'Buy' and limit_price >= self.stock_price) or (self.side == 'Sell' and limit_price <= self.stock_price):
                        self.update_asset_info()
                    elif self.order_type == 'Limit':
                        today = datetime.now(timezone.utc).date()
                        Papertradeorder.objects.create(ticker=self.ticker, 
                                                   ordertype = self.order_type, 
                                                   side=self.side, 
                                                   qty=self.qty, 
                                                   status='Pending', 
                                                   limitprice=limit_price, 
                                                   submitted=today,
                                                   papertradeaccountid= self.paper_trade_account,
                                                   datelastchecked=today
                                                   )
                    else:
                        today = datetime.now(timezone.utc).date()
                        Papertradeorder.objects.create(ticker=self.ticker, 
                                                   ordertype = self.order_type, 
                                                   side=self.side, 
                                                   qty=self.qty, 
                                                   status='Pending', 
                                                   stopprice=limit_price, 
                                                   submitted=today,
                                                   papertradeaccountid= self.paper_trade_account,
                                                   datelastchecked=today,
                                                  )   
                
                case "Stop Limit":
                    limit_price = self.order_type_details['limitPrice']
                    stop_price = self.order_type_details['stopPrice']
                    if (self.side == 'Buy' and stop_price >= self.stock_price) or (self.side == 'Sell' and stop_price <= self.stock_price):
                        if (self.side == 'Buy' and limit_price >= self.stock_price) or (self.side == 'Sell' and limit_price <= self.stock_price):
                            self.update_asset_info()
                        else:
                            today = datetime.now(timezone.utc).date()
                            Papertradeorder.objects.create(ticker=self.ticker, 
                                                   ordertype = 'Limit', 
                                                   side=self.side, 
                                                   qty=self.qty, 
                                                   status='Pending', 
                                                   limit_price=stop_price, 
                                                   submitted=today,
                                                   papertradeaccountid= self.paper_trade_account,
                                                   datelastchecked=today,
                                                   )
                    else:
                        today = datetime.now(timezone.utc).date()
                        Papertradeorder.objects.create(ticker=self.ticker, 
                                                   ordertype = self.order_type, 
                                                   side='Sell', 
                                                   qty=self.qty, 
                                                   status='Pending', 
                                                   stopprice=stop_price,
                                                   limitprice=limit_price, 
                                                   submitted=today,
                                                   papertradeaccountid= self.paper_trade_account,
                                                   datelastchecked=today,
                                                   )
                
                case "Trailing Stop":
                    trail_rate = self.order_type_details['trailRate']
                    trail_dollars = self.order_type_details['trailDollars']
                    
                    today = datetime.now(timezone.utc).date()
                    Papertradeorder.objects.create(ticker=self.ticker, 
                                                   ordertype = self.order_type, 
                                                   side=self.side, 
                                                   qty=self.qty, 
                                                   status='Pending', 
                                                   trailrate=trail_rate,
                                                   traildollars=trail_dollars,
                                                   trailprice=self.stock_price, 
                                                   submitted=today,
                                                   papertradeaccountid= self.paper_trade_account,
                                                   datelastchecked=today
                                                   )
    
    def update_asset_info(self):
        asset = Assets.objects.filter(papertradeaccountid=self.paper_trade_account.id, ticker=self.ticker).first()
        
        if asset:
            if self.side == 'Buy':
                asset.qty += self.qty
            elif self.side == 'Sell' and asset.qty > self.qty:
                shares_sold = self.qty
                asset.qty -= self.qty
            else:
                asset.qty = 0
                shares_sold = self.qty- asset.qty
            
            asset.save(update_fields=['qty'])
        else:
            asset = Assets.objects.create(id=self.paper_trade_account.id+self.ticker, ticker=self.ticker, papertradeaccountid=self.paper_trade_account, qty=self.qty, lastdividenddate=datetime.now(timezone.utc))
        today = datetime.now(timezone.utc).date()
        Papertradeorder.objects.create(ticker=self.ticker, 
                                       ordertype = self.order_type, 
                                       side=self.side, 
                                       qty=self.qty, 
                                       status='Completed', 
                                       orderprice=self.stock_price, 
                                       submitted=today,
                                       datelastchecked=today,
                                       papertradeaccountid= self.paper_trade_account,
                                       assetid = asset )
        if self.side =="Buy":
            self.paper_trade_account.balance -= self.stock_price*self.qty
        else:
            self.paper_trade_account.balance += (self.stock_price*shares_sold)
        self.paper_trade_account.save(update_fields=['balance'])

    def sufficient_funds(self):
        balance_needed = self.stock_price*self.qty
        if self.paper_trade_account.balance < balance_needed:
            return False
        else:
            return True
       
    
    def valid_ticker(self):
        asset = Assets.objects.filter(papertradeaccountid = self.paper_trade_account.id, ticker=self.ticker).first()
        if asset == None:
            return False
        else:
            return True 