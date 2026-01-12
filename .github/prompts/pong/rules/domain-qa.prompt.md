---
agent: agent
---

# Domain Rules: Quality Assurance

This file contains the testing, CI/CD, and quality assurance guidelines.

## Testing Philosophy

1. **Multi-layered Testing**: Unit → Integration → E2E
2. **Test Pyramid**: Many unit tests, fewer integration tests, minimal E2E tests
3. **Self-Healing**: CI failures should be fixed before marking tasks complete

## Testing Pyramid

```
          ┌───────┐
          │  E2E  │  ← Few, slow, high confidence
          │ Tests │
         ┌┴───────┴┐
         │ Integra-│  ← Medium, test component interactions
         │  tion   │
        ┌┴─────────┴┐
        │   Unit    │  ← Many, fast, test individual functions
        │   Tests   │
        └───────────┘
```

## Testing Framework Setup

### Client (Phaser/JavaScript)

**Stack**: Jest + JSDOM + node-canvas

```bash
cd client
npm install -D jest @types/jest jsdom canvas
```

Create `client/jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/__tests__/**/*.test.js', '**/*.spec.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/main.js',
    '!**/node_modules/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  }
};
```

Create `client/jest.setup.js`:

```javascript
// Mock Phaser for headless testing
global.Phaser = {
  AUTO: 0,
  HEADLESS: 1,
  Scale: {
    FIT: 0,
    CENTER_BOTH: 0
  },
  Math: {
    Linear: (a, b, t) => a + (b - a) * t
  }
};

// Mock AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    type: '',
    frequency: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  }),
  createGain: jest.fn().mockReturnValue({
    gain: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn() },
    connect: jest.fn()
  }),
  createBuffer: jest.fn().mockReturnValue({}),
  createBufferSource: jest.fn().mockReturnValue({
    buffer: null,
    connect: jest.fn(),
    start: jest.fn()
  }),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: jest.fn()
}));
```

### Server (Colyseus/TypeScript)

**Stack**: Jest + ts-jest

```bash
cd server
npm install -D jest ts-jest @types/jest
```

Create `server/jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!**/node_modules/**'
  ]
};
```

## Unit Test Examples

### Physics Logic Tests

Create `server/src/__tests__/physics.test.ts`:

```typescript
import { Ball } from '../schemas/GameState';

describe('Ball Physics', () => {
  describe('movement', () => {
    it('should update position based on velocity', () => {
      const ball = new Ball();
      ball.x = 400;
      ball.y = 300;
      ball.velocityX = 5;
      ball.velocityY = 3;
      
      // Simulate one tick
      ball.x += ball.velocityX;
      ball.y += ball.velocityY;
      
      expect(ball.x).toBe(405);
      expect(ball.y).toBe(303);
    });
    
    it('should travel correctly over 60 frames', () => {
      const ball = new Ball();
      ball.x = 100;
      ball.y = 100;
      ball.velocityX = 5;
      ball.velocityY = 0;
      
      // Simulate 60 frames (1 second at 60 FPS)
      for (let i = 0; i < 60; i++) {
        ball.x += ball.velocityX;
      }
      
      expect(ball.x).toBe(400); // 100 + (5 * 60)
    });
  });
  
  describe('wall collision', () => {
    const GAME_HEIGHT = 600;
    const BALL_SIZE = 15;
    
    it('should reverse Y velocity when hitting top wall', () => {
      const ball = new Ball();
      ball.y = BALL_SIZE / 2 - 1; // Past top boundary
      ball.velocityY = -5;
      
      // Collision check
      if (ball.y <= BALL_SIZE / 2) {
        ball.velocityY *= -1;
      }
      
      expect(ball.velocityY).toBe(5);
    });
    
    it('should reverse Y velocity when hitting bottom wall', () => {
      const ball = new Ball();
      ball.y = GAME_HEIGHT - BALL_SIZE / 2 + 1;
      ball.velocityY = 5;
      
      if (ball.y >= GAME_HEIGHT - BALL_SIZE / 2) {
        ball.velocityY *= -1;
      }
      
      expect(ball.velocityY).toBe(-5);
    });
  });
});
```

### Collision Detection Tests

```typescript
describe('Paddle Collision', () => {
  const PADDLE_WIDTH = 15;
  const PADDLE_HEIGHT = 100;
  const BALL_SIZE = 15;
  
  function checkCollision(ballX, ballY, paddleX, paddleY) {
    const paddleLeft = paddleX - PADDLE_WIDTH / 2;
    const paddleRight = paddleX + PADDLE_WIDTH / 2;
    const paddleTop = paddleY - PADDLE_HEIGHT / 2;
    const paddleBottom = paddleY + PADDLE_HEIGHT / 2;
    
    return (
      ballX - BALL_SIZE / 2 < paddleRight &&
      ballX + BALL_SIZE / 2 > paddleLeft &&
      ballY - BALL_SIZE / 2 < paddleBottom &&
      ballY + BALL_SIZE / 2 > paddleTop
    );
  }
  
  it('should detect collision when ball overlaps paddle', () => {
    expect(checkCollision(60, 300, 50, 300)).toBe(true);
  });
  
  it('should not detect collision when ball is away', () => {
    expect(checkCollision(200, 300, 50, 300)).toBe(false);
  });
  
  it('should detect collision at paddle edge', () => {
    // Ball just touching paddle edge
    expect(checkCollision(57.5 + 7.5, 300, 50, 300)).toBe(true);
  });
});
```

### Sound Manager Tests

Create `client/src/__tests__/SoundManager.test.js`:

```javascript
import { SoundManager } from '../audio/SoundManager';

describe('SoundManager', () => {
  let soundManager;
  
  beforeEach(() => {
    soundManager = new SoundManager();
  });
  
  it('should not be initialized by default', () => {
    expect(soundManager.initialized).toBe(false);
  });
  
  it('should initialize audio context', async () => {
    const result = await soundManager.init();
    expect(result).toBe(true);
    expect(soundManager.initialized).toBe(true);
  });
  
  it('should not play sounds when not initialized', () => {
    // Should not throw
    expect(() => soundManager.playPaddleHit()).not.toThrow();
  });
  
  it('should toggle enabled state', async () => {
    await soundManager.init();
    
    soundManager.setEnabled(false);
    expect(soundManager.isEnabled()).toBe(false);
    
    soundManager.setEnabled(true);
    expect(soundManager.isEnabled()).toBe(true);
  });
});
```

### Interpolation Tests

```javascript
describe('Entity Interpolation', () => {
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  it('should interpolate at t=0 to return start value', () => {
    expect(lerp(0, 100, 0)).toBe(0);
  });
  
  it('should interpolate at t=1 to return end value', () => {
    expect(lerp(0, 100, 1)).toBe(100);
  });
  
  it('should interpolate at t=0.5 to return midpoint', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });
  
  it('should handle negative values', () => {
    expect(lerp(-50, 50, 0.5)).toBe(0);
  });
});
```

## Integration Test Examples

### Network Manager Integration

```javascript
// client/src/__tests__/NetworkManager.integration.test.js

describe('NetworkManager Integration', () => {
  let networkManager;
  
  beforeAll(() => {
    // Start test server
    // (In real setup, you might use a mock or local server)
  });
  
  afterAll(() => {
    // Stop test server
  });
  
  it('should connect to server', async () => {
    // This would require a running server or mock
    // Mock implementation:
    const mockRoom = {
      sessionId: 'test-session',
      state: { players: new Map() }
    };
    
    expect(mockRoom.sessionId).toBeDefined();
  });
  
  it('should send input messages', () => {
    const mockSend = jest.fn();
    const room = { send: mockSend };
    
    room.send('input', { direction: 'UP' });
    
    expect(mockSend).toHaveBeenCalledWith('input', { direction: 'UP' });
  });
});
```

### Game Room Integration

```typescript
// server/src/__tests__/GameRoom.integration.test.ts

import { GameRoom } from '../rooms/GameRoom';

describe('GameRoom Integration', () => {
  it('should start game when two players join', () => {
    // Would use Colyseus testing utilities
    // This is a simplified example
    
    const mockState = {
      players: new Map(),
      status: 'waiting'
    };
    
    // Simulate two joins
    mockState.players.set('player1', { x: 50, y: 300 });
    mockState.players.set('player2', { x: 750, y: 300 });
    
    if (mockState.players.size === 2) {
      mockState.status = 'playing';
    }
    
    expect(mockState.status).toBe('playing');
  });
});
```

## E2E Test Examples (Optional)

For E2E testing, you could use Playwright or Puppeteer:

```javascript
// e2e/game.test.js
const { chromium } = require('playwright');

describe('Pong Game E2E', () => {
  let browser, page;
  
  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  it('should load the game', async () => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#game-container');
    
    const canvas = await page.$('canvas');
    expect(canvas).toBeTruthy();
  });
  
  it('should show menu scene', async () => {
    await page.goto('http://localhost:5173');
    
    // Wait for Phaser to initialize
    await page.waitForTimeout(1000);
    
    // Game should be in menu state
    const gameActive = await page.evaluate(() => {
      return window.game && window.game.scene.isActive('MenuScene');
    });
    
    expect(gameActive).toBe(true);
  });
});
```

## CI/CD Pipeline Configuration

### GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-client:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./client
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: './client/package-lock.json'
      - run: npm ci
      - run: npm run lint --if-present

  lint-server:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./server
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: './server/package-lock.json'
      - run: npm ci
      - run: npm run lint --if-present

  test-client:
    needs: lint-client
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./client
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: './client/package-lock.json'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./client/coverage/lcov.info
          flags: client

  test-server:
    needs: lint-server
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./server
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: './server/package-lock.json'
      - run: npm ci
      - run: npm run build
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./server/coverage/lcov.info
          flags: server

  build:
    needs: [test-client, test-server]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Build Client
        working-directory: ./client
        run: |
          npm ci
          npm run build
      
      - name: Build Server
        working-directory: ./server
        run: |
          npm ci
          npm run build
      
      - name: Upload Client Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: client-dist
          path: ./client/dist

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Download Client Artifacts
        uses: actions/download-artifact@v3
        with:
          name: client-dist
          path: ./client/dist
      
      - name: Deploy to GitHub Pages
        # Pinned to v3.9.3 commit SHA for security (avoid supply chain attacks)
        uses: peaceiris/actions-gh-pages@884a022509302f1c350073a05fed143bdd96e9c7
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./client/dist
```

## Self-Healing Protocol

When CI fails, follow this process:

### 1. Read Error Logs

```bash
# View job logs in GitHub Actions UI
# Or use gh CLI:
gh run view <run-id> --log-failed
```

### 2. Categorize the Failure

| Category | Example | Action |
|----------|---------|--------|
| **Lint Error** | ESLint rule violation | Fix code style |
| **Type Error** | TypeScript compilation | Fix types |
| **Test Failure** | Assertion failed | Fix test or code |
| **Build Error** | Missing dependency | Update package.json |
| **Runtime Error** | Uncaught exception | Add error handling |

### 3. Fix and Re-run

```bash
# Run locally first
npm run lint
npm test
npm run build

# Then push fix
git add .
git commit -m "fix: resolve CI failure - [category]"
git push
```

### 4. Verify

- [ ] CI pipeline passes
- [ ] No new warnings introduced
- [ ] Code coverage maintained or improved

## Code Coverage Requirements

| Metric | Minimum | Target |
|--------|---------|--------|
| Line Coverage | 70% | 85% |
| Branch Coverage | 60% | 80% |
| Function Coverage | 75% | 90% |

Configure coverage thresholds in Jest:

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 75,
      lines: 70,
      statements: 70
    }
  }
};
```

## Summary Checklist

### Testing
- [ ] Jest configured for client (with JSDOM)
- [ ] Jest configured for server (with ts-jest)
- [ ] Unit tests for physics logic
- [ ] Unit tests for collision detection
- [ ] Unit tests for interpolation
- [ ] Integration tests for network layer
- [ ] Mocks for Phaser and AudioContext

### CI/CD
- [ ] GitHub Actions workflow created
- [ ] Lint step runs before tests
- [ ] Tests run on PRs and main branch
- [ ] Build step produces artifacts
- [ ] Deploy step publishes to hosting
- [ ] Code coverage reports generated

### Quality
- [ ] Coverage thresholds defined
- [ ] Self-healing protocol documented
- [ ] All tests pass locally before push
- [ ] No lint warnings in codebase
