from rest_framework import serializers
from .models import BackTracePortfolio, TradeRequest

class AllocationField(serializers.ListField):
    """Parses '60,40' into [60,40]."""
    child = serializers.IntegerField(min_value=0, max_value=100)

    def to_internal_value(self, data):
        if isinstance(data, str):
            try:
                data = [int(x) for x in data.split(",")]
            except ValueError:
                raise serializers.ValidationError("Allocations must be integers.")
        return super().to_internal_value(data)

class BacktracePortfolioSerialzer(serializers.Serializer):
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    initial_amount = serializers.IntegerField(min_value=1)

    REBALANCING_CHOICES = [
        ('No Rebalancing', 'No Rebalancing'),
        ('Rebalance Annually', 'Rebalance Annually'),
        ('Rebalance Semi-Annually', 'Rebalance Semi-Annually'),
        ('Rebalance Quarterly', 'Rebalance Quarterly'),
        ('Rebalance Monthly', 'Rebalance Monthly')
    ]
    rebalancing = serializers.ChoiceField(
        choices=REBALANCING_CHOICES, default='No Rebalancing'
    )

    leverage = serializers.IntegerField(default=1)

    CASHFLOW_CHOICES = [
        ('None', 'None'),
        ('Contribute fixed amount', 'Contribute fixed amount'),
        ('Withdraw fixed percentage', 'Withdraw fixed percentage'),
        ('Withdraw fixed amount', 'Withdraw fixed amount')
    ]
    cashflows = serializers.ChoiceField(choices=CASHFLOW_CHOICES, default='None')

    contribution_amount = serializers.IntegerField(min_value=0, default=0)
    withdraw_amount = serializers.IntegerField(min_value=0, default=0)
    withdraw_pct = serializers.IntegerField(min_value=0, max_value=100, default=0)

    FREQUENCY_CHOICES = [
        ('Annually', 'Annually'),
        ('Monthly', 'Monthly'),
        ('Quarterly', 'Quarterly')
    ]
    frequency = serializers.ChoiceField(choices=FREQUENCY_CHOICES, default='Annually')

    reinvest_dividends = serializers.BooleanField(default=True)
    expense_ratio = serializers.FloatField(min_value=0.0, max_value=99.9, default=0.0)

    tickers = serializers.ListField(
        child=serializers.CharField(max_length=5),
        allow_empty=False
    )
    allocations = serializers.ListField(
        child=AllocationField(),
        allow_empty=False
    )

    def validate(self, data):
        # Date check
        if data['end_date'] < data['start_date']:
            raise serializers.ValidationError("end_date must be after start_date")

        # tickers vs allocations length check
        if len(data['tickers']) != len(data['allocations']):
            raise serializers.ValidationError(
                "Number of tickers must equal number of allocations arrays."
            )

        for portfolio_num in range(3):
            portfolio_allocation_total = sum(ticker_allocations[portfolio_num] for ticker_allocations in data['allocations'])
            print(portfolio_allocation_total, portfolio_num, data['allocations'], 'cmonnn manennn')
            if portfolio_allocation_total > 0 and portfolio_allocation_total < 100 :
                print(portfolio_num, portfolio_allocation_total)
                raise serializers.ValidationError(
                    f"Allocations in portfolio {portfolio_num} must sum to 100 (got {portfolio_allocation_total})"
                )

        return data

class CreatePaperTradeOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradeRequest
        fields='__all__'
    