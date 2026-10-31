const transactions = [];
const body = document.body;
const toggle = document.querySelector('#version-toggle');
const form = document.querySelector('form');
const message = document.querySelector('#message');
const amountInput = document.querySelector('#amount');
const tagline = document.querySelector('#tagline');
const balanceCard = document.querySelector('#balance-card');
const formTitle = document.querySelector('#form-title');
const historyBody = document.querySelector('#history-body');
const historyEmpty = document.querySelector('#history-empty');

function renderHistory() {
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
  historyEmpty.hidden = transactions.length > 0;
}

function applyVersion(version) {
  const isV2 = version === '2';
  body.classList.toggle('v2', isV2);
  toggle.textContent = isV2 ? 'Версия 1' : 'Версия 2';
  toggle.setAttribute('aria-pressed', String(isV2));
  tagline.textContent = isV2
    ? 'Тёмный обзор и контроль бюджета'
    : 'Простой обзор доходов и расходов';
  formTitle.textContent = isV2 ? 'Быстро добавить операцию' : 'Добавить операцию';
  balanceCard.firstChild.textContent = isV2 ? 'Свободный остаток' : 'Баланс';
}

toggle.addEventListener('click', () => {
  const next = body.classList.contains('v2') ? '1' : '2';
  applyVersion(next);
  localStorage.setItem('fintrack-version', next);
});

applyVersion(localStorage.getItem('fintrack-version') === '2' ? '2' : '1');

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
