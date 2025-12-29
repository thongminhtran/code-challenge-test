# Problem 3: Messy React - Code Review

## Overview

This document identifies computational inefficiencies and anti-patterns in the provided React/TypeScript code block, along with explanations on how to improve them.

---

## Issues Found

### 1. Undefined Variable `lhsPriority`

**Location:** Line 56

**Problem:**
```typescript
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) {  // ❌ lhsPriority is never defined
```

**Explanation:** The variable `balancePriority` is calculated but `lhsPriority` (which doesn't exist) is used in the condition. This will cause a `ReferenceError` at runtime.

**Fix:** Use `balancePriority` instead of `lhsPriority`.

---

### 2. Missing `blockchain` Property in `WalletBalance` Interface

**Location:** Lines 18-21

**Problem:**
```typescript
interface WalletBalance {
    currency: string;
    amount: number;
    // ❌ Missing blockchain property
}
```

**Explanation:** The code accesses `balance.blockchain` in multiple places, but the `WalletBalance` interface doesn't define this property. This causes TypeScript compilation errors.

**Fix:** Add `blockchain: string` to the interface.

---

### 3. Inverted Filter Logic

**Location:** Lines 56-61

**Problem:**
```typescript
if (lhsPriority > -99) {
    if (balance.amount <= 0) {
        return true;
    }
}
return false
```

**Explanation:** The logic returns `true` (keeps the item) when `amount <= 0`, which filters IN zero/negative balances and filters OUT positive balances. This is likely the opposite of the intended behavior.

**Fix:** The condition should be `balance.amount > 0` to keep positive balances.

---

### 4. Sort Comparator Missing Return Value

**Location:** Lines 62-70

**Problem:**
```typescript
.sort((lhs: WalletBalance, rhs: WalletBalance) => {
    const leftPriority = getPriority(lhs.blockchain);
    const rightPriority = getPriority(rhs.blockchain);
    if (leftPriority > rightPriority) {
        return -1;
    } else if (rightPriority > leftPriority) {
        return 1;
    }
    // ❌ No return statement when priorities are equal
});
```

**Explanation:** When `leftPriority === rightPriority`, the function returns `undefined`. This leads to undefined sorting behavior and inconsistent results across different JavaScript engines.

**Fix:** Add `return 0` for the equal case.

---

### 5. `formattedBalances` Created But Never Used

**Location:** Lines 73-78, 80

**Problem:**
```typescript
const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
        ...balance,
        formatted: balance.amount.toFixed()
    }
})

const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    // ❌ Uses sortedBalances instead of formattedBalances
    // ❌ Types it as FormattedWalletBalance but sortedBalances contains WalletBalance
```

**Explanation:**
1. `formattedBalances` is computed but never used
2. `rows` maps over `sortedBalances` (which has `WalletBalance` type) but types each item as `FormattedWalletBalance`
3. Accessing `balance.formatted` will be `undefined`

**Fix:** Use `formattedBalances` in the `rows` mapping.

---

### 6. Incorrect `useMemo` Dependencies

**Location:** Line 71

**Problem:**
```typescript
}, [balances, prices]);
```

**Explanation:** `prices` is included in the dependency array but is never used inside the `useMemo` callback. This causes unnecessary recalculations when `prices` changes.

**Fix:** Remove `prices` from dependencies, or if `prices` should affect sorting, use it in the callback.

---

### 7. `getPriority` Function Recreated Every Render

**Location:** Lines 36-51

**Problem:**
```typescript
const getPriority = (blockchain: any): number => {
    switch (blockchain) {
        // ...
    }
}
```

**Explanation:** This function is defined inside the component and recreated on every render. Since it doesn't depend on any props or state, this is wasteful.

**Fix:** Move the function outside the component, or wrap it with `useCallback` (though moving outside is preferred since it has no dependencies).

---

### 8. Using `any` Type

**Location:** Line 36

**Problem:**
```typescript
const getPriority = (blockchain: any): number => {
```

**Explanation:** Using `any` defeats TypeScript's type safety. The blockchain values are known strings.

**Fix:** Define a proper type like `type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo'` and use it.

---

### 9. Using Array Index as React Key

**Location:** Line 85

**Problem:**
```typescript
key={index}
```

**Explanation:** Using array indices as keys is an anti-pattern when:
- The list can be reordered (sorting)
- Items can be added/removed

This can cause incorrect component reuse, state bugs, and poor performance.

**Fix:** Use a unique identifier like `balance.currency` as the key.

---

### 10. Undefined `classes` Object

**Location:** Line 84

**Problem:**
```typescript
className={classes.row}
```

**Explanation:** `classes` is never defined in the component. This will cause a `ReferenceError`.

**Fix:** Either define styles using a CSS-in-JS solution (like `makeStyles` from Material-UI), import a CSS module, or use inline styles.

---

### 11. Empty Interface Extension

**Location:** Lines 28-30

**Problem:**
```typescript
interface Props extends BoxProps {

}
```

**Explanation:** An empty interface that just extends another interface is redundant and adds no value.

**Fix:** Either use `BoxProps` directly or add component-specific props to the interface.

---

### 12. Inefficient Double Iteration

**Location:** Lines 53-78, 80-91

**Problem:**
```typescript
const sortedBalances = useMemo(() => { ... }, [balances, prices]);
const formattedBalances = sortedBalances.map(...);  // Not memoized
const rows = sortedBalances.map(...);               // Not memoized
```

**Explanation:**
1. `formattedBalances` and `rows` are recalculated on every render
2. Could be combined into a single pass
3. `formattedBalances` transformation could be part of the memoized computation

**Fix:** Combine operations and memoize appropriately.

---

### 13. Destructuring `children` But Never Using It

**Location:** Line 32

**Problem:**
```typescript
const { children, ...rest } = props;
```

**Explanation:** `children` is destructured but never rendered or used.

**Fix:** Either render `{children}` in the JSX or remove it from destructuring.

---

## Summary Table

| # | Issue | Severity | Type |
|---|-------|----------|------|
| 1 | Undefined `lhsPriority` variable | Critical | Bug |
| 2 | Missing `blockchain` in interface | Critical | Type Error |
| 3 | Inverted filter logic | Critical | Logic Bug |
| 4 | Sort missing return value | High | Bug |
| 5 | `formattedBalances` unused | High | Bug |
| 6 | Wrong `useMemo` dependencies | Medium | Performance |
| 7 | `getPriority` recreated each render | Medium | Performance |
| 8 | Using `any` type | Medium | Anti-pattern |
| 9 | Array index as key | Medium | Anti-pattern |
| 10 | Undefined `classes` | Critical | Bug |
| 11 | Empty interface | Low | Anti-pattern |
| 12 | Inefficient double iteration | Medium | Performance |
| 13 | Unused `children` destructuring | Low | Code Smell |

---

## Refactored Code

```typescript
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
    }, [balances]); // Only depend on balances

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
                    key={balance.currency} // Use unique identifier instead of index
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
```

---

## Key Improvements in Refactored Code

1. **Fixed all bugs:** Corrected undefined variables, filter logic, and sort comparator
2. **Proper TypeScript types:** Replaced `any` with proper `Blockchain` type
3. **Moved `getPriority` outside:** Prevents recreation on every render
4. **Used lookup object:** More efficient and maintainable than switch statement
5. **Correct `useMemo` dependencies:** Each memoization only depends on what it uses
6. **Used `formattedBalances`:** Fixed the unused variable issue
7. **Stable keys:** Used `currency` as key instead of array index
8. **Removed `classes.row`:** Removed undefined reference
9. **Simplified sort:** Used subtraction for cleaner numeric comparison
10. **Added `children` rendering:** Actually use the destructured prop
11. **Added proper decimal formatting:** `toFixed(2)` for currency display
