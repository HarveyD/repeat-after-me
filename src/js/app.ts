/* WEBPACK LOADER */
declare var require: any;
var styles = require('../css/app.css');

import Board from './board';

var board: Board;

function setup() {
	board = new Board();
	board.seq.add();

	gameLoop();
}

function gameLoop() {
	requestAnimationFrame(gameLoop);

	board.render();
}

window.onload = () => {
	setup();
}