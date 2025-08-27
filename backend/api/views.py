from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import BacktracePortfolioSerialzer, CreatePaperTradeOrderSerializer
from api.authentication import AuthenticateJWE
from api.models import User, Monthlyindicatordata
from .services import (TradeAccount, Backtrace, CreateTradeOrder, EconomicInfo)
import traceback

# Create your views here.
class BacktracePortfolioAPIView(APIView):
    def get(self, request):
        serializer = BacktracePortfolioSerialzer(data = request.query_params)
        if serializer.is_valid():
            data = serializer.validated_data
            portfolio_simulation = Backtrace(data['tickers'],data['allocations'], data['start_date'], data['end_date'], data['initial_amount'],
                                             data['rebalancing'],data['leverage'], data['cashflows'], data['contribution_amount'], 
                                             data['withdraw_amount'],data['withdraw_pct'], data['frequency'], data['expense_ratio'], 
                                             data['reinvest_dividends'])
            try:
                portfolio_simulation.calculate_portfolio_growth()
                portfolio_simulation.calculate_portfolio_stats()
            except Exception as e:
                print("Error type:", type(e).__name__)
                print("Error details:", repr(e))
                traceback.print_exc()
                return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                        

                      
            return Response({'growth':portfolio_simulation.portfolio_growth, 'annual':portfolio_simulation.portfolio_annual, 'stats':portfolio_simulation.stats}, status=status.HTTP_200_OK)
        else:
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PaperTradeAccountInfo(APIView):
    authentication_classes = [AuthenticateJWE]
    def get(self, request):
        user = request.user
        if not user:
            return Response({'Not logged in'},status=status.HTTP_401_UNAUTHORIZED)
        
        account_info = TradeAccount(user)
        try:
            account_info.check_unfinished_orders()
            account_info.process_asset_data()
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        orders = account_info.retrieve_every_order()
        return Response({
            "account_asset_info":account_info.account_asset_info, 
            "balance":account_info.balance, 
            "total_assets":account_info.total_assets, 
            "orders":list(orders.values())
        })
        


class CreatePaperTradeOrder(APIView):
    authentication_classes = [AuthenticateJWE] 
    def post(self, request):
        serializer = CreatePaperTradeOrderSerializer(data = request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else: 
            order_type = request.data.get('order_type')
            side = request.data.get('side')
            ticker = request.data.get('ticker')
            qty = request.data.get('qty')
            order_type_details = request.data.get('order_type_details')
            print('xebec')
            create_trade_order = CreateTradeOrder(order_type, side, ticker, qty, order_type_details,request.user)
            
            if side =='Buy' and not create_trade_order.sufficient_funds():
                return Response({'Insufficient Balance'}, status=status.HTTP_400_BAD_REQUEST)
            elif side == 'Sell' and not create_trade_order.valid_ticker():
                return Response({'Not an owned ticker'}, status=status.HTTP_400_BAD_REQUEST)
            
            create_trade_order.process_order()


class GatherTechinicalDetails(APIView):
    def get(self, request):
        economic_info = EconomicInfo()        
        equity_data = economic_info.get_market_data()
        fred_stats = economic_info.retrieve_fred_info()
        monthly_data = Monthlyindicatordata.objects.values().first()
        return Response({'market':equity_data, 'fred_stats':fred_stats, "stats":monthly_data}, status=status.HTTP_200_OK)


        