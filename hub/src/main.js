var accounts = require('./util/accounts')
var transactions = require('./util/transactions')
var Blocks = require('./blocks')
var accountsHelpers = require('./util/accounts')
var graph = require('./graph')
var curve = require('./util/curve')

setParameters()

var blockTimer = new Blocks()
var accountPool = accounts.retrieveAllAccounts()
accounts.refillAccounts(blockTimer, accountPool)

var accountsBalance = {}
function trackAccountsBalance () {
  var balances = accountsHelpers.listBalance(accountPool, blockTimer)
  for (var k in balances) {
    if (!accountsBalance[k]) {
      accountsBalance[k] = []
    }
    accountsBalance[k].push(balances[k])
  }
}

// transactions.executeBlankStory(blockTimer, 20, trackAccountsBalance)
transactions.executeStory(blockTimer, accountPool, trackAccountsBalance)
console.log(accountsBalance);
graph.drawGraph(accountsBalance)

function setParameters () {
  console.log(process.argv)
  var X0 = 20 // block time to 0
  var A2 = 0.20 // decreasing coeff
  var refillAmount = 500
  var refillDelay = 14
  if (process.argv.length > 2) {
    process.argv.map(function (item, i) {
      if (item === '-lifetime') {
        X0 = parseInt(process.argv[i + 1])
      } else if (item === '-curve') {
        A2 = parseFloat(process.argv[i + 1])
      } else if (item === '-refill') {
        refillAmount = parseInt(process.argv[i + 1])
      } else if (item === '-delay') {
        refillDelay = parseInt(process.argv[i + 1])
      }
    })
  }
  accounts.refillAmount = refillAmount
  accounts.refillDelay = refillDelay
  curve.X0 = X0
  curve.A2 = A2
}
