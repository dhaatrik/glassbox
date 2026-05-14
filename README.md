# Glassbox: Organizational Intelligence & Feedback Terminal

<div align="center">
  <img src="https://img.shields.io/badge/version-v4.2.1-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
  <img src="https://img.shields.io/badge/React-19-61dafb.svg?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript" alt="TypeScript" />
</div>

<br />


## 1. Project Title & Description

**Glassbox** is a high-performance, internal feedback management system and organizational health tool, wrapped in a distinctive "cyberpunk terminal" aesthetic. It serves as a centralized hub for tracking employee sentiments, managing team rosters, and analyzing organizational vibes using cutting-edge AI.

**The Problem:** Traditional employee feedback systems are fragmented, dull, and rely heavily on manual interpretation, leading to delayed insights and disengaged employees.

**The Solution:** By combining real-time metric tracking, AI-driven sentiment analysis, and a visually striking interactive dashboard, Glassbox turns qualitative employee input into quantitative, actionable data for management and HR teams. 

**Why These Technologies?**
React 19 and Vite were chosen for rapid, highly performant frontend rendering. Tailwind CSS and Framer Motion enable the complex, immersive cyberpunk interface without sacrificing performance. Finally, integration with the Google Gemini AI (`gemma-4-31b-it`) empowers the system to autonomously classify sentiments and generate human-readable insight reports instantly.

---

## 2. Table of Contents

- [3. Installation & Requirements](#3-installation--requirements)
- [4. Usage Instructions & Examples](#4-usage-instructions--examples)
- [5. Technologies Used (Tech Stack)](#5-technologies-used-tech-stack)
- [6. Contribution Guidelines](#6-contribution-guidelines)
- [7. Testing Instructions](#7-testing-instructions)
- [8. License Information](#8-license-information)

---

## 3. Installation & Requirements

To run Glassbox locally, ensure you have **Node.js (v18+)** and **npm** installed.

**Step 1: Clone the repository**
```bash
git clone https://github.com/dhaatrik/glassbox.git
cd glassbox
```

**Step 2: Install dependencies**
```bash
npm install
```

**Step 3: Set up environment variables**
Create a `.env` file in the root directory (based on `.env.example`) and add your Gemini API key to enable the AI features:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

**Step 4: Start the development server**
```bash
npm run dev
```
The application will be running and accessible at `http://localhost:3000`.

---

## 4. Usage Instructions & Examples

### Initiating a Signal (Feedback)
Navigate to the **New Signal** view via the terminal interface, select the appropriate department, and enter your feedback. The system automatically analyzes the sentiment via AI before submission.

```typescript
// Example: Under the hood sentiment analysis via Gemini
const sentiment = await analyzeSentiment(feedbackText);
// Evaluates to: "POSITIVE", "NEGATIVE", or "NEUTRAL"
```

### Managing the Neural Grid
The **Grid** view allows administrators to manage feedback tickets using an intuitive drag-and-drop Kanban interface. You can filter by department, status, or keyword to organize tasks efficiently.

### Viewing Metrics & Insights
The **Metrics** view provides MoM (Month-over-Month) volume trends using dynamic charts. Click the AI Insight button to trigger an **AI-generated report** that synthesizes recent employee feedback logs into actionable executive takeaways.

---

## 5. Technologies Used (Tech Stack)

* **Frontend Engine:** React 19 powered by Vite
* **Language:** TypeScript
* **Styling Engine:** Tailwind CSS v4
* **Animations & Motion:** Framer Motion (`motion/react`)
* **Data Visualization:** Recharts
* **AI Integration:** `@google/genai` (Configured for `gemma-4-31b-it`)
* **Interactive UI:** `@hello-pangea/dnd` (Drag & Drop), Lucide React
* **Testing Infrastructure:** Vitest & React Testing Library

---

## 6. Contribution Guidelines

We welcome and encourage contributions to make Glassbox even better! Whether you are fixing bugs, improving documentation, or proposing new features, your help is appreciated.

Please see our full [CONTRIBUTING.md](./CONTRIBUTING.md) file for detailed instructions on how to submit issues, suggest features, and make changes. We adhere strictly to the [Contributor Covenant](https://www.contributor-covenant.org/) as our code of conduct.

**Basic Workflow:**
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 7. Testing Instructions

Glassbox uses **Vitest** for robust unit and integration testing to ensure system integrity. Automated tests cover API communication, DOM rendering, form validation, metric calculations, and full-flow user journeys.

**To run the entire test suite:**
```bash
npm test
```

**To run tests in interactive watch mode (for active development):**
```bash
npx vitest
```

We ask that all contributors run the test suite and ensure it is fully passing before submitting a Pull Request.

---

## 8. License Information

This project is authored by **Dhaatrik Chowdhury** ([@dhaatrik](https://github.com/dhaatrik)) and is released under the **MIT License**. 

You are completely free to use, modify, distribute, and build upon this software in accordance with the terms of the MIT License. See the [LICENSE](./LICENSE) file for the full text and permissions.
