// Selecionar elementos do DOMdocument.addEventListener("DOMContentLoaded", function() {
    const transactionsUl = document.querySelector('#transactions');
    const incomeDisplay = document.querySelector('#money-plus');
    const expenseDisplay = document.querySelector('#money-minus');
    const balanceDisplay = document.querySelector('#balance');
    const form = document.querySelector('#form');
    const inputTransactionName = document.querySelector('#text');
    const inputTransactionAmount = document.querySelector('#amount');

     const transactionsByMonth = {
        '01': [], // Janeiro
        '02': [], // Fevereiro
        '03': [], // Março
        '04': [], // Abril
        '05': [], // Maio
        '06': [], // Junho
        '07': [], // Julho
        '08': [], // Agosto
        '09': [], // Setembro
        '10': [], // Outubro
        '11': [], // Novembro
        '12': [], // Dezembro
    };
inputTransactionAmount.addEventListener("change", function() {
    this.value = parseFloat(this.value).toFixed(2);
});

// Recuperar transações do armazenamento local ou criar uma lista vazia
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// Função para remover uma transação com base em seu ID
const removeTransaction = ID => {
    transactions = transactions.filter(transaction => transaction.id !== ID);
    updateLocalStorage();
    init(); // Atualiza o DOM após remover a transação
}

const categoriesMapping = {
    'manutencao-casa': 'Manutenção da Casa',
    'saude': 'Saúde',
    'comida': 'Comida',
    'outros': 'Outros',
    'comunicacao': 'Comunicação',
    'despesas-pessoais': 'Despesas Pessoais'
};

const transactionMonthSelect = document.querySelector('#transaction-month');

transactionMonthSelect.addEventListener('change', () => {
    const selectedMonth = transactionMonthSelect.value;
    const transactionsForSelectedMonth = transactions.filter(transaction => transaction.month === selectedMonth);
    updateTransactionsList(transactionsForSelectedMonth);
    updateBalanceValues();
    updateGraph(); // Atualize o gráfico com base no mês selecionado
});

const updateTransactionsList = (transactions) => {
    transactionsUl.innerHTML = ''; // Limpa a lista de transações atual

    transactions.forEach(transaction => {
        addTransactionIntoDOM(transaction);
    });
};


// Função para adicionar uma transação ao DOM
const addTransactionIntoDOM = ({ amount, name, id, category, month }) => {
    const operator = amount < 0 ? '-' : '+';
    const CSSClass = amount < 0 ? 'minus' : 'plus';
    const amountWithoutOperator = Math.abs(amount);
    const li = document.createElement('li');

    if (month === transactionMonthSelect.value) { // Verifica se é do mês selecionado
        li.classList.add(CSSClass);

        let categoryDisplay = '';
        if (amount < 0) {
            categoryDisplay = `(${categoriesMapping[category]})`;
        }

        li.innerHTML = `
            ${name} <span>${operator} R$ ${amountWithoutOperator} ${categoryDisplay}</span>
            <button class="delete-btn" onClick="removeTransaction(${id})">X</button>`;
        transactionsUl.append(li);
    }
};

// Funções para calcular as despesas, receitas e total
const getExpenses = transactionsAmounts => Math.abs(transactionsAmounts
    .filter(value => value < 0)
    .reduce((accumulator, value) => accumulator + value, 0))
    .toFixed(2);

const getIncome = transactionsAmounts => transactionsAmounts
    .filter(value => value > 0)
    .reduce((accumulator, value) => accumulator + value, 0)
    .toFixed(2);

const getTotal = transactionsAmounts => transactionsAmounts
    .reduce((accumulator, transaction) => accumulator + transaction, 0)
    .toFixed(2);

// Atualiza os valores de saldo, receitas e despesas no DOM
const updateBalanceValues = () => {
    const selectedMonth = transactionMonthSelect.value;
    const transactionsForSelectedMonth = transactionsByMonth[selectedMonth];
    const transactionsAmounts = transactionsForSelectedMonth.map(({ amount }) => amount);

    const total = getTotal(transactionsAmounts);
    const income = getIncome(transactionsAmounts);
    const expense = getExpenses(transactionsAmounts);

    balanceDisplay.textContent = `R$ ${total}`;
    incomeDisplay.textContent = `R$ ${income}`;
    expenseDisplay.textContent = `R$ ${expense}`;
};



const calculateCategoryTotals = (transactions) => {
    const categoryTotals = {};

    transactions.forEach(transaction => {
        const categoryName = transaction.category || 'Outros';
        const amount = transaction.amount;

        if (amount < 0) {
            if (categoryTotals[categoryName]) {
                categoryTotals[categoryName] += amount;
            } else {
                categoryTotals[categoryName] = amount;
            }
        }
    });

    return categoryTotals;
};




// ...

// ...

const updateGraph = () => {
    const selectedMonth = transactionMonthSelect.value;
    const transactionsForSelectedMonth = transactions.filter(transaction => transaction.month === selectedMonth);

    const categoryTotals = calculateCategoryTotals(transactionsForSelectedMonth);
    const negativeCategoryNames = Object.keys(categoryTotals).filter(category => categoryTotals[category] < 0);

    const data = negativeCategoryNames.map(category => ({
        x: [categoriesMapping[category] || category],
        y: [categoryTotals[category]],
        type: 'bar'
    }));

    const layout = {
        xaxis: {
            tickangle: -45,
            automargin: true
        }
    };

    Plotly.newPlot('grafico', data, layout);
};

// ...






// ...


// Inicialização: limpa o DOM, adiciona as transações e atualiza os valores
const init = () => {
    transactionsUl.innerHTML = '';
    transactions.forEach(addTransactionIntoDOM);
    updateTransactionsList(transactions);
    updateBalanceValues();
    updateGraph();
    
};

init(); // Inicializa o aplicativo ao carregar

// Função para atualizar o armazenamento local com as transações atuais
const updateLocalStorage = () => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Gera um ID aleatório
const generateID = () => Math.round(Math.random() * 1000);

// Adiciona uma transação à lista
const addToTransactionsArray = (transactionName, transactionsAmounts, category, selectedMonth) => {
    const amount = Number(transactionsAmounts);

    const newTransaction = {
        id: generateID(),
        name: transactionName,
        amount: amount,
        category: category,
        month: selectedMonth // Adicione o mês à transação
    };

    transactions.push(newTransaction); // Adicionar à lista completa de transações

    // Adicionar à lista de transações do mês correspondente
    transactionsByMonth[selectedMonth].push(newTransaction); // Adicione a transação ao mês correto

    // Atualizar a exibição dos dados
    init();
    updateLocalStorage();
    cleanInputs();
};



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
        const amount = Number(transactionsAmounts);
        const category = document.querySelector('#category').value;
        const selectedMonth = document.querySelector('#transaction-month').value;

        const isSomeInputEmpty = transactionName === '' || transactionsAmounts === '';

        if (isSomeInputEmpty) {
            alert('Por favor, preencha nome e valor da transação');
            return;
        }

        addToTransactionsArray(transactionName, transactionsAmounts, category, selectedMonth);
        init();
        updateLocalStorage();
        cleanInputs();
    }



form.addEventListener('submit', handleFormSubmit); // Escuta o envio do formulário