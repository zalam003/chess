const ChessERC20 = artifacts.require("ChessERC20");
const ChessNFT = artifacts.require("ChessNFT");
// const ChessLogic = artifacts.require("ChessLogic");
const Elo = artifacts.require("Elo");
const ChessGame = artifacts.require("ChessGame");

module.exports = async function (deployer) {
	const serverAddress = "0x0E98e7fdBD94B632be4cbAb58a66deeb95b0596D";

	await deployer.deploy(ChessERC20);
	const chessERC20 = await ChessERC20.deployed();
	await deployer.deploy(
		ChessNFT,
		"https://gateway.ipfs.io/ipfs/",
		"/metadata.json"
	);
	const chessNFT = await ChessNFT.deployed();
	// await deployer.deploy(ChessLogic);
	// const chessLogic = await ChessLogic.deployed();
	await deployer.deploy(Elo);
	const elo = await Elo.deployed();
	await deployer.deploy(
		ChessGame,
		chessERC20.address,
		chessNFT.address,
		// chessLogic.address,
		elo.address,
		serverAddress
	);
	const chessGame = await ChessGame.deployed();

	// await chessERC20.changeMaster(chessGame.address);
	await chessNFT.changeMaster(chessGame.address);
	// await chessLogic.changeMaster(chessGame.address);
	await elo.changeMaster(chessGame.address);

	console.log("ChessGame address:    " + chessGame.address);
	console.log("ChessERC20 address:   " + chessERC20.address);
	console.log("ChessNFT address:     " + chessNFT.address);
	// console.log("ChessLogic address:   " + chessLogic.address);
	console.log("Elo address:          " + elo.address);
};
