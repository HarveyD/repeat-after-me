declare var require : any;

export class Gameplay {
    public static readonly GROWTH_AMOUNT = 50;
    public static readonly GROWTH_SPEED = 4;
    public static readonly OPACITY_SPEED = 3;

    public static readonly MOB_WIDTH = 780;
    public static readonly BASE_RADIUS = window.innerWidth / 10;
    public static readonly BASE_RADIUS_MOB = window.innerWidth / 6;
}

export class Colours {
    public static readonly BACKGROUND_NORMAL = 'rgb(105, 105, 105)';
    public static readonly BACKGROUND_SUCCESS = 'rgb(0, 150, 0)';
    public static readonly BACKGROUND_FAILURE = 'rgb(150, 0, 0)';
}

export class Sounds {
   public static Correct = new Audio(require("../assets/correct.mp3"));
   public static Gameover = new Audio(require("../assets/gameover.mp3"));

   public static Red = new Audio(require("../assets/red.mp3"));
   public static Green = new Audio(require("../assets/green.mp3"));
   public static Blue =  new Audio(require("../assets/blue.mp3"));
   public static Yellow = new Audio(require("../assets/yellow.mp3"));
}

export enum ButtonType {
    Red = 0,
    Green,
    Blue,
    Yellow
}

export enum ButtonState {
    Growing = 0,
    Shrinking,
    Idle
}

export enum GameState {
    AwaitPlayer = 0,
    Replaying,
    Success,
    GameOver,
    Intro
}