const transactions = [];
const form = document.querySelector('form');
const message = document.querySelector('#message');
const amountInput = document.querySelector('#amount');
const historyBody = document.querySelector('#history-body');
const historyEmpty = document.querySelector('#history-empty');

function renderHistory() {
  if (!historyBody) return;
  historyBody.replaceChildren();
  transactions.forEach((transaction, index) => {
    const row = document.createElement('tr');
    const cells = [
      index + 1,
      transaction.type === 'income' ? 'Доход' : 'Расход',
      `₽ ${Number(transaction.amount).toLocaleString('ru-RU')}`,
    ];
    for (const value of cells) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    }
    historyBody.append(row);
  });
  if (historyEmpty) historyEmpty.hidden = transactions.length > 0;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const transaction = {
    type: document.querySelector('#type').value,
    amount: amountInput.value,
  };
  transactions.push(transaction);

  const response = await fetch('/api/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions }),
  });
  const data = await response.json();

  if (!response.ok) {
    transactions.pop();
    message.textContent = data.error;
    return;
  }

  for (const key of ['income', 'expenses', 'balance']) {
    document.querySelector(`#${key}`).textContent =
      `₽ ${Number(data[key]).toLocaleString('ru-RU')}`;
  }
  amountInput.value = '';
  message.textContent = 'Операция добавлена';
  renderHistory();
});

renderHistory();
