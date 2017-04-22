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
const GROWTH_SPEED = 1;

enum ButtonType{
    Red = 0,
    Green,
    Blue,
    Yellow
}

var seq: Sequence;

function setup(){
    canvas = <HTMLCanvasElement>document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.addEventListener('click', getPosition, false);
    ctx = canvas.getContext("2d");

    var b1: Button = new Button(ButtonType.Red, [248, 19, 1], width/4, height/4);
    var b2: Button = new Button(ButtonType.Green, [5, 229, 1], width/4, height/1.5);
    var b3: Button = new Button(ButtonType.Blue, [17, 65, 255], width/2, height/1.5);
    var b4: Button = new Button(ButtonType.Yellow, [250, 227, 1], width/2, height/4);

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
    for(let b of seq.buttons)
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

    activated: boolean;

    baseRadius: number = width/8;
    currentRadius: number = width/8;

    constructor(id: ButtonType, colour: number[], x: number, y: number){
        this.id = id;
        this.r = colour[0];
        this.g = colour[1];
        this.b = colour[2];

        this.x = x;
        this.y = y;
    }

    public draw = () : void => {
        this.grow();

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius, 0, 2 * Math.PI);

        ctx.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`;
        ctx.fill();
        ctx.restore();
    }

    private grow = () : void => {
        //Grow and shrink circle
        if(this.activated){
            this.currentRadius += GROWTH_SPEED;
            if(this.currentRadius >= this.baseRadius + GROWTH_AMOUNT){
                this.activated = false;
            }
        }else{
            if(this.currentRadius >= this.baseRadius){
                this.currentRadius -= GROWTH_SPEED;
            }
        }

        //Play assigned sound.
    }

    public checkClick = (x: number, y: number): void => {
        let dist = Math.sqrt((x-this.x)*(x-this.x) + (y-this.y)*(y-this.y));

        if(dist <= this.currentRadius && !this.activated){
            this.activated = true;

            //Check if click matches next in sequence.
            seq.userGuess(this.id);
        }
    }
}

class Sequence{
    buttons: Button[];
    order: ButtonType[] = []; 

    inReplay: boolean = true;
    position: number = 0;
    currentButton: Button;

    constructor(buttons: Button[]){
        this.buttons = buttons;
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
                console.log("hi!");
                this.position = 0;
                this.inReplay = true;
                this.add();
            }
        }else{
            console.log("incorrect!");
        }
    }

    public poll(){
        if(!this.inReplay){
            return;
        }

        //Reached the end of the sequence, reset and add one more. Wait for user input.
        if(this.order[this.position] == null){
            this.position = 0;
            this.inReplay = false;
            return;
        }

        if(this.currentButton == null || !this.currentButton.activated){
            this.currentButton = this.buttons.find(b => b.id == this.order[this.position]);
            this.currentButton.activated = true;
            this.position += 1;
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

    for(let b of seq.buttons)
    {
        b.checkClick(x, y);
    };
}

window.onload = () => {
    setup();
}