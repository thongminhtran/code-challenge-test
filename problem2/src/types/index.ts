export interface PriceData {
  currency: string;
  date: string;
  price: number;
}

export interface Token {
  currency: string;
  price: number;
  image: string;
}

export interface SwapFormData {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
}
