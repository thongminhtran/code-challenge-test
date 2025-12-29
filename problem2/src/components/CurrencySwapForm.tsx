import { useState, useCallback, useMemo } from 'react';
import type { Token } from '../types';
import { useTokens } from '../hooks/useTokens';
import { TokenSelect } from './TokenSelect';
import './CurrencySwapForm.css';

interface FormErrors {
  fromToken?: string;
  toToken?: string;
  fromAmount?: string;
}

export function CurrencySwapForm() {
  const { tokens, loading: tokensLoading, error: tokensError } = useTokens();

  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Calculate exchange rate and to amount
  const exchangeRate = useMemo(() => {
    if (!fromToken || !toToken) return null;
    return fromToken.price / toToken.price;
  }, [fromToken, toToken]);

  const toAmount = useMemo(() => {
    if (!exchangeRate || !fromAmount || isNaN(parseFloat(fromAmount))) return '';
    const result = parseFloat(fromAmount) * exchangeRate;
    return result.toFixed(6);
  }, [exchangeRate, fromAmount]);

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!fromToken) {
      newErrors.fromToken = 'Please select a token to swap from';
    }

    if (!toToken) {
      newErrors.toToken = 'Please select a token to swap to';
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      newErrors.fromAmount = 'Please enter a valid amount greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fromToken, toToken, fromAmount]);

  // Handle swap button click (swap the tokens)
  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setErrors({});
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);

    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate API call with delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Reset form after successful swap
    setTimeout(() => {
      setFromAmount('');
      setSubmitSuccess(false);
    }, 3000);
  };

  // Handle amount input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
      if (errors.fromAmount) {
        setErrors((prev) => ({ ...prev, fromAmount: undefined }));
      }
    }
  };

  if (tokensLoading) {
    return (
      <div className="swap-form-container">
        <div className="swap-form-loading">
          <div className="loading-spinner" />
          <p>Loading tokens...</p>
        </div>
      </div>
    );
  }

  if (tokensError) {
    return (
      <div className="swap-form-container">
        <div className="swap-form-error">
          <p>Failed to load tokens: {tokensError}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="swap-form-container">
      <div className="swap-form-header">
        <h1>Swap Tokens</h1>
        <p>Exchange your tokens instantly</p>
      </div>

      <form onSubmit={handleSubmit} className="swap-form">
        {/* From Section */}
        <div className="swap-section">
          <div className="swap-input-group">
            <label className="swap-input-label">You Pay</label>
            <div className={`swap-input-wrapper ${errors.fromAmount ? 'error' : ''}`}>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={fromAmount}
                onChange={handleAmountChange}
                className="swap-amount-input"
                disabled={isSubmitting}
              />
              {fromToken && fromAmount && (
                <span className="usd-value">
                  ≈ ${(parseFloat(fromAmount || '0') * fromToken.price).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              )}
            </div>
            {errors.fromAmount && <span className="error-message">{errors.fromAmount}</span>}
          </div>

          <div className={errors.fromToken ? 'has-error' : ''}>
            <TokenSelect
              tokens={tokens}
              selectedToken={fromToken}
              onSelect={(token) => {
                setFromToken(token);
                if (errors.fromToken) {
                  setErrors((prev) => ({ ...prev, fromToken: undefined }));
                }
              }}
              label="From"
              disabled={isSubmitting}
              excludeToken={toToken}
            />
            {errors.fromToken && <span className="error-message">{errors.fromToken}</span>}
          </div>
        </div>

        {/* Swap Button */}
        <div className="swap-divider">
          <button
            type="button"
            className="swap-direction-btn"
            onClick={handleSwapTokens}
            disabled={isSubmitting}
            title="Swap tokens"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 12.5L10 17.5M10 17.5L15 12.5M10 17.5V2.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* To Section */}
        <div className="swap-section">
          <div className="swap-input-group">
            <label className="swap-input-label">You Receive</label>
            <div className="swap-input-wrapper readonly">
              <input
                type="text"
                placeholder="0.00"
                value={toAmount}
                readOnly
                className="swap-amount-input"
              />
              {toToken && toAmount && (
                <span className="usd-value">
                  ≈ ${(parseFloat(toAmount || '0') * toToken.price).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              )}
            </div>
          </div>

          <div className={errors.toToken ? 'has-error' : ''}>
            <TokenSelect
              tokens={tokens}
              selectedToken={toToken}
              onSelect={(token) => {
                setToToken(token);
                if (errors.toToken) {
                  setErrors((prev) => ({ ...prev, toToken: undefined }));
                }
              }}
              label="To"
              disabled={isSubmitting}
              excludeToken={fromToken}
            />
            {errors.toToken && <span className="error-message">{errors.toToken}</span>}
          </div>
        </div>

        {/* Exchange Rate Display */}
        {exchangeRate && fromToken && toToken && (
          <div className="exchange-rate">
            <span className="rate-label">Exchange Rate</span>
            <span className="rate-value">
              1 {fromToken.currency} = {exchangeRate.toFixed(6)} {toToken.currency}
            </span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className={`swap-submit-btn ${submitSuccess ? 'success' : ''}`}
          disabled={isSubmitting || submitSuccess}
        >
          {isSubmitting ? (
            <>
              <div className="button-spinner" />
              Swapping...
            </>
          ) : submitSuccess ? (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 10L8 14L16 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Swap Successful!
            </>
          ) : (
            'Swap Tokens'
          )}
        </button>
      </form>
    </div>
  );
}
