# UW Guesser 🦢

**UW Guesser** is an interactive location guessing game dedicated to the University of Waterloo campus. Inspired by GeoGuessr, it tests students' and alumni's knowledge of campus landmarks, hidden corners, and iconic buildings.

Built with **Next.js**, **Socket.io**, and **MongoDB**, it features real-time multiplayer modes, global leaderboards, and a smooth, immersive user experience.

## 🚀 Features

### Game Modes
*   **Single Player**: classic mode to test your knowledge at your own pace.
*   **Multiplayer 1v1**: Challenge a friend in real-time.
*   **Triangle Trouble**: A unique triangulation game mode.
*   **Tutorial**: Learn how to play and master the map.
*   *(Coming Soon)*: Multiplayer Teams, Ranked Mode.

### Core Systems
*   **Real-time Gameplay**: Powered by `Socket.io` for instant multiplayer synchronization.
*   **Leaderboards**: Global ranking system to track top players.
*   **Immersive Transitions**: Custom GSAP-powered cloud animations.
*   **Dynamic Map**: Interactive map for location pinning.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animations**: [GSAP](https://greensock.com/gsap)
-   **Components**: React, Headless UI

### Backend
-   **Server**: Custom Node.js server (integrated with Next.js via `ts-node`)
-   **WebSockets**: [Socket.io](https://socket.io/) for real-time state management.
-   **Database**: [MongoDB](https://www.mongodb.com/) for user data and game history.

### Infrastructure
-   **Image Hosting**: Cloudinary
-   **Runtime**: Node.js

## 📂 Project Structure

```
├── app/                  # Next.js App Router pages (routes)
│   ├── game/             # Main game interface
│   ├── leaderboard/      # Leaderboard page
│   ├── modes/            # Game mode selection
│   ├── tutorial/         # Tutorial page
│   └── ...
├── components/           # Reusable React components
│   ├── hero/             # Landing page components
│   ├── CloudTransition/  # Custom transition effects
│   └── ...
├── server/               # Backend logic
│   ├── handlers/         # Socket.io event handlers (Game, Queue)
│   └── index.ts          # Server entry point
├── public/               # Static assets (images, icons)
└── server.mts            # Main server startup script
```

## ⚡ Getting Started

### Prerequisites
-   Node.js (v18+ recommended)
-   npm or yarn
-   MongoDB instance (local or Atlas)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/ApilaashY/Waterloo-Guesser.git
    cd Waterloo-Guesser
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory and add your keys (MongoDB URI, Cloudinary credentials, etc.).

### Running the Development Server

To run both the Next.js frontend and the Socket.io backend simultaneously (required for game functionality), use:

```bash
npm run dev:socket
```

> **Note**: Do not use `npm run dev` alone, as it only starts the frontend and will fail to connect to the game server.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 👥 Authors

-   **Senthil Kirthieswar**
-   **Apilaash Yoharan**

---

*Made with ❤️ for uWaterloo*
