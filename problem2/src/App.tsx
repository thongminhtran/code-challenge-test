import { CurrencySwapForm } from './components/CurrencySwapForm';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="app-background">
        <div className="gradient-blob blob-1" />
        <div className="gradient-blob blob-2" />
        <div className="gradient-blob blob-3" />
      </div>
      <main className="app-main">
        <CurrencySwapForm />
      </main>
    </div>
  );
}

export default App;
