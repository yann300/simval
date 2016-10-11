module.exports = {
  X0: null, // block time to 0
  A2: null, // decreasing coeff
  currentBalanceState: function (refillBlock, blocks) {
    var ret = blocks.block - refillBlock
    ret = 1 - Math.exp(this.A2 * (ret - this.X0))
    var div = (1 - Math.exp(-this.A2 * this.X0))
    ret = ret / div
    return ret < 0 ? 0 : ret
  }
}
