const

const dummyTransactions = [
    {id: 1,name: 'Bolo de brigadeiro', amount: -20},
    {id: 2,name: 'Salário', amount: 300},
    {id: 3,name: 'Torta de Frango', amount: -10},
    {id: 4,name: 'Violão', amount: 150}
]

const addTransactionIntoDOM = transaction =>{
    const operator = transaction.amount < 0 ? '-' : '+'
    const CSSlass = transaction.amout < 0 ? 'minus' : 'plus'
    const amoutWithoutOperato =  Math.abs(transaction.amount)
    const li = document.createElement('li')

    li.classList.add(CSSlass)
    li.innerHTML = `
     ${transaction.name} <span>${operator} R$ ${amoutWithoutOperato} </span><button class="delete-btn"
    `
    console.log(li)
}

addTransactionIntoDOM(dummyTransactions[0])