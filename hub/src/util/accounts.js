var helpers = require('./helpers')
var curve = require('./curve')

module.exports = {
  refillAmount: null,
  refillDelay: null,

  retrieveAccounts: function () {
    var actors = {}
    var dirs = helpers.readDir('./hub/data/actors')
    dirs.map(function (item, i) {
      if (item.endsWith('.txt')) {
        var actor = new Actor(item.replace('.txt', ''), './hub/data/actors/' + item)
        actors[actor.name] = actor
      }
    })
    return actors
  },

  actorStories: function () {
    var actorsStories = {}
    var dirs = helpers.readDir('./hub/data/actors')
    dirs.map(function (item, i) {
      var actorName = item.replace('.txt', '')
      var stories = helpers.readFile('./hub/data/actors/' + item)
      if (stories.indexOf('_') !== -1) {
        stories = stories.split('_')
        stories.map(function (item, i) {
          if (item.trim() !== '') {
            if (!actorsStories[actorName]) {
              actorsStories[actorName] = []
            }
            actorsStories[actorName].push(new ActorStory(item.trim()))
          }
        })
      }
    })
    return actorsStories
  },

  refill: function (account, blocks, accounts) {
    var events = accounts[account].events
    var event = {
      type: 'refill',
      block: blocks.block,
      amount: this.refillAmount
    }
    events.push(event)
    accounts[account].lastRefill = blocks.block
    accounts[account].events = events
  },

  refillAccounts: function (blocks, accounts) {
    for (var k in accounts) {
      this.refill(k, blocks, accounts)
    }
  },

  getBalance: function (account, accounts, blocks) {
    var totalBalance = 0
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

function Actor (name, file) {
  this.name = name
  this.file = file
  this.events = []
}

function ActorStory (story) {
  story = story.split('\n')
  this.loopTimer = parseInt(story[0])
  this.story = story[1]
}
