from rest_framework import serializers
from .models import BackTracePortfolio, TradeRequest

class BacktracePortfolioSerialzer(serializers.ModelSerializer):
    class Meta:
        model = BackTracePortfolio
        fields = [ 'start_date', 'end_date', "initial_amount", 'rebalancing', "leverage", "assets", 'cashflows', 'withdraw_pct', 'withdraw_amount', 'contribution_amount']

class CreatePaperTradeOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradeRequest
        fields='__all__'
    