var accounts = require('./src/util/accounts')
var transactions = require('./src/util/transactions')
var Blocks = require('./src/blocks')
var accountsHelpers = require('./src/util/accounts')
var curve = require('./src/util/curve')

function runSim(params) {
  accounts.refillAmount = params.refill;
  accounts.refillDelay = params.delay
  curve.X0 = params.lifetime
  curve.A2 = params.curve


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

  transactions.executeStory(blockTimer, accountPool, trackAccountsBalance)
  return accountsBalance;
}

exports.feedback = function (data) {
  return (data.lifetime && data.curve && data.refill && data.delay)?runSim(data):{};
}
