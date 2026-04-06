# Glassbox: Monthly Pulse & Feedback

## Description
**Glassbox** is a high-performance, internal feedback management system designed with a "cyberpunk terminal" aesthetic. It serves as a centralized hub for employees to "Initiate Signals" (submit feedback), which are then analyzed for sentiment using the Gemini AI API. 

The application provides a real-time, interactive interface for tracking ticket status, monitoring organizational velocity, and generating deep-dive AI insights. It solves the problem of fragmented feedback by providing a unified, visually striking platform that turns qualitative employee input into quantitative, actionable data.

## Table of Contents
- [Installation & Requirements](#installation--requirements)
- [Usage Instructions & Examples](#usage-instructions--examples)
- [Technologies Used](#technologies-used)
- [Key Features](#key-features)
- [Testing Instructions](#testing-instructions)
- [Contribution Guidelines](#contribution-guidelines)
- [License Information](#license-information)

## Installation & Requirements
To run Glassbox locally, ensure you have **Node.js (v18+)** and **npm** installed.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd glassbox
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```
4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

## Usage Instructions & Examples
### Initiating a Signal
Navigate to the **New Signal** view, select your department, and enter your feedback. The system will automatically analyze the sentiment before submission.
```tsx
// Example of how sentiment is analyzed in Submit.tsx
const sentiment = await analyzeSentiment(text);
// Returns "POSITIVE", "NEGATIVE", or "NEUTRAL"
```

### Managing the Grid
The **Grid** view allows you to manage tickets using a Kanban-style interface. You can filter by department, status, or "Favorites". Drag and drop tickets between columns to update their status (requires confirmation).

### Viewing Metrics
The **Metrics** view provides MoM (Month-over-Month) volume trends and a searchable "Recent Feedback Log". You can also trigger an AI-generated report for actionable insights based on recent feedback.

## Technologies Used
- **Frontend Framework:** React 18+ with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion (`motion/react`)
- **AI Integration:** `@google/genai` (Gemini API)
- **Drag & Drop:** `@hello-pangea/dnd`
- **Icons:** Lucide React & Material Symbols
- **Testing:** Vitest & React Testing Library

## Key Features
- **Cyberpunk UI:** A distinctive, high-contrast terminal aesthetic with smooth motion transitions.
- **AI Sentiment Analysis:** Real-time feedback classification using Google's Gemini models.
- **Interactive Dashboard:** Live metrics including Velocity Gauge, Average Delay, and Stalled Item tracking.
- **The Grid:** A robust ticket management system with drag-and-drop and advanced filtering.
- **Onboarding Tour:** A guided experience for new users to understand the platform's features.
- **LocalStorage Persistence:** Ensures data remains consistent across sessions without a complex backend.

## Testing Instructions
Glassbox uses **Vitest** for unit and integration testing.

- **Run all tests:**
  ```bash
  npm test
  ```
- **Run tests in watch mode:**
  ```bash
  npx vitest
  ```
The test suite includes:
- `geminiService.test.ts`: Unit tests for API communication and error handling.
- `Submit.test.tsx`: Integration tests for form validation and submission lifecycle.
- `Dashboard.test.tsx`: Logic tests for metric calculations and filter propagation.
- `App.integration.test.tsx`: Full-flow integration test (Login -> Submit -> Dashboard).

## Contribution Guidelines
We welcome contributions! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch for your feature or bugfix.
3.  Ensure all tests pass (`npm test`).
4.  Submit a Pull Request with a clear description of your changes.

Please adhere to the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

## License Information
This project is released under the **MIT License**.

---
*Built with ❤️ for high-performance teams.*
