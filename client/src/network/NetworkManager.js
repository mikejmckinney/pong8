import { Client } from "colyseus.js";

export class NetworkManager {
  constructor() {
    this.client = null;
    this.room = null;
    this.sessionId = null;
  }

  async connect(serverUrl = "ws://localhost:3000") {
    this.client = new Client(serverUrl);

    try {
      this.room = await this.client.joinOrCreate("pong");
      this.sessionId = this.room.sessionId;

      console.log(`Joined room: ${this.room.roomId}`);
      console.log(`Session ID: ${this.sessionId}`);

      this.setupListeners();
      return this.room;
    } catch (error) {
      console.error("Failed to connect:", error);
      this.room = null;
      return null;
    }
  }

  setupListeners() {
    if (!this.room) {
      return;
    }

    this.room.onStateChange((state) => {
      console.log("State changed:", state);
    });

    this.room.onMessage("gameStart", (message) => {
      console.log("Game starting:", message);
    });

    this.room.onLeave((code) => {
      console.log("Left room with code:", code);
      this.room = null;
    });
  }

  sendInput(direction) {
    if (this.room) {
      this.room.send("input", { direction });
    }
  }

  disconnect() {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
  }

  isConnected() {
    return this.room !== null;
  }

  getLocalSessionId() {
    return this.sessionId;
  }

  getRoom() {
    return this.room;
  }
}

export const networkManager = new NetworkManager();
