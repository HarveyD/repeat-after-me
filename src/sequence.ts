import Button from './button';
import { Sounds, GameState, ButtonState, ButtonType } from './constants';

export default class Sequence{
    public position: number = 0;
    public order: ButtonType[] = []; 

    public state: GameState = GameState.Replaying;
    public currentButton: Button;

    constructor () {}

    public add() {
        let rand: number = Math.floor(Math.random()*4);
        this.order.push(rand);
    }

    public userGuess(b: Button) {
        if(this.order[this.position] == b.id) {
            this.position += 1;
            b.select();

            //If guessed all correctly.
            if(this.order[this.position] == null){
                this.position = 0;
                this.state = GameState.Success;
                this.add();
                Sounds.Correct.play();
            }
        } else {
            this.state = GameState.GameOver;
            Sounds.Gameover.play();
        }
    }

    public playback(buttonList: Button[]) { 
        if(this.state != GameState.Replaying) {
            return;
        }

        // Checks whether the end of the automated replay is done, then switch to waiting for player.
        if (this.order[this.position] == null) {
            this.position = 0;
            this.state = GameState.AwaitPlayer;
            return;
        }

        // Automated replay of the buttons.
        if (this.currentButton == null || this.currentButton.state === ButtonState.Idle) {
            this.currentButton = buttonList.find(b => b.id === this.order[this.position]);
            this.position += 1;

            this.currentButton.select();
        }
    }
}