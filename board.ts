import { Colours, Gameplay, Sounds, // Constants
         GameState, ButtonState, ButtonType // Enums
        } from './constants';

import Sequence from './sequence';
import Button from './button';

export default class Board {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private height: number = window.innerHeight;
    private width: number = window.innerWidth;

    private opacity: number = 100;
    private opacityInc: boolean = false;

    private textOpVal: number = 0;
    private textOpInc: boolean = true;

    public seq: Sequence = new Sequence();
    public buttonList: Button[];

    constructor() {
        this.canvas = <HTMLCanvasElement>document.getElementById('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.addEventListener('click', this.clickEvent, false);
        this.ctx = this.canvas.getContext("2d");

        var b1: Button = new Button(ButtonType.Red, [248, 19, 1], this.width/4, this.height/4, Sounds.Red);
        var b2: Button = new Button(ButtonType.Green, [5, 229, 1], this.width/4, (3*this.height)/4, Sounds.Green);
        var b3: Button = new Button(ButtonType.Blue, [17, 65, 255], (3 * this.width)/4, (3*this.height)/4, Sounds.Blue);
        var b4: Button = new Button(ButtonType.Yellow, [250, 227, 1], (3 * this.width)/4, this.height/4, Sounds.Yellow);
        
        this.buttonList = [b1, b2, b3, b4];
    }

    public render(): void {
        this.renderBackground();
        this.renderRoundNumber();
        this.renderButtons();
        this.seq.playback(this.buttonList);
    }

    private renderBackground(): void {
        if (this.seq.state == GameState.Success || this.seq.state == GameState.GameOver) {
            this.flash(this.seq.state);
        } else {
            this.ctx.fillStyle = Colours.BACKGROUND_NORMAL;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }

    private renderButtons(): void {
        this.buttonList.forEach(b => {
            b.resize();

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.currentRadius, 0, 2 * Math.PI);

            this.ctx.fillStyle = `rgb(${b.r}, ${b.g}, ${b.b})`;
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    private renderRoundNumber(): void {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Gotham, Helvetica Neue, sans-serif';
        this.ctx.fillText("Round: " + this.seq.order.length, 32, 64);  
    }

    private renderText(s: string): void{
        if (this.seq.state == GameState.GameOver) {
            this.renderText("Click anywhere to try again.");
        }

        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.textOpVal/100}`;
        this.ctx.font = (this.width/16)+'px Gotham, Helvetica Neue, sans-serif';
        this.ctx.fillText(s, this.width/8, this.height/2);

        this.textOpInc ? this.textOpVal += 2 : this.textOpVal -= 2;
        if(this.textOpVal >= 100){
            this.textOpInc = false
        }else if(this.textOpVal <= 0){
            this.textOpInc = true;
        }
    }

    private flash(gameState: GameState): void {
        this.ctx.globalAlpha = this.opacity/100;
        this.ctx.fillStyle = Colours.BACKGROUND_NORMAL;
        this.ctx.fillRect(0, 0, this.width, this.height);

        //Background
        this.ctx.globalAlpha = (100 - this.opacity)/100;
        if(gameState == GameState.Success){
            this.ctx.fillStyle = Colours.BACKGROUND_SUCCESS;
        }else{
            this.ctx.fillStyle = Colours.BACKGROUND_FAILURE;
        }
        this.ctx.fillRect(0, 0, this.width, this.height);

        if(this.opacityInc){
            this.opacity += Gameplay.OPACITY_SPEED;
        }else{
            this.opacity -= Gameplay.OPACITY_SPEED;
        }

        //Finished flashing, start replay.
        if (this.opacity > 100) {
            this.opacityInc = false;
            this.opacity = 100;
            this.seq.state = GameState.Replaying;
        } else if (this.opacity < 0) {
            // Colour screen red until player clicks to try again.
            if (gameState != GameState.GameOver) {
                this.opacityInc = true;
            }
        }

        //Reset the alpha
        this.ctx.globalAlpha = 1;
    }

    private clickEvent = (event: any): void => {
        //Reset Game
        if(this.seq.state == GameState.GameOver){
            this.reset();
            return;
        }

        var x = event.x;
        var y = event.y;

        x -= this.canvas.offsetLeft;
        y -= this.canvas.offsetTop;

        for (let b of this.buttonList) {
            if(b.checkClick(x, y) && this.seq.state == GameState.AwaitPlayer) {
                //Check if click matches next in sequence.
                this.seq.userGuess(b);
            };
        };
    }

    private reset(): void {
        this.opacity = 100;
        this.seq.order = [];
        this.seq.add();
        this.seq.state = GameState.Replaying;
    }
}