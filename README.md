# Glassbox: Monthly Pulse & Feedback

## Description
**Glassbox** is a high-performance, internal feedback management system and organizational organizational health tool designed with a distinctive "cyberpunk terminal" aesthetic. It serves as a centralized hub for tracking employee sentiments, managing the team roster, and analyzing organizational vibes using AI.

By combining real-time metric tracking, AI-driven sentiment analysis, and a visually striking interactive dashboard, Glassbox solves the problem of fragmented employee feedback. It turns qualitative input into quantitative, actionable data for management and HR teams, all within a unified, gamified interface.

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

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd glassbox
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory based on `.env.example` and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Usage Instructions & Examples

### Initiating a Signal (Feedback)
Navigate to the **New Signal** view, select the appropriate department, and enter your feedback. The system automatically analyzes the sentiment via AI before submission.
```tsx
// Example: Under the hood sentiment analysis
const sentiment = await analyzeSentiment(feedbackText);
// Returns "POSITIVE", "NEGATIVE", or "NEUTRAL"
```

### Managing the Neural Grid
The **Grid** view allows administrators to manage feedback tickets using a drag-and-drop Kanban interface. You can filter by department, status, or tag.

### Viewing Metrics & Insights
The **Metrics** view provides MoM (Month-over-Month) volume trends using Recharts. You can also trigger an **AI-generated report** for actionable insights based on recent employee feedback logs.

### System Configuration
The **Settings** view allows you to customize the application's appearance (Cyber, Neon, or Stealth modes), manage the organizational roster, and toggle active integrations. 

## Technologies Used
* **Frontend Framework:** React 19 with Vite
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Animations & Motion:** Framer Motion (`motion/react`)
* **Charting:** Recharts
* **AI Integration:** `@google/genai` (Gemini API)
* **Drag & Drop:** `@hello-pangea/dnd`
* **Icons:** Lucide React & Material Symbols
* **Testing:** Vitest & React Testing Library

## Key Features
* **Cyberpunk UI:** A visually stunning, high-contrast terminal aesthetic with parallax effects and seamless motion transitions.
* **AI Sentiment Analysis:** Real-time feedback classification utilizing Google's Gemini models.
* **Interactive Dashboards:** Live metrics including Velocity Gauges, Average Delay, and Stalled Item tracking.
* **Kanban Grid:** A robust ticket management system with drag-and-drop functionality and advanced filtering.
* **Theme Engine:** Switchable visual themes (Cyber, Neon, Stealth) that adapt across the entire application interface.
* **Onboarding Experience:** A guided tour for new users to quickly understand the platform's features.

## Testing Instructions
Glassbox uses **Vitest** for running unit and integration testing.

To execute the test suite:
* **Run all tests once:**
  ```bash
  npm test
  ```
* **Run tests in watch mode for development:**
  ```bash
  npx vitest
  ```

Automated tests cover API communication, form validation, metric calculations, and full-flow integration ensuring robust code quality for potential contributors.

## Contribution Guidelines
We welcome and encourage contributions! To submit changes:

1. **Fork the repository** and clone it locally.
2. **Create a new branch** for your feature or bug fix (`git checkout -b feature/amazing-feature`).
3. Commit your changes and ensure they adhere to existing code styles.
4. **Run the test suite** (`npm test`) to verify your changes haven't broken existing functionality.
5. **Submit a Pull Request** with a detailed description of your modifications and wait for review.

Please adhere to the [Contributor Covenant](https://www.contributor-covenant.org/) as our code of conduct.

## License Information
This project is released under the **MIT License**. You are free to use, modify, and distribute this software in accordance with the license terms.
