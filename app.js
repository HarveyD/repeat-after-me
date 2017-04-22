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
const GROWTH_SPEED = 1;
var ButtonType;
(function (ButtonType) {
    ButtonType[ButtonType["Red"] = 0] = "Red";
    ButtonType[ButtonType["Green"] = 1] = "Green";
    ButtonType[ButtonType["Blue"] = 2] = "Blue";
    ButtonType[ButtonType["Yellow"] = 3] = "Yellow";
})(ButtonType || (ButtonType = {}));
var seq;
function setup() {
    canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.addEventListener('click', getPosition, false);
    ctx = canvas.getContext("2d");
    var b1 = new Button(ButtonType.Red, [248, 19, 1], width / 4, height / 4);
    var b2 = new Button(ButtonType.Green, [5, 229, 1], width / 4, height / 1.5);
    var b3 = new Button(ButtonType.Blue, [17, 65, 255], width / 2, height / 1.5);
    var b4 = new Button(ButtonType.Yellow, [250, 227, 1], width / 2, height / 4);
    seq = new Sequence([b1, b2, b3, b4]);
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
    for (let b of seq.buttons) {
        b.draw();
    }
    ;
}
class Button {
    constructor(id, colour, x, y) {
        this.baseRadius = width / 8;
        this.currentRadius = width / 8;
        this.draw = () => {
            this.grow();
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentRadius, 0, 2 * Math.PI);
            ctx.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`;
            ctx.fill();
            ctx.restore();
        };
        this.grow = () => {
            //Grow and shrink circle
            if (this.activated) {
                this.currentRadius += GROWTH_SPEED;
                if (this.currentRadius >= this.baseRadius + GROWTH_AMOUNT) {
                    this.activated = false;
                }
            }
            else {
                if (this.currentRadius >= this.baseRadius) {
                    this.currentRadius -= GROWTH_SPEED;
                }
            }
            //Play assigned sound.
        };
        this.checkClick = (x, y) => {
            let dist = Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
            if (dist <= this.currentRadius && !this.activated) {
                this.activated = true;
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
    constructor(buttons) {
        this.order = [];
        this.inReplay = true;
        this.position = 0;
        this.buttons = buttons;
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
                console.log("hi!");
                this.position = 0;
                this.inReplay = true;
                this.add();
            }
        }
        else {
            console.log("incorrect!");
        }
    }
    poll() {
        if (!this.inReplay) {
            return;
        }
        //Reached the end of the sequence, reset and add one more. Wait for user input.
        if (this.order[this.position] == null) {
            this.position = 0;
            this.inReplay = false;
            return;
        }
        if (this.currentButton == null || !this.currentButton.activated) {
            this.currentButton = this.buttons.find(b => b.id == this.order[this.position]);
            this.currentButton.activated = true;
            this.position += 1;
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
    for (let b of seq.buttons) {
        b.checkClick(x, y);
    }
    ;
}
window.onload = () => {
    setup();
};
