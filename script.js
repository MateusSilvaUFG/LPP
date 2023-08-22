const transactionsUl = document.querySelector('#transactions');
const incomeDisplay = document.querySelector('#money-plus');
const expenseDisplay = document.querySelector('#money-minus');
const balanceDisplay = document.querySelector('#balance');
const form = document.querySelector('#form');
const inputTransactionName = document.querySelector('#text');
const inputTransactionAmount = document.querySelector('#amount');
const transactionMonthSelect = document.querySelector('#transaction-month');

const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

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

const categoriesMapping = {
    'manutencao-casa': 'Manutenção da Casa',
    'saude': 'Saúde',
    'comida': 'Comida',
    'outros': 'Outros',
    'comunicacao': 'Comunicação',
    'despesas-pessoais': 'Despesas Pessoais'
}; 

// atualizar a lista de transações no DOM com base em um array de transações fornecido como argumento
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
  
    if (month === transactionMonthSelect.value) {
      li.classList.add(CSSClass);
  
      let categoryDisplay = '';
      if (amount < 0) {
        categoryDisplay = `(${categoriesMapping[category]})`;
      }
  
      let transactionTypeDisplay = '';
      if (category === 'income') {
        transactionTypeDisplay = '(Receita)';
      } else if (category === 'expense') {
        transactionTypeDisplay = '(Despesa)';
      }
  
      li.innerHTML = `
        ${name} <span>${operator} R$ ${amountWithoutOperator} ${categoryDisplay} ${transactionTypeDisplay}</span>
        <button class="delete-btn" onClick="removeTransaction(${id})">X</button>`;
      transactionsUl.append(li);
    }
  };

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

// gera o grafico e atualiza ele
const updateGraph = () => {
    const selectedMonth = transactionMonthSelect.value;
    const transactionsForSelectedMonth = transactions.filter(transaction => transaction.month === selectedMonth);

    const categoryTotals = calculateCategoryTotals(transactionsForSelectedMonth);
    const negativeCategoryNames = Object.keys(categoryTotals).filter(category => categoryTotals[category] < 0);

    const data = negativeCategoryNames.map(category => ({
        y: [categoryTotals[category]],
        type: 'bar',
        name: categoriesMapping[category] || category
    }));

    const layout = {
        xaxis: {
            tickangle: -45,
            automargin: true
        },
        legend: {
            orientation: 'h', 
            x: 0.5, 
            y: -0.15 
        },
        margin: {
            l: 40,
            r: 40,
            t: 40,
            b: 80 
        }
    };

    Plotly.newPlot('grafico', data, layout);
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

// calcula o total de cada categoria de gastos.   
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

// remove uma transação do array com base no ID
const removeTransaction = ID => {
    const removedTransaction = transactions.find(transaction => transaction.id === ID);
    
    if (!removedTransaction) {
        return;
    }

    const removedAmount = removedTransaction.amount;
    const selectedMonth = removedTransaction.month;

    transactions = transactions.filter(transaction => transaction.id !== ID);
    transactionsByMonth[selectedMonth] = transactionsByMonth[selectedMonth].filter(transaction => transaction.id !== ID);

    updateLocalStorage();
    updateBalanceValues();
    updateGraph(); // Se necessário, atualize o gráfico após remover a transação
    updateTransactionsList(transactionsByMonth[selectedMonth]); // Atualize a lista de transações do mês

    init(); // Atualiza o DOM após remover a transação
}

// Manipulador do evento de envio do formulário
const handleFormSubmit = event => {
    event.preventDefault();
  
    const transactionName = inputTransactionName.value.trim();
    const transactionsAmounts = inputTransactionAmount.value.trim();
    const amount = Number(transactionsAmounts);
    const selectedCategory = document.querySelector('#category-select').value; 
  
    const transactionType = document.querySelector('#transaction-type').value;
    const selectedMonth = document.querySelector('#transaction-month').value;
  
    const isSomeInputEmpty = transactionName === '' || transactionsAmounts === '';
  
    if (isSomeInputEmpty) {
      alert('Por favor, preencha nome e valor da transação');
      return;
    }
  
    if (transactionType === 'income') {
      addToTransactionsArray(transactionName, amount, 'income', selectedMonth);
    } else if (transactionType === 'expense') {
      addToTransactionsArray(transactionName, -amount, selectedCategory, selectedMonth); 
    }
  
    init();
    updateLocalStorage();
    cleanInputs();
  };

// Inicialização: limpa o DOM, adiciona as transações e atualiza os valores
const init = () => {
    transactionsUl.innerHTML = '';
    transactions.forEach(addTransactionIntoDOM);
    updateTransactionsList(transactions);
    updateBalanceValues();
    updateGraph();
};

// Função para atualizar o armazenamento local com as transações atuais
const updateLocalStorage = () => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Gera um ID aleatório
const generateID = () => Math.round(Math.random() * 1000);

form.addEventListener('submit', handleFormSubmit);   
    
inputTransactionAmount.addEventListener("change", function() {
    this.value = parseFloat(this.value).toFixed(2);
});


// serve para filtar o mês quando é alterado no DOM
transactionMonthSelect.addEventListener('change', () => {
    const selectedMonth = transactionMonthSelect.value;
    const transactionsForSelectedMonth = transactions.filter(transaction => transaction.month === selectedMonth);
    updateTransactionsList(transactionsForSelectedMonth);
    updateBalanceValues();
    updateGraph();
});

// Limpa os campos de entrada após o envio do formulário
const cleanInputs = () => {
    inputTransactionName.value = '';
    inputTransactionAmount.value = '';
}

init(); // Inicializa o aplicativo ao carregar