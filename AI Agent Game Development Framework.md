# **Architecting Cognitive Continuity: A Modular, File-Based Context System for Autonomous Game Development Agents**

## **1\. Introduction: The Agentic Context Challenge**

The deployment of Large Language Models (LLMs) in complex software engineering tasks—specifically the end-to-end construction of full-stack applications like a multiplayer game—presents a unique set of cognitive architectures challenges. Unlike human developers, who possess an innate, persistent working memory and a biographical memory of project decisions, current AI agents are fundamentally stateless. Their "intelligence" is confined to the immediate context window of the inference cycle. When an agent attempts to span the breadth of a game development project, which encompasses disparate domains such as visual design, network physics, audio engineering, and mobile responsiveness, it encounters a phenomenon known as "Context Drift." This drift occurs when the sheer volume of information dilutes the model's attention, leading to hallucinations, architectural inconsistencies, and the loss of the original product vision.1  
To overcome these limitations, the role of the software architect must evolve from merely defining code structures to defining **Context Structures**. This report proposes a rigorous, file-based prompt system designed to serve as an externalized "neocortex" for an AI agent tasked with building a mobile-optimized, retro-style Pong game. By leveraging the filesystem as a structured, deterministic memory layer—rather than relying solely on probabilistic vector retrieval (RAG)—we can ensure that the agent maintains "Cognitive Continuity" throughout the lifecycle of the project.3  
The proposed architecture utilizes a modular prompting strategy where domain-specific constraints (e.g., specific hexadecimal color values for a Synthwave aesthetic or TypeScript schemas for authoritative server logic) are sequestered into discrete files. These files are loaded dynamically into the agent's context window only when relevant to the active task, thereby maximizing token efficiency and adherence to strict technical standards.5 This system is instantiated within a GitHub repository structure that integrates the Phaser 3 game engine for the client 7 and the Colyseus framework for authoritative server-side physics 8, ensuring that the AI's output is not only syntactically correct but architecturally sound and mobile-resilient.

## ---

**2\. Theoretical Framework of Context Engineering**

Before detailing the specific implementation of the Pong agent, it is necessary to establish the theoretical underpinnings of the chosen context architecture. "Context Engineering" is distinct from "Prompt Engineering" in that it treats the interaction not as a series of isolated queries, but as a systems engineering problem where information flow is the primary variable to be optimized.2

### **2.1 The Filesystem as Deterministic Long-Term Memory**

In the landscape of AI memory systems, two dominant paradigms exist: Embedding-based Retrieval (RAG) and File-based Retrieval. RAG systems chunk text and store it in vector databases, retrieving snippets based on semantic similarity. While effective for open-ended queries, RAG often fails in software engineering contexts where precision is paramount. For example, retrieving a "semantically similar" but outdated configuration file can lead to catastrophic build failures.  
Conversely, a file-based memory system—conceptually similar to the *Zettelkasten* method of knowledge management—relies on explicit, structured linking of atomic information nodes.3 In this paradigm, the repository structure itself becomes the cognitive map. Research indicates that agents operating within a structured filesystem can leverage standard Unix tools (like grep, cat, and ls) to explore their environment and retrieve "canonical knowledge" with 100% precision, avoiding the "fuzzy" recall of vector embeddings.11  
For the Pong project, we treat the .context directory in the repository root as the agent's "Hard Drive." This directory contains not just documentation, but the "Living State" of the project. This aligns with findings from *Manus* and *Cursor* implementations, which suggest that file-based context allows for unlimited persistent memory that is directly operable by the agent, bridging the gap between stateless inference and stateful project evolution.13

### **2.2 Modular Prompting and Attention Management**

The "Attention Mechanism" in Transformer models allows them to focus on relevant parts of the input sequence, but this capacity is finite. "Context Dumping"—the practice of pasting the entire project specification into the system prompt—leads to "Attention Dilution," where the model ignores critical constraints buried in the middle of the prompt.1  
To mitigate this, the proposed system employs **Modular Prompting**. We segment the project's constraints into distinct domains: User Interface (UI), Networking (Net), Audio (Sfx), and Testing (QA). The agent is governed by a "Master Switch" protocol (defined in a root rule file) that instructs it to read *only* the specific domain file required for the current task. This ensures that when the agent is writing the physics code for the ball, its context window is not cluttered with instructions about the hex codes for the menu buttons, thereby dedicating maximum cognitive resources to the logic at hand.5

## ---

**3\. The Repository Architecture: A Cognitive Map**

The directory structure of the project is designed to be self-documenting, providing the agent with strong signals about the purpose and relationship of each file. This spatial organization aids the agent in inferring architectural boundaries (e.g., keeping client and server code distinct) without needing explicit correction.12

### **3.1 The Root Directory Tree**

The repository, named pong-agentic-core, is divided into four primary zones: The Brain (.context), The Client (client), The Server (server), and The Pipeline (.github).  
**Table 1: Repository Directory Functionality**

| Directory | Sub-Path | Purpose & Cognitive Signal |
| :---- | :---- | :---- |
| **.context/** | rules/ | **Read-Only Constraints.** Contains the immutable laws of the project (e.g., style guides, tech stack limits). |
|  | memory/ | **Read-Write Logs.** Stores the history of architectural decisions (ADRs) and session summaries. |
|  | state/ | **Volatile Scratchpad.** Holds the active\_task.md, which acts as the "handoff" baton between sessions. |
| **client/** | src/ | **Phaser 3 Application.** Contains all visual and input logic. Strictly separated from server logic. |
| **server/** | src/ | **Colyseus Application.** Contains the authoritative physics simulation and room management. |
| **shared/** | types/ | **Contract Definitions.** TypeScript interfaces shared between client and server to prevent type mismatch. |
| **.github/** | workflows/ | **Automated Feedback.** CI pipelines that act as the "eyes" of the agent, reporting test results. |

### **3.2 The .context Directory: The Agent's Brain**

This directory is the most critical component of the prompt system. It is the only directory that the agent is instructed to explore immediately upon instantiation. It contains the modular prompt files that drive the development process.

#### **3.2.1 The Master Rule File (.cursorrules / \_master.md)**

This file acts as the "Operating System" for the agent. It is automatically loaded by the IDE (in the case of Cursor) or injected as the system prompt. Its primary function is to enforce the **"Read-First, Act-Second"** protocol.  
Excerpt from \_master.md:  
"You are an expert Game Engineer specializing in Phaser 3 and Colyseus. You are stateless. Your memory is the .context folder.  
Protocol:

1. **Initialize:** Read .context/state/active\_task.md to understand the current phase and immediate goal.  
2. **Load Constraints:** Identify the active domain (UI, Network, Audio) and read the corresponding Rule File in .context/rules/domain\_\*.md.  
3. **Plan:** Create a step-by-step implementation plan in the chat before writing code.  
4. **Implement:** Write code in atomic, testable blocks.  
5. **Persist:** At the end of your response, update .context/state/active\_task.md with your progress and next steps.".13

#### **3.2.2 Domain-Specific Rule Files**

These files serve as "Skill Cartridges" that the agent loads to gain domain expertise.

* **rules/domain\_ui.md:** Contains the Synthwave aesthetic guide (Colors, Fonts) and Mobile Scaling constraints.  
* **rules/domain\_net.md:** Contains the Authoritative Server logic, Schema definitions, and Lag Compensation algorithms.  
* **rules/domain\_audio.md:** Contains guidelines for audio sprites and mobile-browser compatibility handling.  
* **rules/domain\_qa.md:** Contains the testing framework setup (Jest \+ Headless Phaser) and debugging protocols.

## ---

**4\. Domain-Specific Architecture: The Client (Phaser 3\)**

The choice of Phaser 3 for the client is driven by its mature handling of the HTML5 Canvas and WebGL contexts, which is crucial for mobile performance.7 However, default Phaser implementations often struggle with responsive design. The agent's context must rigorously enforce specific configurations to meet the "Mobile-Optimized" requirement.

### **4.1 Mobile Scaling and Viewport Management**

A common pitfall in web game development is the misuse of scaling modes, leading to stretched assets or UI elements that fall off-screen on different aspect ratios (e.g., iPhone vs. iPad). To address this, the domain\_ui.md prompt file explicitly mandates the use of the FIT scale mode.  
The Phaser.Scale.FIT mode ensures that the canvas creates the largest possible rendering area that fits within the parent container while maintaining the defined aspect ratio.16 This is superior to ENVELOP for a competitive game like Pong, as ENVELOP would crop the play area on certain screens, potentially hiding the paddle or ball and creating an unfair disadvantage.  
Furthermore, the prompt system instructs the agent to avoid hardcoded pixel coordinates (e.g., x: 400). Instead, the agent is constrained to use relative positioning based on the camera viewport (e.g., this.cameras.main.width \* 0.5). This ensures that UI elements such as the score display and "Press Start" text remain centered regardless of the device's physical resolution.18

### **4.2 Touch Input and Control Schemes**

Translating the precise control of a physical paddle to a touch screen is non-trivial. The "Virtual D-Pad" overlay often obscures the gameplay area, which is unacceptable for a fast-paced game. The domain\_ui.md file defines a "Split-Screen Invisible Touch" scheme.19

* **Mechanism:** The screen is conceptually divided into two halves.  
  * **Tap Left Half:** Moves the paddle UP.  
  * **Tap Right Half:** Moves the paddle DOWN.  
* **Multi-Touch:** The agent is instructed to use this.input.addPointer(2) to support multi-touch, preventing the input locking if a player inadvertently touches the screen with a second finger.19

### **4.3 The "Synthwave" Aesthetic Implementation**

To fulfill the "Retro Pong" requirement with a modern twist, the context files enforce a "Synthwave" visual style. This is not merely a suggestion but a strict hex-code specification derived from color theory research.21  
**Table 2: Synthwave Visual Specification (from domain\_ui.md)**

| Element | Hex Code | Visual Effect | Implementation Note |
| :---- | :---- | :---- | :---- |
| **Background** | \#090D40 | Deep Void Blue | Base canvas color. |
| **Grid Lines** | \#2b2b2b | Perspective Scroll | Custom shader or tiled sprite moving vertically. |
| **Player 1** | \#FF005C | Neon Pink | Must use PostFX Bloom pipeline (strength 2.0). |
| **Player 2** | \#00C4FF | Cyber Cyan | Must use PostFX Bloom pipeline (strength 2.0). |
| **Ball** | \#FFFFFF | White Core | Particle emitter trail matching the last-hit paddle color. |
| **Typography** | N/A | "Press Start 2P" | Google Font loaded via WebFontLoader.23 |

The domain\_ui.md file also includes instructions for implementing a "CRT Scanline" post-processing effect if the device detects WebGL support, degrading gracefully to simple sprites on Canvas-only devices.7

## ---

**5\. Domain-Specific Architecture: The Server (Colyseus)**

Building a real-time multiplayer game requires a robust networking architecture. While simpler libraries like Socket.io exist, they place the burden of state synchronization entirely on the developer (and thus, the AI agent), increasing the risk of bugs. This project utilizes **Colyseus** because it offers a declarative State Schema, which aligns perfectly with the structured nature of AI code generation.8

### **5.1 The Authoritative Server Model**

The most critical architectural decision encoded in the domain\_net.md file is the concept of **Server Authority**. In peer-to-peer (P2P) architectures, clients trust each other's reported positions, which opens the door to cheating and desynchronization. In an authoritative model, the server runs the actual physics simulation, and clients act as "dumb terminals" that render the state.26  
The prompt instructs the agent to implement the following loop:

1. **Input Transmission:** The client does *not* send the paddle's position. It sends the *intent* (e.g., { "input": "UP" }).  
2. **Server Simulation:** The server receives the input and applies velocity to the player's entity in the server-side physics loop (running at 60Hz).  
3. **State Broadcast:** The server updates the GameState schema (e.g., ball.x, player1.y). Colyseus automatically calculates the delta (difference) since the last frame and sends minimal binary packets to the clients.  
4. **Client Rendering:** The client receives the update and renders the entities.

### **5.2 Schema Definition and Type Safety**

One of the primary advantages of Colyseus for AI agents is its use of TypeScript-based Schemas. By defining the game state as a strongly-typed class, the agent is less likely to hallucinate invalid property names during development.28  
The domain\_net.md file provides a template for the schema:

TypeScript

import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {  
    @type("number") x: number;  
    @type("number") y: number;  
    @type("uint8") score: number;  
}

export class GameState extends Schema {  
    @type({ map: Player }) players \= new MapSchema\<Player\>();  
    @type("number") ballX: number;  
    @type("number") ballY: number;  
}

This declarative structure ensures that the data contract between client and server is rigid and enforceable at compile time.

### **5.3 Lag Compensation: Prediction and Interpolation**

Network latency is unavoidable. If the client waits for the server to confirm movement, the controls will feel sluggish. To ensure the "Retro" feel of instant responsiveness, the agent must implement **Client-Side Prediction** and **Entity Interpolation**.30  
The domain\_net.md file details the specific logic:

* **Prediction (Local Player):** When the user taps "UP", the client *immediately* moves the local paddle sprite. It simultaneously sends the command to the server. When the server update arrives, the client compares the predicted position with the server's authoritative position. If the difference is negligible, it ignores the server. If the difference is significant (reconciliation), it snaps the paddle to the server's position.  
* **Interpolation (Remote Player & Ball):** Since we cannot predict the opponent's input, we buffer the server updates. The client renders the remote paddle slightly in the past, smoothly interpolating between the last two received server states using Phaser.Math.Linear. This eliminates "jitter" caused by packet variance.32

## ---

**6\. Phased Development Roadmap**

To prevent the agent from becoming overwhelmed by the complexity of the full project, the development is structured into four distinct phases. The roadmap.md file in the .context directory serves as the project manager, tracking completion. The agent is instructed to focus *only* on the current phase.

### **Phase 1: The Core Loop (Single Player Foundation)**

Goal: A working, local Pong game with no networking.  
Prompt Context: rules/domain\_ui.md, rules/tech\_phaser.md.  
Deliverables:

* Set up Phaser 3 with Webpack/Vite.  
* Implement Paddle and Ball classes with Arcade Physics.  
* Implement the Synthwave visual assets (grid, glow).  
* Implement Touch Input logic (split-screen zones).  
* **Validation:** The ball bounces correctly off walls and paddles; the game scales to mobile screens.

### **Phase 2: The Network Plumbing**

Goal: Establish the Client-Server connection and basic replication.  
Prompt Context: rules/domain\_net.md, rules/tech\_colyseus.md.  
Deliverables:

* Initialize the Colyseus Server (Node.js).  
* Define the GameState Schema (as per Section 5.2).  
* Implement Room joining logic.  
* Verify "Echo" functionality (Client input logs on Server).  
* **Validation:** Two browser windows can connect to the same room; connecting logs a "Player Joined" event.

### **Phase 3: The Authoritative Physics Integration**

Goal: Move the game logic to the server.  
Prompt Context: rules/domain\_net.md.  
Deliverables:

* Migrate physics collision logic from Phaser (Client) to Colyseus (Server).  
* Implement the Server Simulation Loop (fixed tick rate).  
* Implement Client-Side Prediction for the local paddle.  
* Implement Linear Interpolation for the remote entities.  
* **Validation:** Gameplay remains smooth under simulated network latency (using Chrome DevTools Network throttling).

### **Phase 4: Polish, Audio, and Deployment**

Goal: Production readiness.  
Prompt Context: rules/domain\_audio.md, rules/domain\_qa.md.  
Deliverables:

* Implement Audio Sprites (retro bleeps) with mobile unlock logic (handling "User Interaction" requirements for audio context).7  
* Add visual "Juice" (Screen shake on score, particle explosions).  
* Configure CI/CD pipelines.

## ---

**7\. Automated Quality Assurance Strategy**

A fundamental weakness of generative AI in software development is its inability to visually verify its output. It can write code that compiles but results in a blank screen. To close this feedback loop, we implement a **Headless Testing** strategy integrated into a CI/CD pipeline.

### **7.1 Headless Phaser Testing with Jest**

Standard Phaser games require a DOM (Document Object Model) and a Canvas element, which usually necessitates a browser environment. However, running a full browser (like Puppeteer) in a CI environment is heavy and slow.  
The solution is to run Phaser in **Headless Mode** using jest, jsdom, and node-canvas. The domain\_qa.md file instructs the agent to configure the test environment to mock the necessary browser APIs.33  
Test Scenario Example:  
To verify the physics engine without seeing it, the agent writes a test case that:

1. Initializes a Headless Scene.  
2. Spawns a Ball at (100, 100\) with velocity (10, 0).  
3. Calls the scene.update() method 60 times (simulating 1 second).  
4. Asserts that the Ball's new X position is approximately 100 \+ (10 \* 60).

This "Physics Proof" allows the agent to verify that the core game logic is functional before a human ever opens the browser.

### **7.2 The Self-Healing CI Pipeline**

The repository includes a GitHub Actions workflow (.github/workflows/ci-tests.yml) that triggers on every push.

1. **Build:** Compiles the TypeScript code.  
2. **Lint:** Checks for code style violations.  
3. **Test:** Runs the Headless Jest tests.

If the pipeline fails, the error logs are captured. The agent's workflow (defined in the master prompt) includes a "Self-Healing" protocol: if a task fails the CI check, the agent must read the error log, analyze the failure, and generate a fix *before* marking the task as complete in the active\_task.md file. This creates an autonomous feedback loop that dramatically increases code quality.35

### **7.3 Deployment Strategy**

The pipeline also handles deployment.

* **Client:** The client directory is built via Vite and deployed to GitHub Pages.  
* **Server:** The server directory is Dockerized. The Dockerfile (created by the agent via domain\_net.md instructions) exposes the WebSocket port. This container is deployed to a cloud provider capable of hosting persistent WebSocket connections (e.g., Railway, Fly.io, or Colyseus Cloud).37

## ---

**8\. Audio Engineering for Agents**

Audio is often an afterthought in AI-generated games, leading to poor performance or silence on mobile devices due to autoplay restrictions. The domain\_audio.md context file provides specific engineering guidelines to address this.

### **8.1 Audio Sprites and Mobile Latency**

Loading multiple individual .mp3 or .wav files triggers multiple HTTP requests, which creates latency on mobile networks. The prompt system instructs the agent to use **Audio Sprites**—a single audio file containing all sound effects (paddle hit, score, win, lose) combined with a JSON map of start/end times.7

### **8.2 Handling the Autoplay Policy**

Mobile browsers (iOS Safari and Chrome Android) block audio playback until the user interacts with the page (a tap or click). The agent is instructed to implement an "Unlock Audio" pattern:

* On the first touch interaction (e.g., tapping "Start Game"), play a silent, 0.1-second buffer from the audio sprite.  
* This action "warms up" the Web Audio API context, allowing subsequent sounds (like the ball hit) to play instantly without user interaction.

## ---

**9\. Conclusion**

The transition from human-led to agent-led software development requires a fundamental rethinking of how we structure project knowledge. The file-based context system proposed in this report—anchored by the .context directory and driven by modular, domain-specific prompt files—provides the necessary cognitive scaffolding for an AI agent to succeed.  
By treating the filesystem as a deterministic long-term memory, we solve the problems of context drift and hallucination. By integrating specific architectural constraints for Phaser 3 (Mobile FIT mode) and Colyseus (Authoritative Schemas), we ensure the resulting software is robust and performant. Finally, by wrapping the entire process in a self-healing CI/CD pipeline with headless testing, we grant the agent the ability to verify its own work. This architecture transforms the AI from a mere code generator into a capable, autonomous software engineer.

# ---

**Appendix A: Modular Prompt Templates**

The following templates represent the content of the .context/rules/ files. These are the "source code" for the agent's behavior.

## **A.1 rules/domain\_ui.md**

# **Domain Rules: UI & Graphics (Synthwave/Pong)**

## **Aesthetic Guidelines**

* **Style:** 1980s Retro Futurism / Synthwave.  
* **Colors:**  
  * Background: \#090D40 (Deep Blue)  
  * Grid Lines: \#2b2b2b (Perspective Scroll)  
  * Player 1: \#FF005C (Neon Pink) \+ Bloom  
  * Player 2: \#00C4FF (Cyber Cyan) \+ Bloom  
  * Ball: \#FFFFFF (White)  
* **Typography:** Use Google Font "Press Start 2P" for all HUD elements.  
* **Effects:** Use PostFX pipeline for Bloom/Glow on paddles and ball.

## **Mobile Responsiveness**

* **Scale Manager:** MUST use Phaser.Scale.FIT.  
* **Centering:** autoCenter: Phaser.Scale.CENTER\_BOTH.  
* **Positioning:** NEVER use hardcoded pixels. ALWAYS use relative positioning (e.g., width \* 0.5).  
* **Input:**  
  * Detect this.sys.game.device.os.desktop.  
  * If Mobile: Create two invisible touch zones (Left 50% / Right 50%).  
  * If Desktop: Map Arrow Keys.

## **A.2 rules/domain\_net.md**

# **Domain Rules: Networking (Colyseus)**

## **Architecture**

* **Pattern:** Authoritative Server.  
* **Protocol:** WebSockets via Colyseus.

## **Server Logic (Authoritative)**

* The server maintains the GameState schema.  
* Physics runs at 60 FPS (Simulation Loop).  
* Clients send KeyInput messages (UP, DOWN, STOP).  
* Server applies velocity.

## **Client Logic (Prediction)**

* **Schema:** Use MapSchema for players.  
* **Interpolation:** Use Phaser.Math.Linear for remote entities.  
* **Prediction:** Local player moves immediately on input. Reconcile if server\_pos deviates \> 5px.

## **A.3 rules/domain\_qa.md**

# **Domain Rules: Quality Assurance**

## **Testing Framework**

* **Tools:** Jest \+ JSDOM \+ Node-Canvas.  
* **Config:** Use testConfig with type: Phaser.HEADLESS.

## **Protocols**

* **Physics Proof:** Write tests that simulate 60 frames of updates to verify velocity and collision WITHOUT rendering.  
* **Self-Healing:** If CI fails, read test\_failures.log and refactor code immediately.

#### **Works cited**

1. Set up a context engineering flow in VS Code, accessed January 11, 2026, [https://code.visualstudio.com/docs/copilot/guides/context-engineering-guide](https://code.visualstudio.com/docs/copilot/guides/context-engineering-guide)  
2. The Architecture of Intelligence: Context Engineering for Multi-Agent Systems, accessed January 11, 2026, [https://medium.com/ai-simplified-in-plain-english/the-architecture-of-intelligence-context-engineering-for-multi-agent-systems-6e1825cc7b14](https://medium.com/ai-simplified-in-plain-english/the-architecture-of-intelligence-context-engineering-for-multi-agent-systems-6e1825cc7b14)  
3. A-Mem: Agentic Memory for LLM Agents \- arXiv, accessed January 11, 2026, [https://arxiv.org/html/2502.12110v11](https://arxiv.org/html/2502.12110v11)  
4. Show HN: A file-based agent memory framework that works like skill | Hacker News, accessed January 11, 2026, [https://news.ycombinator.com/item?id=46511540](https://news.ycombinator.com/item?id=46511540)  
5. Prompt Engineering for AI Agents \- PromptHub, accessed January 11, 2026, [https://www.prompthub.us/blog/prompt-engineering-for-ai-agents](https://www.prompthub.us/blog/prompt-engineering-for-ai-agents)  
6. Context Engineering: The New Backbone of Scalable AI Systems \- Qodo, accessed January 11, 2026, [https://www.qodo.ai/blog/context-engineering/](https://www.qodo.ai/blog/context-engineering/)  
7. How I optimized my Phaser 3 action game — in 2025 | by François \- Medium, accessed January 11, 2026, [https://franzeus.medium.com/how-i-optimized-my-phaser-3-action-game-in-2025-5a648753f62b](https://franzeus.medium.com/how-i-optimized-my-phaser-3-action-game-in-2025-5a648753f62b)  
8. Base MMORPG \- Node, MySQL, Colyseus, Parcel and Phaser 3, accessed January 11, 2026, [https://www.html5gamedevs.com/topic/40120-base-mmorpg-node-mysql-colyseus-parcel-and-phaser-3/](https://www.html5gamedevs.com/topic/40120-base-mmorpg-node-mysql-colyseus-parcel-and-phaser-3/)  
9. Agentic Context Engineering. Context is becoming increasingly…, accessed January 11, 2026, [https://cobusgreyling.medium.com/agentic-context-engineering-5021cc06751c](https://cobusgreyling.medium.com/agentic-context-engineering-5021cc06751c)  
10. A-MEM: Agentic Memory for LLM Agents \- arXiv, accessed January 11, 2026, [https://arxiv.org/pdf/2502.12110](https://arxiv.org/pdf/2502.12110)  
11. How to build agents with filesystems and bash \- Vercel, accessed January 11, 2026, [https://vercel.com/blog/how-to-build-agents-with-filesystems-and-bash](https://vercel.com/blog/how-to-build-agents-with-filesystems-and-bash)  
12. Effective context engineering for AI agents \- Anthropic, accessed January 11, 2026, [https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)  
13. PatrickJS/awesome-cursorrules: Configuration files that enhance Cursor AI editor experience with custom rules and behaviors \- GitHub, accessed January 11, 2026, [https://github.com/PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules)  
14. Context Engineering for AI Agents: Lessons from Building Manus, accessed January 11, 2026, [https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)  
15. Cursor Rules: Best Practices for Developers | by Ofer Shapira | Elementor Engineers, accessed January 11, 2026, [https://medium.com/elementor-engineers/cursor-rules-best-practices-for-developers-16a438a4935c](https://medium.com/elementor-engineers/cursor-rules-best-practices-for-developers-16a438a4935c)  
16. ScaleManager \- What is Phaser?, accessed January 11, 2026, [https://docs.phaser.io/api-documentation/class/scale-scalemanager](https://docs.phaser.io/api-documentation/class/scale-scalemanager)  
17. Phaser Dev Log 189, accessed January 11, 2026, [https://phaser.io/devlogs/189](https://phaser.io/devlogs/189)  
18. Scale manager \- Notes of Phaser 3 \- GitHub Pages, accessed January 11, 2026, [https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scalemanager/](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scalemanager/)  
19. Mobile touch controls \- Game development \- MDN Web Docs, accessed January 11, 2026, [https://developer.mozilla.org/en-US/docs/Games/Techniques/Control\_mechanisms/Mobile\_touch](https://developer.mozilla.org/en-US/docs/Games/Techniques/Control_mechanisms/Mobile_touch)  
20. Touch controls in Phaser 3 \- Reddit, accessed January 11, 2026, [https://www.reddit.com/r/phaser/comments/9mgypp/touch\_controls\_in\_phaser\_3/](https://www.reddit.com/r/phaser/comments/9mgypp/touch_controls_in_phaser_3/)  
21. Synthwave \- Setup Guide \- Nerd Or Die, accessed January 11, 2026, [https://nerdordie.com/setup-guides/synthwave-setup-guide/](https://nerdordie.com/setup-guides/synthwave-setup-guide/)  
22. Aesthetics Exploration: Synthwave, accessed January 11, 2026, [https://www.aesdes.org/2024/01/24/aesthetics-exploration-synthwave/](https://www.aesdes.org/2024/01/24/aesthetics-exploration-synthwave/)  
23. Press Start 2P \- Google Fonts, accessed January 11, 2026, [https://fonts.google.com/specimen/Press+Start+2P](https://fonts.google.com/specimen/Press+Start+2P)  
24. Press Start 2P Font Pairings (Google fonts) & Alternatives \- MaxiBestOf, accessed January 11, 2026, [https://maxibestof.one/typefaces/press-start-2p](https://maxibestof.one/typefaces/press-start-2p)  
25. What stack do you use for multiplayer games? : r/phaser \- Reddit, accessed January 11, 2026, [https://www.reddit.com/r/phaser/comments/1irf6u8/what\_stack\_do\_you\_use\_for\_multiplayer\_games/](https://www.reddit.com/r/phaser/comments/1irf6u8/what_stack_do_you_use_for_multiplayer_games/)  
26. Authoritative Multiplayer \- Heroic Labs Documentation, accessed January 11, 2026, [https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/](https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/)  
27. Server authoritative | Elympics Documentation, accessed January 11, 2026, [https://docs.elympics.ai/gameplay/glossary/server-authoritative](https://docs.elympics.ai/gameplay/glossary/server-authoritative)  
28. Schema Definition \- Colyseus docs, accessed January 11, 2026, [https://docs.colyseus.io/state/schema](https://docs.colyseus.io/state/schema)  
29. Schema (0.10.x), accessed January 11, 2026, [https://0-10-x.docs.colyseus.io/state/schema/](https://0-10-x.docs.colyseus.io/state/schema/)  
30. Realtime multi-player game design principles for Node.js, accessed January 11, 2026, [https://gamedev.stackexchange.com/questions/32166/realtime-multi-player-game-design-principles-for-node-js](https://gamedev.stackexchange.com/questions/32166/realtime-multi-player-game-design-principles-for-node-js)  
31. Part 3: Client Predicted Input \- Colyseus, accessed January 11, 2026, [https://colyseus.io/learn/phaser/3-client-predicted-input.html](https://colyseus.io/learn/phaser/3-client-predicted-input.html)  
32. Server In-game Protocol Design and Optimization \- Valve Developer Community, accessed January 11, 2026, [https://developer.valvesoftware.com/wiki/Latency\_Compensating\_Methods\_in\_Client/Server\_In-game\_Protocol\_Design\_and\_Optimization](https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization)  
33. Running Phaser 3 on the server \- Medium, accessed January 11, 2026, [https://medium.com/@16patsle/running-phaser-3-on-the-server-4c0d09ffd5e6](https://medium.com/@16patsle/running-phaser-3-on-the-server-4c0d09ffd5e6)  
34. How do I use Jasmine to test a Phaser 3 project? \- Stack Overflow, accessed January 11, 2026, [https://stackoverflow.com/questions/55690117/how-do-i-use-jasmine-to-test-a-phaser-3-project](https://stackoverflow.com/questions/55690117/how-do-i-use-jasmine-to-test-a-phaser-3-project)  
35. Best practices for coding with agents \- Cursor, accessed January 11, 2026, [https://cursor.com/blog/agent-best-practices](https://cursor.com/blog/agent-best-practices)  
36. Your codebase, your rules: Customizing Copilot with context engineering, accessed January 11, 2026, [https://www.youtube.com/watch?v=0jEzUhU8bLc](https://www.youtube.com/watch?v=0jEzUhU8bLc)  
37. Learn \- Colyseus, accessed January 11, 2026, [https://colyseus.io/learn/](https://colyseus.io/learn/)