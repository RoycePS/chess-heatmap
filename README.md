# Chess Heatmap

Chess Heatmap is a web application that visualizes your chess activity across Chess.com and Lichess. It generates a GitHub-style contribution graph based on your game history, allowing you to see your daily frequency and consistency over the year.

The live application is available at: [https://chessheat.royceps.com](https://chessheat.royceps.com)

## Features

- Fetches game data from Chess.com and Lichess APIs
- Combines data from both platforms into a single heatmap
- Displays daily game counts and statistics
- Shows win/loss/draw breakdowns and game formats (bullet, blitz, rapid)
- Supports dark and light modes
- Shareable user profiles

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Recharts (for graphs)

## Local Setup

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/royceps/chess-heatmap.git
   cd chess-heatmap
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## License

This project is licensed under the MIT License with the Commons Clause.
You are free to use, modify, and self-host this software for personal or non-commercial purposes.
You may not sell this software as a service or rebrand it for commercial gain.
See the `LICENSE` file for full details.

## Attribution

Created by [Royce](https://royceps.com).
If you use this code, please keep the attribution in the footer.
