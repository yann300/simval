var simulation = require('./src/main')

function runSim (params) {
  params.refillAmount = params.refill
  params.refillDelay = params.delay
  params.X0 = params.lifetime
  params.A2 = params.curve
  return simulation(params)
}

exports.feedback = function (data) {
  return (data.lifetime && data.curve && data.refill && data.delay) ? runSim(data) : {}
}
