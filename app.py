from decimal import Decimal, InvalidOperation

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


def summarize(transactions):
    totals = {"income": Decimal("0"), "expenses": Decimal("0")}
    for item in transactions:
        try:
            amount = Decimal(str(item["amount"]))
            raise ValueError("Amount must be a valid number") from error
        except (KeyError, InvalidOperation, ValueError) as error:
            raise ValueError("Amount must be a valid number") from error
        kind = item.get("type")
        if not amount.is_finite() or amount <= 0:
            raise ValueError("Amount must be greater than zero")
        if kind not in totals:
            raise ValueError("Type must be income or expenses")
        totals[kind] += amount
    return {
        "income": totals["income"],
        "expenses": totals["expenses"],
        "balance": totals["income"] - totals["expenses"],
    }


@app.get("/")
def home():
    return render_template("index.html")


@app.post("/api/summary")
def summary():
    data = request.get_json(silent=True) or {}
    try:
        result = summarize(data.get("transactions", []))
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    return jsonify({key: str(value) for key, value in result.items()})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
