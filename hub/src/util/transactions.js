var helpers = require('./helpers')
var accountsHelpers = require('./accounts')

module.exports = {
  executeBlankStory: function (blocks, incr, callback) {
    for (var k = 0; k < incr; k++) {
      blocks.incr()
      if (callback) {
        callback()
      }
    }
  },

  executeStory: function (blocks, accounts, callback) {
    var txs = helpers.readFile('./hub/data/transactions.txt')
    txs = txs.split('\n')
    var self = this
    txs.map(function (item, i) {
      self.executeItem(item, blocks, accounts, callback)
      callback(item)
    })
  },

  executeItem: function (item, blocks, accounts, callback) {
    if (item.indexOf('block') === 0) {
      var blocksToAdd = parseInt(item.split(';')[1])
      this.executeBlankStory(blocks, blocksToAdd, callback)
    } else if (item.indexOf('refill') === 0) {
      var account = item.split(';')[1]
      accountsHelpers.refill(account, blocks, accounts)
    } else if (item.indexOf('tx') === 0) {
      executeTransaction(item, blocks, accounts)
    }
  }
}

function executeTransaction (item, blocks, accounts) {
  item = item.split(';')
  var sender = item[1]
  var receiver = item[2]
  var amount = parseInt(item[3])
  accountsHelpers.add(receiver, amount, accounts, blocks)
  accountsHelpers.sub(sender, amount, accounts, blocks)
}
