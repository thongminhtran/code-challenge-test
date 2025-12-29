import { useState, useEffect } from 'react';
import type { PriceData, Token } from '../types';

const PRICES_URL = 'https://interview.switcheo.com/prices.json';
const TOKEN_ICON_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

export function useTokens() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const response = await fetch(PRICES_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch prices');
        }
        const data: PriceData[] = await response.json();

        // Process and deduplicate tokens, keeping the latest price for each currency
        const tokenMap = new Map<string, Token>();

        data.forEach((item) => {
          // Skip tokens without valid prices
          if (!item.price || item.price <= 0) return;

          const existing = tokenMap.get(item.currency);
          if (!existing || new Date(item.date) > new Date(existing.price)) {
            tokenMap.set(item.currency, {
              currency: item.currency,
              price: item.price,
              image: `${TOKEN_ICON_BASE_URL}/${item.currency}.svg`,
            });
          }
        });

        // Convert to array and sort alphabetically
        const tokenList = Array.from(tokenMap.values()).sort((a, b) =>
          a.currency.localeCompare(b.currency)
        );

        setTokens(tokenList);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  return { tokens, loading, error };
}
