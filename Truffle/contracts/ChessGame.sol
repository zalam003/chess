//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "./interfaces/IChessNFT.sol";
import "./interfaces/IElo.sol";

contract ChessGame is ERC20, Ownable {
	address private _serverAddress;

	modifier onlyServer() {
		require(_serverAddress == msg.sender, "Function only for Core contract!");
		_;
	}

	function changeServer(address newMaster) public onlyOwner {
		_serverAddress = newMaster;
	}

	IERC20 public chessToken;
	IChessNFT public chessNFT;
	IElo public elo;

	struct Game {
		address white;
		address black;
		uint8 outcome; // 0: no game,1:running, 2:draw, 3:white win, 4:black win
		uint256 nft;
	}

	mapping(uint256 => Game) games;
	uint256 bet;
	uint256 fee;
	uint256 NFTfee;

	event StakedBalance(address indexed player, uint256 amount);

	event GameStarted(
		uint256 indexed gameId,
		address indexed white,
		address indexed black
	);

	event GameEnded(
		uint256 indexed gameId,
		address indexed white,
		address indexed black,
		uint8 outcome,
		uint256 eloW,
		uint256 eloB
	);

	constructor(
		address _chessToken,
		address _chessNFT,
		address _elo,
		address serverAddress
	) ERC20("Staked Ghoda", "sGHODA") {
		chessToken = IERC20(_chessToken);
		chessNFT = IChessNFT(_chessNFT);
		_serverAddress = serverAddress;
		elo = IElo(_elo);
		bet = 10**19;
		fee = 10**18;
		NFTfee = 5 * 10**18;
	}

	function getBetAmount() public view returns (uint256) {
		return bet;
	}

	function changeBet(uint256 _bet) public onlyOwner {
		bet = _bet;
	}

	function changeFee(uint256 _fee) public onlyOwner {
		fee = _fee;
	}

	function changeNFTFee(uint256 _fee) public onlyOwner {
		NFTfee = _fee;
	}

	// function getStakedBalance(address _player) public view returns (uint256) {
	// 	return stakedBalance[_player];
	// }

	function stake(uint256 _amount) external {
		require(
			chessToken.transferFrom(msg.sender, address(this), _amount),
			"Not enough tokens"
		);
		_mint(msg.sender, _amount);
	}

	function unstake(uint256 _amount) external {
		_burn(msg.sender, _amount);
		require(chessToken.transfer(msg.sender, _amount), "Not enough tokens");
	}

	// function createGame

	function startGame(
		uint256 _gameId,
		address _white,
		address _black
	) public onlyServer {
		// Check and reduce staked balance
		require(games[_gameId].outcome == 0, "Game already started");

		_burn(_white, bet);
		_burn(_black, bet);

		games[_gameId] = Game(_white, _black, 1, 0);
		emit GameStarted(_gameId, _white, _black);
	}

	function endGame(
		uint256 _gameId,
		uint8 _outcome,
		uint256 _nftId
	) public onlyServer {
		Game memory game = games[_gameId];
		require(
			game.outcome == 1 && _outcome > game.outcome && _outcome < 5,
			"Game not started or already ended"
		);
		games[_gameId].outcome = _outcome;

		(uint256 eloW, uint256 eloB) = elo.recordResult(
			game.white,
			game.black,
			_outcome
		);
		emit GameEnded(_gameId, game.white, game.black, _outcome, eloW, eloB);

		address winner;
		if (_outcome == 2) {
			uint256 amount = bet - (fee / 2);
			_mint(game.white, amount);
			_mint(game.black, amount);
			return;
		}
		if (_outcome == 3) {
			winner = game.white;
		} else if (_outcome == 4) {
			winner = game.black;
		}
		if (_nftId != 0 && _outcome > 2) {
			// if black or white wins and claims NFT
			games[_gameId].nft = _nftId;
			chessNFT.mint(winner, uint256(_nftId), 1, "");
			_mint(winner, bet + bet - fee - NFTfee);
		} else _mint(winner, bet + bet - fee);
	}
}
