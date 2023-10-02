const hre = require('hardhat')

async function main() {
  const Exchange = await hre.ethers.getContractFactory('Exchange')
  const exchange = await Exchange.deploy("ZigZag", "6", "0xF4BBA1e2a5024a2754225b981e9A0DB7d2c33EE9")

  await exchange.deployed()
  await exchange.setFees(5, 10000, 0, 10000)

  console.log('Exchange deployed to:', exchange.address)
}

main()