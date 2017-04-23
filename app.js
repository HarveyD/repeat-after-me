/*
    CANVAS VARIABLES
*/
var canvas;
var ctx;
var height = window.innerHeight;
var width = window.innerWidth;
/*
    CONSTANTS
*/
const GROWTH_AMOUNT = 50;
const GROWTH_SPEED = 4;
const BASE_RADIUS = width / 12;
var ButtonType;
(function (ButtonType) {
    ButtonType[ButtonType["Red"] = 0] = "Red";
    ButtonType[ButtonType["Green"] = 1] = "Green";
    ButtonType[ButtonType["Blue"] = 2] = "Blue";
    ButtonType[ButtonType["Yellow"] = 3] = "Yellow";
})(ButtonType || (ButtonType = {}));
var ButtonState;
(function (ButtonState) {
    ButtonState[ButtonState["Growing"] = 0] = "Growing";
    ButtonState[ButtonState["Shrinking"] = 1] = "Shrinking";
    ButtonState[ButtonState["Idle"] = 2] = "Idle";
})(ButtonState || (ButtonState = {}));
var GameState;
(function (GameState) {
    GameState[GameState["AwaitPlayer"] = 0] = "AwaitPlayer";
    GameState[GameState["Replaying"] = 1] = "Replaying";
    GameState[GameState["GameOver"] = 2] = "GameOver";
    GameState[GameState["Intro"] = 3] = "Intro";
})(GameState || (GameState = {}));
/*
    Naughty Globals
*/
var seq;
var buttonList;
function setup() {
    canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.addEventListener('click', getPosition, false);
    ctx = canvas.getContext("2d");
    var b1 = new Button(ButtonType.Red, [248, 19, 1], width / 4, height / 4);
    var b2 = new Button(ButtonType.Green, [5, 229, 1], width / 4, (3 * height) / 4);
    var b3 = new Button(ButtonType.Blue, [17, 65, 255], (3 * width) / 4, (3 * height) / 4);
    var b4 = new Button(ButtonType.Yellow, [250, 227, 1], (3 * width) / 4, height / 4);
    buttonList = [b1, b2, b3, b4];
    seq = new Sequence();
    seq.add();
    seq.add();
    seq.add();
    gameLoop();
}
function gameLoop() {
    requestAnimationFrame(gameLoop);
    //Update height and width (responsive!)
    width = window.innerWidth;
    height = window.innerHeight;
    //Background
    ctx.fillStyle = 'rgb(105, 105, 105)';
    ctx.fillRect(0, 0, width, height);
    seq.poll();
    //Render Buttons.
    for (let b of buttonList) {
        b.draw();
    }
    ;
}
class Button {
    constructor(id, colour, x, y) {
        this.state = ButtonState.Idle;
        this.baseRadius = BASE_RADIUS;
        this.currentRadius = BASE_RADIUS;
        this.draw = () => {
            switch (this.state) {
                case ButtonState.Growing:
                    this.currentRadius += GROWTH_SPEED;
                    if (this.currentRadius >= this.baseRadius + GROWTH_AMOUNT)
                        this.state = ButtonState.Shrinking;
                    break;
                case ButtonState.Shrinking:
                    this.currentRadius -= GROWTH_SPEED;
                    if (this.currentRadius <= this.baseRadius)
                        this.state = ButtonState.Idle;
                    break;
                default:
                    break;
            }
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentRadius, 0, 2 * Math.PI);
            ctx.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`;
            ctx.fill();
            ctx.restore();
        };
        this.checkClick = (x, y) => {
            let dist = Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
            if (dist <= this.currentRadius && this.state == ButtonState.Idle) {
                this.state = ButtonState.Growing;
                //Check if click matches next in sequence.
                seq.userGuess(this.id);
            }
        };
        this.id = id;
        this.r = colour[0];
        this.g = colour[1];
        this.b = colour[2];
        this.x = x;
        this.y = y;
    }
}
class Sequence {
    constructor() {
        this.order = [];
        this.state = GameState.Intro;
        this.position = 0;
    }
    add() {
        let rand = Math.floor(Math.random() * 4);
        this.order.push(ButtonType[ButtonType[rand]]);
    }
    userGuess(b) {
        if (this.order[this.position] == b) {
            console.log("correct!");
            this.position += 1;
            //If guessed all correctly.
            if (this.order[this.position] == null) {
                this.position = 0;
                this.state = GameState.Replaying;
                this.add();
            }
        }
        else {
            console.log("incorrect!");
        }
    }
    poll() {
        if (this.state == GameState.AwaitPlayer) {
            return;
        }
        //Reached the end of the sequence, reset and add one more. Wait for user input.
        if (this.order[this.position] == null) {
            this.position = 0;
            this.state = GameState.AwaitPlayer;
            return;
        }
        if (this.currentButton == null || this.currentButton.state == ButtonState.Idle) {
            this.currentButton = buttonList.find(b => b.id == this.order[this.position]);
            this.position += 1;
            this.currentButton.state = ButtonState.Growing;
        }
    }
    reset() {
        this.order = [];
    }
}
function getPosition(event) {
    var x = event.x;
    var y = event.y;
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    for (let b of buttonList) {
        b.checkClick(x, y);
    }
    ;
}
window.onload = () => {
    setup();
};
