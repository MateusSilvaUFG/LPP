// Selecionar elementos do DOM
const transactionsUl = document.querySelector('#transactions');
const incomeDisplay = document.querySelector('#money-plus');
const expenseDisplay = document.querySelector('#money-minus');
const balanceDisplay = document.querySelector('#balance');
const form = document.querySelector('#form');
const inputTransactionName = document.querySelector('#text');
const inputTransactionAmount = document.querySelector('#amount');

// Recuperar transações do armazenamento local ou criar uma lista vazia
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// Função para remover uma transação com base em seu ID
const removeTransaction = ID => {
    transactions = transactions.filter(transaction => transaction.id !== ID);
    updateLocalStorage();
    init(); // Atualiza o DOM após remover a transação
}

// Função para adicionar uma transação ao DOM
const addTransactionIntoDOM = ({ amount, name, id }) => {
    const operator = amount < 0 ? '-' : '+';
    const CSSlass = amount < 0 ? 'minus' : 'plus';
    const amoutWithoutOperator = Math.abs(amount);
    const li = document.createElement('li');

    li.classList.add(CSSlass);
    li.innerHTML = `
        ${name}
        <span>${operator} R$ ${amoutWithoutOperator} </span>
        <button class="delete-btn" onClick="removeTransaction(${id})">X</button>`;
    transactionsUl.append(li);
}

// Funções para calcular as despesas, receitas e total
const getExpenses = transactionsAmounts => Math.abs(transactionsAmounts
    .filter(value => value < 0)
    .reduce((accumulator, value) => accumulator + value, 0))
    .toFixed(2);

const getIncome = transactionsAmounts => transactionsAmounts
    .filter(value => value > 0)
    .reduce((accumlator, value) => accumlator + value, 0)
    .toFixed(2);

const getTotal = transactionsAmounts => transactionsAmounts
    .reduce((accumulator, transaction) => accumulator + transaction, 0)
    .toFixed(2);

// Atualiza os valores de saldo, receitas e despesas no DOM
const updateBalanceValues = () => {
    const transactionsAmounts = transactions.map(({ amount }) => amount);
    const total = getTotal(transactionsAmounts);
    const income = getIncome(transactionsAmounts);
    const expense = getExpenses(transactionsAmounts);

    balanceDisplay.textContent = `R$ ${total}`;
    incomeDisplay.textContent = `R$ ${income}`;
    expenseDisplay.textContent = `R$ ${expense}`;
}

// Inicialização: limpa o DOM, adiciona as transações e atualiza os valores
const init = () => {
    transactionsUl.innerHTML = '';
    transactions.forEach(addTransactionIntoDOM);
    updateBalanceValues();
}

init(); // Inicializa o aplicativo ao carregar

// Função para atualizar o armazenamento local com as transações atuais
const updateLocalStorage = () => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Gera um ID aleatório
const generateID = () => Math.round(Math.random() * 1000);

// Adiciona uma transação à lista
const addToTransactionsArray = (transactionName, transactionsAmounts) => {
    transactions.push({ 
        id: generateID(),
        name: transactionName,
        amount: Number(transactionsAmounts)
    });
}

// Limpa os campos de entrada após o envio do formulário
const cleanInputs = () => {
    inputTransactionName.value = '';
    inputTransactionAmount.value = '';
}

// Manipulador do evento de envio do formulário
const handleFormSubmit = event => {
    event.preventDefault();

    const transactionName = inputTransactionName.value.trim();
    const transactionsAmounts = inputTransactionAmount.value.trim();
    const isSomeInputEmpty = transactionName === '' || transactionsAmounts === '';

    if (isSomeInputEmpty) {
      alert('Por favor, prencha nome e valor da transação');      
      return;
    }

    addToTransactionsArray(transactionName, transactionsAmounts);
    init(); // Atualiza o DOM após adicionar a transação
    updateLocalStorage();
    cleanInputs();
}

form.addEventListener('submit', handleFormSubmit); // Escuta o envio do formulário
