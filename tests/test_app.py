import pytest

from app import app, summarize


@pytest.mark.parametrize(("transactions", "expected"), [
    (
        [{"type": "income", "amount": "100.25"}, {"type": "expenses", "amount": "40"}],
        {"income": "100.25", "expenses": "40", "balance": "60.25"},
    ),
    ([], {"income": "0", "expenses": "0", "balance": "0"}),
])
def test_summary(transactions, expected):
    assert {key: str(value) for key, value in summarize(transactions).items()} == expected


@pytest.mark.parametrize("transaction", [
    {"type": "income", "amount": "-1"}, {"type": "income", "amount": "NaN"},
    {"type": "transfer", "amount": "1"}, {"type": "income", "amount": "oops"},
])
def test_invalid_transaction(transaction):
    with pytest.raises(ValueError):
        summarize([transaction])


def test_page_and_api_validation():
    client = app.test_client()
    page = client.get("/")
    assert page.status_code == 200
    assert b"Finance Tracker" in page.data
    # Версии переключаются на клиенте: отдельной страницы v2 больше нет.
    assert page.data == client.get("/?v=2").data
    assert b'id="history-body"' in page.data
    response = client.post(
        "/api/summary",
        json={"transactions": [{"type": "expenses", "amount": "-2"}]},
    )
    assert response.status_code == 400
