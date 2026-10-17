# PERQ — Smarter Cards. Bigger Rewards.

**PERQ** is a modern fintech prototype web application for managing demo payment cards, comparing sample reward rates (**Smart Pick AI**), inspecting physical card hardware in an interactive **Three.js 3D Studio**, tracking demo expenses and sample savings, browsing nearby sample offers, and managing recurring demo bills.

> **Important Prototype Notice:** PERQ is an interactive software prototype using fictional demo data. It is not a bank, credit card issuer, or payment processor. Never enter real card numbers, CVVs, PINs, OTPs, or banking passwords.

---

## Features

1. **Main Dashboard (`Home`)**
   - Personalized greeting (*“Good morning, Alex”*), total demo wallet balance, and one-click **Hide/Show Balances** toggle.
   - Three preloaded sample cards (**Aurora**, **Spectrum**, and **Obsidian**) plus custom demo card creation.
   - Quick summary cards for **Smart Pick**, **Savings (Sample Est.)**, **Spending (Demo)**, and **Bills**.
   - Interactive **Three.js 3D Card Studio** preview, recent demo transactions, and nearby sample offers.

2. **Wallet & 3D Hardware Card Studio (`Wallet`)**
   - Selectable bank-card designs with card nickname, network label, masked last four digits (`•••• 4829`), demo balance, and sample reward rates.
   - Interactive **Three.js 3D Card Studio** featuring an 8-part procedural monochrome metal card assembly (brushed titanium core, chamfered outer bezel, internal sterling silver NFC antenna coil, dark graphite security core, multi-pad platinum EMV smart chip, silicon crypto-wafer die, raised 3D PERQ emblem inlay, and magnetic stripe) mounted over a grounded studio pedestal with `RoomEnvironment` PBR reflections, monochrome studio lighting presets, camera angle presets, an **Exploded View** slider (`0%–100%`), and a collapsible bottom control dock.

3. **Smart Pick AI (`Smart Pick`)**
   - Enter any merchant name, purchase amount, and category (`Dining`, `Travel`, `Groceries`, `Shopping`, `Entertainment`, `Utilities`, `General`).
   - Automatically compares sample category multipliers across all demo cards and recommends the card with the highest estimated reward using a transparent mathematical formula (`Amount × (Sample Rate ÷ 100)`).
   - Includes an optional server-side **Gemini AI** commentary button (`/api/smart-pick-insight`) that keeps API keys strictly on the server and falls back gracefully when no API key is configured.

4. **Savings & Expenses (`Expenses`)**
   - Working demo expense tracker to add and delete transactions with real-time updates to **Total Demo Spending** and **Sample Savings Est.**

5. **Nearby Sample Offers (`Offers`)**
   - Searchable, category-filterable directory of fictional merchant perks with distance labels and an opt-in demo location toggle.

6. **Bill Manager (`Bills`)**
   - Add recurring demo bills, track pending bill counts and upcoming totals, and toggle bills between **Pending** and **Paid (Demo)** immediately without initiating real transfers.

---

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Three.js (`three`), Lucide React (`lucide-react`)
- **Backend (Optional AI Insight Proxy):** Node.js, Express (`server.ts`), `@google/genai`
- **Testing:** Node.js native test runner (`node --test`)

---

## Local Development Setup

### Prerequisites
- Node.js 20+ (Node.js 22+ recommended for native TypeScript unit tests)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env` if you want to enable live server-side Gemini AI explanations in Smart Pick:
```bash
cp .env.example .env
```
Set `GEMINI_API_KEY="your_api_key_here"` inside `.env`. All core features—including Smart Pick mathematical reward recommendations—work out of the box without an API key.

### 3. Run Unit Tests
```bash
npm test
```

### 4. Start the Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Exporting to GitHub

1. In Google AI Studio, use the **Export to GitHub** action (or clone/download the project files).
2. Verify that `.gitignore` excludes `node_modules/`, `dist/`, and `.env`.
3. Commit and push to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: PERQ fintech prototype"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

---

## Deploying to Vercel

1. Import your GitHub repository in the [Vercel Dashboard](https://vercel.com/new).
2. Configure the build settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. *(Optional)* Add `GEMINI_API_KEY` under **Project Settings → Environment Variables** if deploying the server route. Even on static hosting, the frontend automatically falls back to deterministic formula explanations.
4. Click **Deploy**.
