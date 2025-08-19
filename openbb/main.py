from openbb import obb
from pymongo import MongoClient
from dotenv import dotenv_values

env = dotenv_values()

filters = {
    "materials": {
        "Dividend Yield": "Over 2%",
        "P/E": "Under 20",
        "P/B": "Under 3",
        "EPS growthpast 5 years": "Positive (>0%)",
        "Return on Assets": "Positive (>0%)",
        "Return on Equity": "Over +10%",
        "Debt/Equity": "Under 0.7",
        "Net Profit Margin": "Positive (>0%)",
    },
    # "communication_services": {
    #     "Dividend Yield": "Over 2%",
    #     "P/E": "Under 20",
    #     "P/B": "Under 3",
    #     "EPS growthpast 5 years": "Positive (>0%)",
    #     "Return on Assets": "Positive (>0%)",
    #     "Return on Equity": "Over +10%",
    #     "Debt/Equity": "Under 1",
    #     "Net Profit Margin": "Positive (>0%)",
    # },
    # "consumer_cyclical": {
    #     "Dividend Yield": "Over 1%",
    #     "P/E": "Under 20",
    #     "P/B": "Under 3",
    #     "EPS growthpast 5 years": "Positive (>0%)",
    #     "Return on Assets": "Positive (>0%)",
    #     "Return on Equity": "Over +10%",
    #     "Debt/Equity": "Under 0.7",
    #     "Net Profit Margin": "Positive (>0%)",
    # },
    # "consumer_defensive": {
    #     "Dividend Yield": "Over 2%",
    #     "P/E": "Under 20",
    #     "P/B": "Under 3",
    #     "EPS growthpast 5 years": "Positive (>0%)",
    #     "Return on Assets": "Positive (>0%)",
    #     "Return on Equity": "Over +10%",
    #     "Debt/Equity": "Under 0.7",
    #     "Net Profit Margin": "Positive (>0%)",
    # },
    # "energy": {
    #     "Dividend Yield": "Over 2%",
    #     "P/E": "Under 20",
    #     "P/B": "Under 3",
    #     "EPS growthpast 5 years": "Positive (>0%)",
    #     "Return on Assets": "Positive (>0%)",
    #     "Return on Equity": "Over +10%",
    #     "Debt/Equity": "Under 0.7",
    #     "Net Profit Margin": "Positive (>0%)",
    # },
    # "financial": {
    #     "Dividend Yield": "Over 2%",
    #     "P/E": "Under 20",
    #     "P/B": "Under 3",
    #     "EPS growthpast 5 years": "Positive (>0%)",
    #     "Return on Assets": "Positive (>0%)",
    #     "Return on Equity": "Over +10%",
    #     "Debt/Equity": "Under 0.7",
    #     "Net Profit Margin": "Positive (>0%)",
    # },
    # "healthcare": {
    #     "Dividend Yield": "Any",
    #     "P/E": "Under 20",
    #     "P/B": "Under 3",
    #     "EPS growthpast 5 years": "Positive (>0%)",
    #     "Return on Assets": "Positive (>0%)",
    #     "Return on Equity": "Over +10%",
    #     "Debt/Equity": "Under 0.7",
    #     "Net Profit Margin": "Positive (>0%)",
    # },
    # "industrials": {
    #     "Dividend Yield": "Over 1%",
    #     "P/E": "Under 20",
    #     "P/B": "Under 3",
    #     "EPS growthpast 5 years": "Positive (>0%)",
    #     "Return on Assets": "Positive (>0%)",
    #     "Return on Equity": "Over +10%",
    #     "Debt/Equity": "Under 0.7",
    #     "Net Profit Margin": "Positive (>0%)",
    # },
    # "real_estate": {
    #     "Dividend Yield": "Over 3%",
    #     "P/E": "Any",
    #     "P/B": "Any",
    #     "EPS growthpast 5 years": "Positive (>0%)",
    #     "Return on Assets": "Positive (>0%)",
    #     "Return on Equity": "Over +10%",
    #     "Debt/Equity": "Any",
    #     "Net Profit Margin": "Positive (>0%)",
    # },
    # "technology": {
    #     "Dividend Yield": "Over 1%",
    #     "P/E": "Under 20",
    #     "P/B": "Under 3",
    #     "EPS growthpast 5 years": "Positive (>0%)",
    #     "Return on Assets": "Positive (>0%)",
    #     "Return on Equity": "Over +10%",
    #     "Debt/Equity": "Under 0.7",
    #     "Net Profit Margin": "Positive (>0%)",
    # },
    # "utilities": {
    #     "Dividend Yield": "Over 3%",
    #     "P/E": "Under 20",
    #     "P/B": "Under 3",
    #     "EPS growthpast 5 years": "Positive (>0%)",
    #     "Return on Assets": "Positive (>0%)",
    #     "Return on Equity": "Over +10%",
    #     "Debt/Equity": "Any",
    #     "Net Profit Margin": "Positive (>0%)",
    # },
}

client = MongoClient(
    host=env["MONGO_HOST"],
    port=env["MONGO_PORT"],
    username=env["MONGO_USER"],
    password=env["MONGO_PASS"],
)
db = client[env["MONGO_DB"]]

def merge_lists(list1, list2):
    merged = []

    for obj in list1:
        copy = obj.model_copy()
        obj2 = next((x for x in list2 if x.symbol == obj.symbol), None)
        for field in vars(obj):
            val_existing = getattr(copy, field)
            val_new = getattr(obj2, field)
            if val_existing is None and val_new is not None:
                setattr(copy, field, val_new)
        merged.append(copy)

    return merged

def screen_sector(sector, filters_dict):
    overview = obb.equity.screener(
        provider="finviz",
        metric="overview",
        mktcap="mid_over",
        sector=sector,
        filters_dict=filters_dict)
    valuation = obb.equity.screener(
        provider="finviz",
        metric="valuation",
        mktcap="mid_over",
        sector=sector,
        filters_dict=filters_dict)
    financial = obb.equity.screener(
        provider="finviz",
        metric="financial",
        mktcap="mid_over",
        sector=sector,
        filters_dict=filters_dict)
    stocks = merge_lists(overview.results, valuation.results)
    stocks = merge_lists(stocks, financial.results)
    return stocks

def main():
    obb.user.credentials.fmp_api_key = env["FMP_API_KEY"]
    collection = db["stocks"]
    for sector, filters_dict in filters.items():
        stocks = screen_sector(sector, filters_dict)
        print(f"\n{sector.replace('_', ' ').title()}:")
        for stock in stocks:
            print(
                stock.name,
                stock.symbol,
                stock.country,
                stock.price_to_earnings,
                stock.price_to_book,
                stock.eps_growth_past_5y,
                stock.dividend_yield,
                stock.return_on_assets,
                stock.return_on_equity,
                stock.debt_to_equity,
                stock.profit_margin,
            )
            # ratios = obb.equity.fundamental.ratios(
            #     provider="fmp",
            #     symbol=stock.symbol,
            # )
            wef = obb.equity.fundamental.balance(stock.symbol, provider="yfinance")
            print(wef)
            data = {
                "name": stock.name,
                "country": stock.country,
                "screener_data": {
                    "market_cap": stock.market_cap,
                    "price_to_earnings": stock.price_to_earnings,
                    "price_to_book": stock.price_to_book,
                    "eps_growth_past_5y": stock.eps_growth_past_5y,
                    "dividend_yield": stock.dividend_yield,
                    "return_on_assets": stock.return_on_assets,
                    "return_on_equity": stock.return_on_equity,
                    "debt_to_equity": stock.debt_to_equity,
                    "profit_margin": stock.profit_margin,
                },
                # "ratios": list(map(lambda x: {
                #     "period_ending": x.period_ending,
                #     "fiscal_period": x.fiscal_period,
                #     "fiscal_year": x.fiscal_year,
                #     "current_ratio": x.current_ratio,
                #     "quick_ratio": x.quick_ratio,
                #     "cash_ratio": x.cash_ratio,
                #     "days_of_sales_outstanding": x.days_of_sales_outstanding,
                #     "days_of_inventory_outstanding": x.days_of_inventory_outstanding,
                #     "operating_cycle": x.operating_cycle,
                #     "days_of_payables_outstanding": x.days_of_payables_outstanding,
                #     "cash_conversion_cycle": x.cash_conversion_cycle,
                #     "gross_profit_margin": x.gross_profit_margin,
                #     "operating_profit_margin": x.operating_profit_margin,
                #     "pretax_profit_margin": x.pretax_profit_margin,
                #     "net_profit_margin": x.net_profit_margin,
                #     "effective_tax_rate": x.effective_tax_rate,
                #     "return_on_assets": x.return_on_assets,
                #     "return_on_equity": x.return_on_equity,
                #     "return_on_capital_employed": x.return_on_capital_employed,
                #     "net_income_per_ebt": x.net_income_per_ebt,
                #     "ebt_per_ebit": x.ebt_per_ebit,
                #     "ebit_per_revenue": x.ebit_per_revenue,
                #     "debt_ratio": x.debt_ratio,
                #     "debt_equity_ratio": x.debt_equity_ratio,
                #     "long_term_debt_to_capitalization": x.long_term_debt_to_capitalization,
                #     "total_debt_to_capitalization": x.total_debt_to_capitalization,
                #     "interest_coverage": x.interest_coverage,
                #     "cash_flow_to_debt_ratio": x.cash_flow_to_debt_ratio,
                #     "company_equity_multiplier": x.company_equity_multiplier,
                #     "receivables_turnover": x.receivables_turnover,
                #     "payables_turnover": x.payables_turnover,
                #     "inventory_turnover": x.inventory_turnover,
                #     "fixed_asset_turnover": x.fixed_asset_turnover,
                #     "asset_turnover": x.asset_turnover,
                #     "operating_cash_flow_per_share": x.operating_cash_flow_per_share,
                #     "free_cash_flow_per_share": x.free_cash_flow_per_share,
                #     "cash_per_share": x.cash_per_share,
                #     "payout_ratio": x.payout_ratio,
                #     "operating_cash_flow_sales_ratio": x.operating_cash_flow_sales_ratio,
                #     "free_cash_flow_operating_cash_flow_ratio": x.free_cash_flow_operating_cash_flow_ratio,
                #     "cash_flow_coverage_ratios": x.cash_flow_coverage_ratios,
                #     "short_term_coverage_ratios": x.short_term_coverage_ratios,
                #     "capital_expenditure_coverage_ratio": x.capital_expenditure_coverage_ratio,
                #     "dividend_paid_and_capex_coverage_ratio": x.dividend_paid_and_capex_coverage_ratio,
                #     "dividend_payout_ratio": x.dividend_payout_ratio,
                #     "price_book_value_ratio": x.price_book_value_ratio,
                #     "price_to_book_ratio": x.price_to_book_ratio,
                #     "price_to_sales_ratio": x.price_to_sales_ratio,
                #     "price_earnings_ratio": x.price_earnings_ratio,
                #     "price_to_free_cash_flows_ratio": x.price_to_free_cash_flows_ratio,
                #     "price_to_operating_cash_flows_ratio": x.price_to_operating_cash_flows_ratio,
                #     "price_cash_flow_ratio": x.price_cash_flow_ratio,
                #     "price_earnings_to_growth_ratio": x.price_earnings_to_growth_ratio,
                #     "price_sales_ratio": x.price_sales_ratio,
                #     "dividend_yield": x.dividend_yield,
                #     "dividend_yield_percentage": x.dividend_yield_percentage,
                #     "dividend_per_share": x.dividend_per_share,
                #     "enterprise_value_multiple": x.enterprise_value_multiple,
                #     "price_fair_value": x.price_fair_value,
                # }, ratios.results)) if ratios is not None else [],
            }
            document = collection.find_one({ "symbol": stock.symbol })
            if document is not None:
                collection.update_one(
                    { "symbol": stock.symbol },
                    { "$set": data },
                )
            else:
                collection.insert_one({
                    "symbol": stock.symbol,
                    **data,
                })
    client.close()

if __name__ == "__main__":
    main()
