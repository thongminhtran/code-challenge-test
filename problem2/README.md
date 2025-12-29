# Problem 2: Fancy Form - Currency Swap

A modern currency swap form built with React, TypeScript, and Vite.

## Features

- Token selection with searchable dropdown
- Real-time exchange rate calculation
- Live USD value display
- Input validation with error messages
- Swap direction button to switch tokens
- Loading states and success feedback
- Responsive design with animated gradient background
- Fallback icons for tokens without images

## Tech Stack

- React 19
- TypeScript
- Vite 5
- CSS (no external UI libraries)

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm

### Installation

```bash
# Navigate to the problem2 directory
cd problem2

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

## Project Structure

```
problem2/
├── src/
│   ├── components/
│   │   ├── CurrencySwapForm.tsx   # Main swap form component
│   │   ├── CurrencySwapForm.css
│   │   ├── TokenSelect.tsx        # Token dropdown selector
│   │   └── TokenSelect.css
│   ├── hooks/
│   │   └── useTokens.ts           # Hook for fetching token prices
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## API References

- **Token Prices**: https://interview.switcheo.com/prices.json
- **Token Icons**: https://github.com/Switcheo/token-icons/tree/main/tokens
