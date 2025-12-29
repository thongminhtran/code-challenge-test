import React, { useMemo } from 'react';

// Define proper types
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
    currency: string;
    amount: number;
    blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
    formatted: string;
}

// Placeholder types - replace with actual imports from your project
interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {}
interface WalletRowProps {
    key: string;
    amount: number;
    usdValue: number;
    formattedAmount: string;
}

// Placeholder hooks - replace with actual imports
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number>;
declare function WalletRow(props: WalletRowProps): JSX.Element;

interface Props extends BoxProps {}

// Move pure function outside component to avoid recreation
const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
    Osmosis: 100,
    Ethereum: 50,
    Arbitrum: 30,
    Zilliqa: 20,
    Neo: 20,
};

const getPriority = (blockchain: Blockchain): number => {
    return BLOCKCHAIN_PRIORITY[blockchain] ?? -99;
};

const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    const balances = useWalletBalances();
    const prices = usePrices();

    // Memoize the entire transformation pipeline
    const sortedBalances = useMemo(() => {
        return balances
            .filter((balance: WalletBalance) => {
                const priority = getPriority(balance.blockchain);
                // Keep balances with valid priority AND positive amount
                return priority > -99 && balance.amount > 0;
            })
            .sort((lhs: WalletBalance, rhs: WalletBalance) => {
                const leftPriority = getPriority(lhs.blockchain);
                const rightPriority = getPriority(rhs.blockchain);
                // Descending order by priority
                return rightPriority - leftPriority;
            });
    }, [balances]);

    // Memoize formatted balances
    const formattedBalances = useMemo(() => {
        return sortedBalances.map((balance: WalletBalance): FormattedWalletBalance => ({
            ...balance,
            formatted: balance.amount.toFixed(2),
        }));
    }, [sortedBalances]);

    // Memoize rows to prevent unnecessary re-renders
    const rows = useMemo(() => {
        return formattedBalances.map((balance: FormattedWalletBalance) => {
            const usdValue = prices[balance.currency] * balance.amount;
            return (
                <WalletRow
                    key={balance.currency}
                    amount={balance.amount}
                    usdValue={usdValue}
                    formattedAmount={balance.formatted}
                />
            );
        });
    }, [formattedBalances, prices]);

    return (
        <div {...rest}>
            {rows}
            {children}
        </div>
    );
};

export default WalletPage;
