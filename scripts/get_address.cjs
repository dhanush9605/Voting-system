const { ethers } = require("ethers");
const privateKey = "253384de2747313007839e7870faa306cb4e3ef0816831a13809fc1064a2da52";
const wallet = new ethers.Wallet(privateKey);
console.log("Wallet Address:", wallet.address);
