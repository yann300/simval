var accounts = require('./util/accounts')
var transactions = require('./util/transactions')
var Blocks = require('./blocks')
var accountsHelpers = require('./util/accounts')
// var graph = require('./graph')
var curve = require('./util/curve')
var helpers = require('./util/helpers')

var params = getParameters()

// execute(params)

// graph.drawGraph(accountsBalance)

function getParameters () {
  var ret = {}
  ret.X0 = 20 // block time to 0
  ret.A2 = 0.20 // decreasing coeff
  ret.refillAmount = 500
  ret.refillDelay = 14
  if (process.argv.length > 2) {
    process.argv.map(function (item, i) {
      if (item === '-lifetime') {
        ret.X0 = parseInt(process.argv[i + 1])
      } else if (item === '-curve') {
        ret.A2 = parseFloat(process.argv[i + 1])
      } else if (item === '-refill') {
        ret.refillAmount = parseInt(process.argv[i + 1])
      } else if (item === '-delay') {
        ret.refillDelay = parseInt(process.argv[i + 1])
      }
    })
  }
  return ret
}

function execute (params) {
  helpers.log(JSON.stringify(params, null, '\t'))

  accounts.refillAmount = params.refillAmount
  accounts.refillDelay = params.refillDelay
  curve.X0 = params.X0
  curve.A2 = params.A2
  var blockTimer = new Blocks()
  var accountPool = accounts.retrieveAccounts()
  var actorsStories = accounts.actorStories()
  accounts.refillAccounts(blockTimer, accountPool)

  /* track accounts balances */
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

  /* block added event */
  blockTimer.blockAdded = function (block) {
    if (block % accounts.refillDelay === 0) {
      accounts.refillAccounts(blockTimer, accountPool)
    }

    for (var k in actorsStories) {
      actorsStories[k].map(function (item, i) {
        if (block % item.loopTimer === 0) {
          transactions.executeStoryFromBlock(blockTimer, accountPool, item.story)
        }
      })
    }

    trackAccountsBalance()
  }

  trackAccountsBalance()
  transactions.executeStoryFromFile(blockTimer, accountPool, './hub/data/transactions.txt')
  return accountsBalance
}

module.exports = execute
