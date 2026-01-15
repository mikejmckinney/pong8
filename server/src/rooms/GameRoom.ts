import { Room, Client } from "@colyseus/core";
import { GameState, Player } from "../schemas/GameState";

export class GameRoom extends Room<GameState> {
  maxClients = 2;

  onCreate() {
    this.setState(new GameState());

    this.onMessage("input", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) {
        return;
      }

      const direction = message?.direction;
      if (direction === "UP" || direction === "DOWN" || direction === "STOP") {
        console.log(`Player ${client.sessionId} input: ${direction}`);
      }
    });
  }

  onJoin(client: Client) {
    console.log(`Player joined: ${client.sessionId}`);

    const player = new Player();
    player.sessionId = client.sessionId;
    const playerCount = this.state.players.size;
    player.x = playerCount === 0 ? 50 : 750;
    player.y = 300;

    this.state.players.set(client.sessionId, player);

    if (this.state.players.size === this.maxClients) {
      this.state.status = "playing";
      this.broadcast("gameStart", { message: "Game starting!" });
      this.lock();
    }
  }

  onLeave(client: Client) {
    console.log(`Player left: ${client.sessionId}`);
    this.state.players.delete(client.sessionId);

    if (this.state.status === "playing") {
      this.state.status = "finished";
      this.state.players.forEach((_, sessionId) => {
        this.state.winnerId = sessionId;
      });
    }
  }

  onDispose() {
    console.log("Room disposed");
  }
}
