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
    GameOver,
    Intro
}

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
    for(let b of buttonList)
    {
        b.draw();
    };
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

        if(dist <= this.currentRadius && this.state == ButtonState.Idle){
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
            console.log("correct!");

            this.position += 1;
            //If guessed all correctly.
            if(this.order[this.position] == null){
                this.position = 0;
                this.state = GameState.Replaying;
                this.add();
            }
        }else{
            console.log("incorrect!");
        }
    }

    public poll(){
        if(this.state == GameState.AwaitPlayer){
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