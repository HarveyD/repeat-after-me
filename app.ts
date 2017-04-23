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
var correct = new Audio('./correct.mp3');
var gameover = new Audio('./gameover.mp3');

var textX: number = width;
var textVel: number = 0;
var textGo: boolean = true;

/* 
    Naughty Globals
*/
var seq: Sequence;
var buttonList: Button[];

function setup(){
    canvas = <HTMLCanvasElement>document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.addEventListener('click', getPosition, false);
    ctx = canvas.getContext("2d");

    var b1: Button = new Button(ButtonType.Red, [248, 19, 1], width/4, height/4);
    var b2: Button = new Button(ButtonType.Green, [5, 229, 1], width/4, (3*height)/4);
    var b3: Button = new Button(ButtonType.Blue, [17, 65, 255], (3*width)/4, (3*height)/4);
    var b4: Button = new Button(ButtonType.Yellow, [250, 227, 1], (3*width)/4, height/4);

    buttonList = [b1, b2, b3, b4];
    seq = new Sequence();
    
    seq.add();

    gameLoop();
}

function gameLoop() {
    requestAnimationFrame(gameLoop);

    //Update height and width (responsive!)
    width = window.innerWidth;
    height = window.innerHeight;

    if(seq.state == GameState.Success || seq.state == GameState.GameOver){
        flash(seq.state);
    }else{
        ctx.fillStyle = BACKGROUND_NORMAL;
        ctx.fillRect(0, 0, width, height);
    }

    if(seq.state == GameState.GameOver){
        ctx.fillStyle = 'black';
        ctx.font = "64px Arial";
        ctx.fillText("Click anywhere to try again.", textX, height/2);  

        textX -= textVel;
        if(textVel > 35 && textGo){
            textGo = false;
        }else if(textVel>0 && !textGo){
            textVel --;
        }

        if(textGo){
            textVel ++;
        }
    }

    seq.poll();

    //Render Buttons.
    for(let b of buttonList)
    {
        b.draw();
    };
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

    if(opacity > 100){
        opacityInc = false;
        opacity = 100;
        seq.state = GameState.Replaying;
    }else if(opacity < 0){
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

    baseRadius: number = BASE_RADIUS;
    currentRadius: number = BASE_RADIUS;

    constructor(id: ButtonType, colour: number[], x: number, y: number){
        this.id = id;
        this.r = colour[0];
        this.g = colour[1];
        this.b = colour[2];

        this.x = x;
        this.y = y;
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

        if(dist <= this.currentRadius && seq.state == GameState.AwaitPlayer){
            this.state = ButtonState.Growing;

            //Check if click matches next in sequence.
            seq.userGuess(this.id);
        }
    }
}

class Sequence{
    order: ButtonType[] = []; 

    state: GameState = GameState.Intro;
    position: number = 0;
    currentButton: Button;

    constructor(){
    }

    public add(){
        let rand = Math.floor(Math.random()*4);
        this.order.push(ButtonType[ButtonType[rand]]);
    }

    public userGuess(b: ButtonType){
        if(this.order[this.position] == b){
            this.position += 1;
            //If guessed all correctly.
            if(this.order[this.position] == null){
                this.position = 0;
                this.state = GameState.Success;
                this.add();
                correct.play();
            }
        }else{
            this.state = GameState.GameOver;
            gameover.play();
        }
    }

    public poll(){
        if(this.state == GameState.AwaitPlayer || this.state == GameState.Success || this.state == GameState.GameOver){
            return;
        }

        //Reached the end of the sequence, reset and add one more. Wait for user input.
        if(this.order[this.position] == null){
            this.position = 0;
            this.state = GameState.AwaitPlayer;
            return;
        }

        if(this.currentButton == null || this.currentButton.state == ButtonState.Idle){
            this.currentButton = buttonList.find(b => b.id == this.order[this.position]);
            this.position += 1;
            this.currentButton.state = ButtonState.Growing;
        }
    }

    public reset(){
        this.order = [];
    }
}

function getPosition(event)
{
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