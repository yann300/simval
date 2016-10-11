var helpers = require('./helpers')
var curve = require('./curve')

module.exports = {
  refillAmount: null,
  refillDelay: null,

  refill: function (account, blocks, accounts) {
    var events = accounts[account].events
    if (events.length === 0 || blocks.block - accounts[account].lastRefill > this.refillDelay) {
      var event = {
        type: 'refill',
        block: blocks.block,
        amount: this.refillAmount
      }
      events.push(event)
      accounts[account].lastRefill = blocks.block
      accounts[account].events = events
    }
  },

  retrieveAllAccounts: function () {
    var accounts = {}
    var txs = helpers.readFile('./hub/data/transactions.txt')
    txs = txs.split('\n')
    txs.map(function (item, i) {
      if (item.indexOf('tx') === 0 || item.indexOf('refill') === 0) {
        item = item.split(';')
        if (item[1]) {
          accounts[item[1]] = {events: []}
        }
        if (item[2]) {
          accounts[item[2]] = {events: []}
        }
      }
    })
    return accounts
  },

  refillAccounts: function (blocks, accounts) {
    for (var k in accounts) {
      this.refill(k, blocks, accounts)
    }
  },

  getBalance: function (account, accounts, blocks) {
    var totalBalance = 0
    // console.log('block ' + blocks.block + ' ' + account)
    accounts[account].events.map(function (item, i) {
      if (item.type === 'refill' || item.type === 'add') {
        var decrea = curve.currentBalanceState(item.block, blocks)
        totalBalance += decrea * item.amount
      } else if (item.type === 'sub') {
        if (totalBalance > 0) {
          totalBalance -= item.amount
        }
      }
    })
    return totalBalance > 0 ? totalBalance : 0
  },

  listBalance: function (accountPool, blockTimer) {
    var accountsBalance = {}
    for (var k in accountPool) {
      var balance = this.getBalance(k, accountPool, blockTimer)
      accountsBalance[k] = balance
    }
    return accountsBalance
  },

  add: function (account, amount, accounts, blocks) {
    var event = {
      type: 'add',
      block: blocks.block,
      amount: amount
    }
    accounts[account].events.push(event)
  },

  sub: function (account, amount, accounts, blocks) {
    var event = {
      type: 'sub',
      block: blocks.block,
      amount: amount
    }
    accounts[account].events.push(event)
  }
}
