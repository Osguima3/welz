# Domain Model

## Table of Contents

- [Overview](#overview)
- [Aggregates](#aggregates)
- [Commands](#commands)
- [Events](#events)
- [Queries](#queries)
- [Read Models](#read-models)
- [Value Objects](#value-objects)

## Overview

This document provides a comprehensive view of our domain model following DDD principles and CQRS patterns, including:

- Aggregates and their behaviors
- Commands that can be executed
- Events that can be emitted
- Queries that can be performed
- Read models for efficient querying
- Value objects and entities

## Aggregates

### Account Aggregate

- **Root**: `Account`
- **Value Objects**: `Money`, `Currency`
- **Commands**:
  ```typescript
  interface UpdateBalanceCommand {
    accountId: string;
    newBalance: Money;
    asOf: Date;
  }
  ```
- **Events**:
  - `AccountBalanceUpdated`

### Transaction Aggregate

- **Root**: `Transaction`
- **Value Objects**: `Money`
- **Commands**:
  ```typescript
  interface CreateTransactionCommand {
    accountId: string;
    amount: Money;
    date: Date;
    description?: string;
    category?: string;
  }

  interface CategorizeTransactionCommand {
    transactionId: string;
    categoryId: string;
  }
  ```
- **Events**:
  - `TransactionCreated`
  - `TransactionCategorized`
  - `TransactionUpdated`
  - `TransactionDeleted`

### Category Aggregate

- **Root**: `Category`
- **Value Objects**: None
- **Commands**:
  ```typescript
  interface CreateCategoryCommand {
    name: string;
    type: 'INCOME' | 'EXPENSE';
  }
  ```
- **Events**:
  - `CategoryCreated`
  - `CategoryUpdated`

## Commands

```typescript
interface UpdateBalanceCommand {
  accountId: string;
  newBalance: Money;
  asOf: Date;
}

interface CreateTransactionCommand {
  accountId: string;
  amount: Money;
  date: Date;
  description?: string;
  category?: string;
}

interface CategorizeTransactionCommand {
  transactionId: string;
  categoryId: string;
}
```

## Events

### TransactionCreated

- **Publisher**: Command Module
- **Subscribers**: Query Module, Financial Insights Module
- **Description**: Emitted when a new transaction is received from a bank or manually created by a user
- **Payload**:
  ```json
  {
    "transactionId": "string",
    "userId": "string",
    "amount": "number",
    "timestamp": "string"
  }
  ```

### TransactionUpdated

- **Publisher**: Command Module
- **Subscribers**: Query Module, Financial Insights Module
- **Description**: Emitted when transaction details (amount, date, description) are modified
- **Payload**:
  ```json
  {
    "transactionId": "string",
    "userId": "string",
    "amount": "number",
    "timestamp": "string"
  }
  ```

### TransactionDeleted

- **Publisher**: Command Module
- **Subscribers**: Query Module, Financial Insights Module
- **Description**: Emitted when a transaction is marked as deleted (soft delete)
- **Payload**:
  ```json
  {
    "transactionId": "string",
    "userId": "string",
    "timestamp": "string"
  }
  ```

### TransactionCategorized

- **Publisher**: Command Module
- **Subscribers**: Query Module, Financial Insights Module, Categorization Module
- **Description**: Emitted when a transaction receives a category, either automatically by AI or manually by the user
- **Payload**:
  ```json
  {
    "transactionId": "string",
    "userId": "string",
    "category": "string",
    "previousCategory": "string | null",
    "source": "ai" | "user",
    "timestamp": "string"
  }
  ```

## Queries

### Account Queries

```typescript
interface GetAccountBalancesQuery {
  currency?: string;
}

interface GetAccountTransactionsQuery {
  accountId: string;
  dateRange?: DateRange;
  category?: string;
  page?: number;
  pageSize?: number;
}
```

### Analytics Queries

```typescript
interface GetNetWorthHistoryQuery {
  timeframe: 'week' | 'month' | 'year';
}

interface GetCategorySpendingQuery {
  dateRange: DateRange;
  groupBy: 'day' | 'week' | 'month';
}
```

## Read Models

### AccountReadModel

```typescript
interface AccountReadModel {
  accountId: string;
  name: string;
  type: 'CASH' | 'BANK';
  balance: Money;
  lastUpdated: Date;
}
```

### TransactionReadModel

```typescript
interface TransactionReadModel {
  transactionId: string;
  accountId: string;
  amount: Money;
  date: Date;
  description: string;
  category: CategoryReadModel;
  merchantName?: string;
}
```

### CategoryReadModel

```typescript
interface CategoryReadModel {
  categoryId: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  totalTransactions: number;
  monthlyAverage?: Money;
}
```

### FinancialInsightsReadModel

```typescript
interface FinancialInsightsReadModel {
  netWorth: Money;
  topCategories: {
    category: CategoryReadModel;
    total: Money;
    percentage: number;
  }[];
  monthlyTrends: {
    month: string;
    income: Money;
    expenses: Money;
  }[];
}
```

## Value Objects

### Money

```typescript
interface Money {
  amount: bigint;
  currency: Currency;

  add(other: Money): Money;
  subtract(other: Money): Money;
  multiply(factor: number): Money;
  equals(other: Money): boolean;
}
```

### DateRange

```typescript
interface DateRange {
  start: Date;
  end: Date;

  contains(date: Date): boolean;
  overlaps(other: DateRange): boolean;
  duration(): Duration;
}
```
