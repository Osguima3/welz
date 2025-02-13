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
This document provides a comprehensive view of our domain model following DDD principles and CQRS/ES patterns, including:
- Aggregates and their behaviors
- Commands that can be executed
- Events that can be emitted
- Queries that can be performed
- Read models for efficient querying
- Value objects and entities

## Aggregates

### User Aggregate
- **Root**: `User`
- **Value Objects**: `Email`, `Name`
- **Commands**:
  ```typescript
  interface CreateUserCommand {
    email: string;
    firstName: string;
    lastName: string;
  }
  ```
- **Events**:
  - `UserCreated`
  - `UserProfileAdded`
  - `UserProfileShared`

### Profile Aggregate
- **Root**: `Profile`
- **Value Objects**: `ProfileSettings`
- **Commands**:
  ```typescript
  interface CreateProfileCommand {
    name: string;
    ownerId: string;
    settings?: ProfileSettings;
  }
  
  interface UpdateProfileCommand {
    profileId: string;
    name?: string;
    settings?: Partial<ProfileSettings>;
  }
  ```
- **Events**:
  - `ProfileCreated`
  - `ProfileUpdated`
  - `ProfileShared`
  - `ProfileUnshared`

### Entity Aggregate
- **Root**: `FinancialEntity`
- **Value Objects**: `EntityCredentials`
- **Commands**:
  ```typescript
  interface ConnectEntityCommand {
    profileId: string;
    provider: string;
    credentials: EntityCredentials;
  }
  
  interface DisconnectEntityCommand {
    entityId: string;
    reason?: string;
  }
  ```
- **Events**:
  - `EntityConnected`
  - `EntityDisconnected`
  - `EntitySyncRequested`
  - `EntitySyncCompleted`

### Account Aggregate
- **Root**: `Account`
- **Value Objects**: `Money`, `Currency`
- **Commands**:
  ```typescript
  interface CreateAccountCommand {
    entityId: string;
    name: string;
    type: AccountType;
    currency: string;
    initialBalance?: Money;
  }
  
  interface UpdateBalanceCommand {
    accountId: string;
    newBalance: Money;
    asOf: Date;
  }
  ```
- **Events**:
  - `AccountCreated`
  - `AccountBalanceUpdated`
  - `AccountClosed`

### Transaction Aggregate
- **Root**: `Transaction`
- **Value Objects**: `Money`, `TransactionMetadata`
- **Commands**:
  ```typescript
  interface CreateTransactionCommand {
    accountId: string;
    amount: Money;
    date: Date;
    description?: string;
    category?: string;
    metadata?: TransactionMetadata;
  }
  
  interface CategorizeTransactionCommand {
    transactionId: string;
    categoryId: string;
    isAutomatic: boolean;
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

### User Commands
```typescript
interface CreateUserCommand {
  email: string;
  firstName: string;
  lastName: string;
}

interface ShareProfileCommand {
  profileId: string;
  userId: string;
  role: 'VIEWER' | 'EDITOR';
}
```

### Account Commands
```typescript
interface ConnectEntityCommand {
  profileId: string;
  provider: string;
  credentials: EntityCredentials;
}

interface CreateManualAccountCommand {
  entityId: string;
  name: string;
  currency: string;
  initialBalance: Money;
}
```

### Transaction Commands
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
  isAutomatic: boolean;
}
```

## Events

### AccountConnected
- **Publisher**: Command Module
- **Subscribers**: Query Module, Data Aggregation Module
- **Description**: Emitted when a user successfully connects a new bank account or investment account to their profile
- **Payload**:
  ```json
  {
    "userId": "string",
    "provider": "string",
    "accountId": "string",
    "timestamp": "string"
  }
  ```

### DataSyncStarted
- **Publisher**: Data Aggregation Module
- **Subscribers**: Query Module
- **Description**: Emitted when the system begins synchronizing data from a connected financial institution
- **Payload**:
  ```json
  {
    "userId": "string",
    "provider": "string",
    "timestamp": "string"
  }
  ```

### DataSyncCompleted
- **Publisher**: Data Aggregation Module
- **Subscribers**: Query Module, Financial Insights Module
- **Description**: Emitted when data synchronization finishes successfully, including the count of new transactions found
- **Payload**:
  ```json
  {
    "userId": "string",
    "provider": "string",
    "newTransactionCount": "number",
    "timestamp": "string"
  }
  ```

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

### User Queries
```typescript
interface GetUserProfilesQuery {
  userId: string;
}

interface GetSharedProfilesQuery {
  userId: string;
}
```

### Account Queries
```typescript
interface GetAccountBalancesQuery {
  profileId: string;
  currency?: string;  // For conversion
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
  profileId: string;
  timeframe: 'week' | 'month' | 'year';
}

interface GetCategorySpendingQuery {
  profileId: string;
  dateRange: DateRange;
  groupBy: 'day' | 'week' | 'month';
}
```

## Read Models

### UserProfileReadModel
```typescript
interface UserProfileReadModel {
  userId: string;
  email: string;
  name: string;
  profiles: {
    profileId: string;
    name: string;
    role: 'OWNER' | 'EDITOR' | 'VIEWER';
  }[];
}
```

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
  metadata: TransactionMetadata;
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

### TransactionMetadata
```typescript
interface TransactionMetadata {
  description: string;
  merchantName?: string;
  reference?: string;
  location?: {
    lat: number;
    lng: number;
  };
}
```

### EntityCredentials
```typescript
interface EntityCredentials {
  type: 'OAUTH' | 'API_KEY';
  data: {
    accessToken?: string;
    refreshToken?: string;
    apiKey?: string;
    expires?: Date;
  };
  metadata: Record<string, unknown>;
}
```

### ProfileSettings
```typescript
interface ProfileSettings {
  defaultCurrency: string;
  budgetPeriod: 'MONTH' | 'WEEK';
  notifications: {
    budgetAlerts: boolean;
    syncAlerts: boolean;
    balanceAlerts: boolean;
  };
  sharing: {
    allowViewers: boolean;
    allowEditors: boolean;
  };
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

