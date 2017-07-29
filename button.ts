import { GameState, ButtonState, ButtonType } from './constants';
import { Colours, Gameplay } from './constants';

export default class Button {
    id: ButtonType;

    x: number;
    y: number;

    r: number;
    g: number;
    b: number;

    state: ButtonState = ButtonState.Idle;
    sound: HTMLAudioElement;

    baseRadius: number;
    currentRadius: number = Gameplay.BASE_RADIUS;

    constructor(id: ButtonType, colour: number[], x: number, y: number, sound: HTMLAudioElement){
        this.id = id;
        this.r = colour[0];
        this.g = colour[1];
        this.b = colour[2];

        this.x = x;
        this.y = y;

        this.sound = sound;

        this.baseRadius = Gameplay.BASE_RADIUS;
        this.currentRadius = Gameplay.BASE_RADIUS;

        console.log(window.innerWidth);
        // Need to make the circles bigger on mobile
        if(window.innerWidth <= 1000){
            this.currentRadius = Gameplay.BASE_RADIUS_MOB;
            this.baseRadius = Gameplay.BASE_RADIUS_MOB;
        }
    }

    public resize() : void {
        switch(this.state){
            case ButtonState.Growing:
                this.currentRadius += Gameplay.GROWTH_SPEED;
                if (this.currentRadius >= this.baseRadius + Gameplay.GROWTH_AMOUNT){
                    this.state = ButtonState.Shrinking
                }
                break;
            case ButtonState.Shrinking:
                this.currentRadius -= Gameplay.GROWTH_SPEED;
                if (this.currentRadius <= this.baseRadius){
                    this.state = ButtonState.Idle
                }
                break;
            default:
                break;
        }
    }

    public checkClick (x: number, y: number): boolean {
        let dist = Math.sqrt((x-this.x)*(x-this.x) + (y-this.y)*(y-this.y));

        if (dist <= this.currentRadius  && this.state == ButtonState.Idle) {
            return true;
        }

        return false;
    }

    public select() {
        this.state = ButtonState.Growing;
        this.sound.play();
    }
}