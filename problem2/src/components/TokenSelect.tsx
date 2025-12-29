import { useState, useRef, useEffect } from 'react';
import type { Token } from '../types';
import './TokenSelect.css';

interface TokenSelectProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  label: string;
  disabled?: boolean;
  excludeToken?: Token | null;
}

// Fallback icon component for tokens without images
function TokenFallbackIcon({ currency }: { currency: string }) {
  return (
    <div className="token-icon token-icon-fallback">
      {currency.charAt(0).toUpperCase()}
    </div>
  );
}

// Token icon with fallback
function TokenIcon({ token }: { token: Token }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <TokenFallbackIcon currency={token.currency} />;
  }

  return (
    <img
      src={token.image}
      alt={token.currency}
      className="token-icon"
      onError={() => setHasError(true)}
    />
  );
}

export function TokenSelect({
  tokens,
  selectedToken,
  onSelect,
  label,
  disabled = false,
  excludeToken,
}: TokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter tokens based on search and exclude the other selected token
  const filteredTokens = tokens.filter((token) => {
    const matchesSearch = token.currency
      .toLowerCase()
      .includes(search.toLowerCase());
    const isNotExcluded = !excludeToken || token.currency !== excludeToken.currency;
    return matchesSearch && isNotExcluded;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (token: Token) => {
    onSelect(token);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="token-select" ref={dropdownRef}>
      <label className="token-select-label">{label}</label>
      <button
        type="button"
        className={`token-select-button ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {selectedToken ? (
          <div className="token-selected">
            <TokenIcon token={selectedToken} />
            <span className="token-currency">{selectedToken.currency}</span>
          </div>
        ) : (
          <span className="token-placeholder">Select token</span>
        )}
        <svg
          className={`chevron ${isOpen ? 'rotate' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="token-dropdown">
          <div className="token-search-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="token-search"
              placeholder="Search tokens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="token-list">
            {filteredTokens.length === 0 ? (
              <div className="token-empty">No tokens found</div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={token.currency}
                  type="button"
                  className={`token-option ${
                    selectedToken?.currency === token.currency ? 'selected' : ''
                  }`}
                  onClick={() => handleSelect(token)}
                >
                  <TokenIcon token={token} />
                  <div className="token-info">
                    <span className="token-currency">{token.currency}</span>
                    <span className="token-price">
                      ${token.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
