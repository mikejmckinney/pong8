import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 300;
  @type("uint8") score: number = 0;
  @type("string") sessionId: string = "";
}

export class Ball extends Schema {
  @type("number") x: number = 400;
  @type("number") y: number = 300;
  @type("number") velocityX: number = 0;
  @type("number") velocityY: number = 0;
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type(Ball) ball = new Ball();
  @type("string") status: string = "waiting";
  @type("string") winnerId: string = "";
}
