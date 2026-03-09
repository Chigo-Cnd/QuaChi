# ⚗️ QuaChi — Quantitative Chemistry Laboratory

> **A PhET-style interactive chemistry simulation platform with AI tutoring, molecular visualization, and quantitative analysis tools.**

Developed by **QuaModels** | [quamodels.com@gmail.com](mailto:quamodels.com@gmail.com)

---

## 🌟 Features

| Feature | Description |
|---|---|
| 🧪 **50+ Experiments** | Interactive virtual chemistry experiments across 12 topics |
| 🤖 **QuaChi AI** | AI tutor powered by Claude — explains, guides, and generates reports |
| 🔬 **3D Molecules** | Three.js molecular viewer with CPK colors and orbital display |
| 🧮 **Calculators** | Mole, molarity, gas law, pH, equilibrium, yield, and Nernst calculators |
| ⚖️ **Reaction Calculator** | Balance equations, find limiting reagent, predict yield |
| 📄 **Lab Reports** | Automated report generation + manual editor with AI review |
| 📊 **Data Visualization** | Titration curves, gas law graphs, reaction rate plots |
| 🌍 **Multi-Curriculum** | IB, AP, A-Level, IGCSE, WAEC, NECO aligned content |
| 🎨 **3 Themes** | Light, Dark, and Grey modes |
| 📱 **Responsive** | Mobile-first design, works on phones, tablets, laptops |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Anthropic API key (for AI tutor)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/quamodels/quachi.git
cd quachi

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# 4. Run development server
npm run dev

# 5. Open in browser
open http://localhost:3000
```

---

## 🏗️ Project Structure

```
quachi/
├── src/
│   ├── components/        # React UI components
│   │   ├── Sidebar.tsx
│   │   ├── ExperimentViewer.tsx
│   │   ├── CalculatorWorkspace.tsx
│   │   ├── AIChat.tsx
│   │   ├── ReportEditor.tsx
│   │   ├── MoleculeViewer.tsx
│   │   └── ThemeSwitcher.tsx
│   ├── pages/             # Next.js pages
│   │   ├── index.tsx
│   │   ├── experiments.tsx
│   │   ├── calculator.tsx
│   │   ├── molecules.tsx
│   │   ├── ai-tutor.tsx
│   │   ├── reports.tsx
│   │   └── api/ai/chat.ts
│   ├── engine/            # Chemistry simulation engine
│   │   ├── SimulationEngine.ts
│   │   ├── ReactionRules.ts
│   │   └── ExperimentLogic.ts
│   ├── data/              # Chemistry knowledge database
│   │   ├── PeriodicTable.ts
│   │   ├── ChemistryDatabase.ts
│   │   └── Experiments.ts
│   └── utils/             # Utility functions
│       ├── EquationBalancer.ts
│       ├── StoichiometryCalculator.ts
│       └── ReactionPredictor.ts
├── public/                # Static assets
├── package.json
├── next.config.js
├── tailwind.config.ts
└── vercel.json
```

---

## 🔧 Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 | Frontend framework |
| React 18 | UI library |
| TypeScript | Type safety |
| TailwindCSS | Styling |
| Three.js | 3D molecular visualization |
| Chart.js | Scientific data charts |
| Anthropic Claude | AI tutor engine |
| Zustand | State management |

---

## 🌐 Deployment to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Add environment variable
vercel env add ANTHROPIC_API_KEY

# Deploy to production
vercel --prod
```

Or simply connect your GitHub repository to Vercel and enable automatic deployments.

---

## 📚 Curriculum Coverage

- **IB Chemistry** — HL and SL with IA templates
- **AP Chemistry** — aligned with College Board CED
- **A-Level Chemistry** — AQA, Edexcel, OCR
- **IGCSE Chemistry** — Core and Extended
- **WAEC / NECO** — West African syllabi

---

## 🧪 Experiment Categories

| Category | Count |
|---|---|
| Separation Techniques | 5 |
| Acids, Bases & Salts | 6 |
| Gas Laws | 5 |
| Reaction Rates | 4 |
| Electrochemistry | 5 |
| Organic Chemistry | 5 |
| Thermochemistry | 4 |
| Chemical Equilibrium | 4 |
| Redox Reactions | 4 |
| Solutions & Solubility | 4 |
| Atomic Structure | 3 |
| Nuclear Chemistry | 3 |

---

## 🤖 AI Tutor — QuaChi AI

QuaChi AI is powered by Anthropic's Claude API. It can:

- Explain chemistry concepts in depth
- Guide you through experiments step-by-step
- Help solve quantitative chemistry problems
- Generate complete laboratory reports
- Review and improve your manual reports

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 📬 Contact

**© The QuaModels**

For inquiries, support, or suggestions:
📧 [quamodels.com@gmail.com](mailto:quamodels.com@gmail.com)

---

*Built for learners everywhere. Designed to make chemistry accessible, visual, and understood.*
