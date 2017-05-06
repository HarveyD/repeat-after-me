/*
    WEBPACK LOADS
*/
declare var require:any;
var styles = require('./app.css');

/*
    CANVAS VARIABLES
*/
var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;
var height: number = window.innerHeight;
var width: number = window.innerWidth;

/*
    CONSTANTS
*/
const GROWTH_AMOUNT = 50;
const GROWTH_SPEED = 4;
const BASE_RADIUS = width/12;

const OPACITY_SPEED = 3;

/*
    COLOURS
*/
const BACKGROUND_NORMAL = 'rgb(105, 105, 105)';
const BACKGROUND_SUCCESS = 'rgb(0, 150, 0)';
const BACKGROUND_FAILURE = 'rgb(150, 0, 0)';

enum ButtonType{
    Red = 0,
    Green,
    Blue,
    Yellow
}

enum ButtonState{
    Growing =0,
    Shrinking,
    Idle
}

enum GameState{
    AwaitPlayer=0,
    Replaying,
    Success,
    GameOver,
    Intro
}

var opacity: number = 100;
var opacityInc: boolean = false;

/*
    AUDIO
*/
var correct = new Audio(require("./correct.mp3"));
var gameover = new Audio(require("./gameover.mp3"));

var textOpVal: number = 0;
var textOpInc: boolean = true;

/* 
    Naughty Globals
*/
var seq: Sequence;
var buttonList: Button[];

function setup(){
    canvas = <HTMLCanvasElement>document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.addEventListener('click', clickEvent, false);
    ctx = canvas.getContext("2d");

    var b1: Button = new Button(ButtonType.Red, [248, 19, 1], width/4, height/4, new Audio(require("./blue.mp3")));
    var b2: Button = new Button(ButtonType.Green, [5, 229, 1], width/4, (3*height)/4, new Audio(require("./green.mp3")));
    var b3: Button = new Button(ButtonType.Blue, [17, 65, 255], (3*width)/4, (3*height)/4, new Audio(require("./blue.mp3")));
    var b4: Button = new Button(ButtonType.Yellow, [250, 227, 1], (3*width)/4, height/4, new Audio(require("./yellow.mp3")));

    buttonList = [b1, b2, b3, b4];
    seq = new Sequence();
    
    seq.add();

    gameLoop();
}

function gameLoop() {
    requestAnimationFrame(gameLoop);

    //Update height and width (responsive!)
    // width = window.innerWidth;
    // height = window.innerHeight;

    if(seq.state == GameState.Success || seq.state == GameState.GameOver){
        flash(seq.state);
    }else{
        ctx.fillStyle = BACKGROUND_NORMAL;
        ctx.fillRect(0, 0, width, height);
    }

    if(seq.state == GameState.GameOver){
        drawText("Click anywhere to try again.");
    }

    //Draw round number
    roundNumber();
    // Poll for kicking off next button in sequence
    seq.playback();
    //Render buttons
    for(let b of buttonList)
    {
        b.draw();
    };
}

function roundNumber(){
    ctx.fillStyle = 'white';
    ctx.font = '48px Gotham, Helvetica Neue, sans-serif';
    ctx.fillText("Round: " + seq.order.length, 32, 64);  
}

function drawText(s: string){
    ctx.fillStyle = `rgba(255, 255, 255, ${textOpVal/100}`;
    ctx.font = (width/16)+'px Gotham, Helvetica Neue, sans-serif';
    ctx.fillText(s, width/8, height/2);

    textOpInc ? textOpVal += 2 : textOpVal -= 2;
    if(textOpVal >= 100){
        textOpInc = false
    }else if(textOpVal <= 0){
        textOpInc = true;
    }
}

function flash(gameState: GameState){
    ctx.globalAlpha = opacity/100;
    ctx.fillStyle = BACKGROUND_NORMAL;
    ctx.fillRect(0, 0, width, height);

    //Background
    ctx.globalAlpha = (100-opacity)/100;
    if(gameState == GameState.Success){
        ctx.fillStyle = BACKGROUND_SUCCESS;
    }else{
        ctx.fillStyle = BACKGROUND_FAILURE;
    }
    ctx.fillRect(0, 0, width, height);

    if(opacityInc){
        opacity += OPACITY_SPEED;
    }else{
        opacity -= OPACITY_SPEED;
    }

    //Finished flashing, start replay.
    if(opacity > 100){
        opacityInc = false;
        opacity = 100;
        seq.state = GameState.Replaying;
    }else if(opacity < 0){
        // Colour screen red until player clicks to try again.
        if(gameState != GameState.GameOver){
            opacityInc = true;
        }
    }

    //Reset the alpha
    ctx.globalAlpha = 1;
}

class Button{
    id: ButtonType;

    x: number;
    y: number;

    r: number;
    g: number;
    b: number;

    state: ButtonState = ButtonState.Idle;
    sound: HTMLAudioElement;

    baseRadius: number = BASE_RADIUS;
    currentRadius: number = BASE_RADIUS;

    constructor(id: ButtonType, colour: number[], x: number, y: number, sound: HTMLAudioElement){
        this.id = id;
        this.r = colour[0];
        this.g = colour[1];
        this.b = colour[2];

        this.x = x;
        this.y = y;

        this.sound = sound;
    }

    public draw = () : void => {
        switch(this.state){
            case ButtonState.Growing:
                this.currentRadius += GROWTH_SPEED;
                if (this.currentRadius >= this.baseRadius + GROWTH_AMOUNT)
                    this.state = ButtonState.Shrinking
                break;
            case ButtonState.Shrinking:
                this.currentRadius -= GROWTH_SPEED;
                if (this.currentRadius <= this.baseRadius)
                    this.state = ButtonState.Idle
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
    }

    public checkClick = (x: number, y: number): void => {
        let dist = Math.sqrt((x-this.x)*(x-this.x) + (y-this.y)*(y-this.y));

        if(dist <= this.currentRadius && seq.state == GameState.AwaitPlayer && this.state == ButtonState.Idle){
            //Check if click matches next in sequence.
            seq.userGuess(this);
        }
    }

    public playAudio(){
        this.sound.play();
    }
}

class Sequence{
    order: ButtonType[] = []; 

    state: GameState = GameState.Replaying;
    position: number = 0;
    currentButton: Button; // Tracks the button being replayed

    constructor(){
    }

    public add(){
        let rand: number = Math.floor(Math.random()*4);
        this.order.push(rand);
    }

    public userGuess(b: Button){
        // Correct Selection
        if(this.order[this.position] == b.id){
            this.position += 1;
            b.state = ButtonState.Growing;
            b.playAudio();

            //If guessed all correctly.
            if(this.order[this.position] == null){
                this.position = 0;
                this.state = GameState.Success;
                this.add();
                correct.play();
            }
        //Incorrect selection
        }else{
            this.state = GameState.GameOver;
            gameover.play();
        }
    }

    public playback(){ 
        if(this.state != GameState.Replaying){
            return;
        }

        // Checks whether the end of the automated replay is done, then switch to waiting for player.
        if(this.order[this.position] == null){
            this.position = 0;
            this.state = GameState.AwaitPlayer;
            return;
        }

        // Automated replay of the buttons.
        if(this.currentButton == null || this.currentButton.state == ButtonState.Idle){
            this.currentButton = buttonList.find(b => b.id == this.order[this.position]);
            this.position += 1;
            this.currentButton.state = ButtonState.Growing;
            this.currentButton.playAudio();
        }
    }

    public reset(){
        opacity=100;
        this.order = [];
        this.add();
    }
}

function clickEvent(event: any)
{
    //Reset Game
    if(seq.state == GameState.GameOver){
        seq.reset();
        seq.state = GameState.Replaying;
    }

    var x = event.x;
    var y = event.y;

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    for(let b of buttonList)
    {
        b.checkClick(x, y);
    };
}

window.onload = () => {
    setup();
}