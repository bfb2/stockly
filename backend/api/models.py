from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import requests
from django.core.exceptions import ValidationError
import os

# Create your models here.
def validateAssets(value):
    if not isinstance(value, dict):
        raise ValidationError('Item must be a dict')
    values = value.values()
    for asset in values:
        if not isinstance(asset, dict):
            raise ValidationError('Item not a dict')
        if 'ticker' not in asset or not isinstance(asset['ticker'], str):
            raise ValidationError('name must be a string')
        if len(asset['ticker']) < 1:
            raise ValidationError('ticker must be atleast 1 character long')
        if 'allocations' not in asset or not isinstance(asset['allocations'], list):
            raise ValidationError('allocations must be a list')
        if len(asset['allocations']) > 3:
            raise ValidationError('allocations can only have 3 numbers')
    
        for number in asset['allocations']:
            if not isinstance(number, (int, float)) or  not (0 <= number <= 100):
                raise ValidationError('Each number must be between 0 and 100')
    for portfolio_num in range(3):
        portfolio_total = 0
        for asset in values:
            portfolio_total += float(asset['allocations'][portfolio_num])
            if portfolio_total > 100:
                raise ValidationError(f'portfolio #{portfolio_num} allocation exceeds 100%')
        
class BackTracePortfolio(models.Model):
    start_date = models.DateField(),
    end_date = models.DateField(),
    initial_amount = models.PositiveIntegerField(),
    rebalancing = models.CharField(
        max_length=23,
        choices=[
            ('No Rebalancing', 'No Rebalancing'),
            ('Rebalance Annually', 'Rebalance Annually'),
            ('Rebalance Semi-Annually', 'Rebalance Semi-Annually'),
            ('Rebalance Quarterly', 'Rebalance Quarterly'),
            ('Rebalance Monthly', 'Rebalance Monthly')
        ],
        default='No Rebalancing'
    ),
    leverage = models.IntegerField(default=1),
    cashflows = models.CharField(
       choices=[
           ('None','None'),
           ('Contribute fixed amount','Contribute fixed amount'),
           ('Withdraw fixed percentage','Withdraw fixed percentage'),
           ('Withdraw fixed amount','Withdraw fixed amount')
       ]
    ),
    contribution_amount = models.PositiveIntegerField(default=0),
    withdraw_amount = models.PositiveIntegerField(default=0),
    withdraw_pct = models.PositiveIntegerField(default=0, validators=[MinValueValidator(1), MaxValueValidator(100)]),
    frequency = models.CharField(choices=[
        ('Annually','Annually'),
        ('Monthly','Monthly'),
        ('Quarterly','Quarterly')
    ]),
    reinvest_dividends = models.BooleanField(),
    expense_ratio = models.FloatField(default=0, validators=[MinValueValidator(0.0), MaxValueValidator(99.9)])
    assets = models.JSONField(validators=[validateAssets])
 
class Papertradeaccount(models.Model):
    id = models.TextField(primary_key=True)
    userid = models.OneToOneField('User', models.DO_NOTHING, db_column='userID')  # Field name made lowercase.
    balance = models.FloatField()

    class Meta:
        managed = False
        db_table = 'PaperTradeAccount'


class User(models.Model):
    id = models.TextField(primary_key=True)
    email = models.TextField(unique=True)

    class Meta:
        managed = False
        db_table = 'User'

class Assets(models.Model):
    id = models.TextField(primary_key=True)
    ticker = models.TextField()
    papertradeaccountid = models.ForeignKey('Papertradeaccount', models.DO_NOTHING, db_column='paperTradeAccountId')  # Field name made lowercase.
    qty = models.IntegerField()
    lastdividenddate = models.DateTimeField(db_column='lastDividendDate', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Assets'


class Papertradeorder(models.Model):
    papertradeaccountid = models.ForeignKey(Papertradeaccount, models.DO_NOTHING, db_column='paperTradeAccountId')  # Field name made lowercase.
    ticker = models.TextField()
    ordertype = models.TextField(db_column='orderType')  # Field name made lowercase.
    side = models.TextField()
    qty = models.IntegerField()
    status = models.TextField()
    submitted = models.DateTimeField()
    orderprice = models.FloatField(db_column='orderPrice', blank=True, null=True)  # Field name made lowercase.
    assetid = models.ForeignKey(Assets, models.DO_NOTHING, db_column='assetId', blank=True, null=True)  # Field name made lowercase.
    limitprice = models.FloatField(db_column='limitPrice', blank=True, null=True)  # Field name made lowercase.
    stopprice = models.FloatField(db_column='stopPrice', blank=True, null=True)  # Field name made lowercase.
    trailprice = models.FloatField(db_column='trailPrice', blank=True, null=True)  # Field name made lowercase.
    trailrate = models.FloatField(db_column='trailRate', blank=True, null=True)  # Field name made lowercase.
    traildollars = models.FloatField(db_column='trailDollars', blank=True, null=True)  # Field name made lowercase.
    datelastchecked = models.DateTimeField(db_column='dateLastChecked')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'PaperTradeOrder'


def check_if_valid_ticker(ticker):
    response = requests.get(f"https://finnhub.io/api/v1/search?q={ticker}&exchange=US&token={os.environ.get('SECRET_FINNHUB_KEY')}")
    if response.ok:
        data = response.json()
        if data["count"] == 0:
            raise ValidationError("Invalid ticker")
    else:
        raise ValidationError("Failed to check ticker")
    
def validate_order_type_details(order_type_details):
    if not len(order_type_details) == 4:
        raise ValidationError("Incorrect order type details")
    
    valid_keys =  ['stopPrice', 'limitPrice', 'trailRate', 'trailDollars']
    for key in valid_keys:
        if key not in order_type_details:
            raise ValidationError(f"{key} not in order type details")
        
        value = order_type_details[key]
        if not isinstance(value, (int,float,type(None))):
            raise ValidationError(f'wrong value associated with {key}')
    
    
class TradeRequest(models.Model):
    ticker = models.CharField(blank=False, validators=[check_if_valid_ticker])
    qty = models.IntegerField(blank=False, validators=[MinValueValidator(1)])
    order_type = models.CharField(choices=[("Market", "Market") , ("Limit","Limit") , ("Stop", "Stop"), ("Stop Limit","Stop Limit"), ("Trailing Stop","Trailing Stop")])
    side = models.CharField(choices=[('Buy', "Buy"), ("Sell", "Sell")])
    time_in_force = models.CharField(choices=[("DAY", "DAY") , ("GTC - Good til Cancelled","GTC - Good til Cancelled")])
    order_type_details = models.JSONField(validators=[validate_order_type_details])

class Monthlyindicatordata(models.Model):
    id = models.TextField(primary_key=True)
    lei = models.JSONField()
    manufacturingpmi = models.JSONField(db_column='ManufacturingPmi')  # Field name made lowercase.
    servicespmi = models.JSONField(db_column='servicesPmi')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'MonthlyIndicatorData'