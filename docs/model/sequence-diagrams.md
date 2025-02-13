# Sequence Diagrams

## Table of Contents
- [Transaction Flows](#transaction-flows)
  - [Transaction Creation](#transaction-creation)
  - [Category Update](#category-update)
  - [Balance Snapshot](#balance-snapshot)
  - [Profile Sharing Flow](#profile-sharing-flow)
  - [Account Creation Flow](#account-creation-flow)
  - [Net Worth Calculation Flow](#net-worth-calculation-flow)
  - [Manual Transaction Import Flow](#manual-transaction-import-flow)
- [Authentication Flows](#authentication-flows)
  - [Authentication Flow](#authentication-flow)
- [Sync Flows](#sync-flows)
  - [Data Sync Flow](#data-sync-flow)

## Transaction Flows

### Transaction Creation
Shows how a new transaction flows through the system, from API request to read model update.

```plantuml
@startuml
participant "API Gateway" as API
participant "Command Handler" as CH
participant "Transaction Service" as TS
participant "Account Service" as AS
participant "Category Service" as CS
participant "Transaction Aggregate" as TA
participant "EventStore" as ES
participant "Event Bus" as EB
participant "Query Module" as QM
participant "Read DB" as DB

API -> CH: CreateTransactionCommand
activate CH

CH -> TS: ValidateTransaction
activate TS

TS -> AS: CheckAccountBalance
activate AS
AS --> TS: Balance OK
deactivate AS

TS -> CS: SuggestCategory
activate CS
CS --> TS: Category Suggestion
deactivate CS

TS --> CH: Transaction Valid
deactivate TS

CH -> TA: CreateTransaction
activate TA
TA -> ES: Store TransactionCreatedEvent
ES --> TA: Event Stored
TA --> CH: Transaction Created
deactivate TA

CH -> EB: Publish TransactionCreatedEvent
activate EB
EB --> CH: Event Published
deactivate EB

CH --> API: Success Response
deactivate CH

EB -> QM: Handle TransactionCreatedEvent
activate QM
QM -> DB: Update Read Models
DB --> QM: Updated
deactivate QM
@enduml
```

### Category Update
Shows the flow of updating a transaction's category, including ML model update.

```plantuml
@startuml
participant "API Gateway" as API
participant "Command Handler" as CH
participant "Category Service" as CS
participant "Transaction Service" as TS
participant "Transaction Aggregate" as TA
participant "EventStore" as ES
participant "Event Bus" as EB
participant "Query Module" as QM
participant "ML Service" as ML
participant "Read DB" as DB

API -> CH: CategorizeTransactionCommand
activate CH

CH -> CS: ValidateCategory
activate CS
CS --> CH: Category Valid
deactivate CS

CH -> TS: UpdateTransactionCategory
activate TS

TS -> TA: LoadTransaction
activate TA
TA --> TS: Transaction State
deactivate TA

TS -> ES: Store TransactionCategorizedEvent
ES --> TS: Event Stored

TS --> CH: Category Updated
deactivate TS

CH -> EB: Publish TransactionCategorizedEvent
EB --> CH: Event Published

CH --> API: Success Response
deactivate CH

EB -> QM: Handle TransactionCategorizedEvent
activate QM
QM -> DB: Update Read Models
DB --> QM: Updated
deactivate QM

EB -> ML: Handle TransactionCategorizedEvent
activate ML
ML -> DB: Update Training Data
ML -> ML: Update Model (Async)
deactivate ML
@enduml
```

### Balance Snapshot
Shows the periodic balance snapshot process and read model updates.

```plantuml
@startuml
participant "Scheduler" as SCHED
participant "Command Handler" as CH
participant "Account Service" as AS
participant "Balance Service" as BS
participant "Account Aggregate" as AA
participant "EventStore" as ES
participant "Event Bus" as EB
participant "Query Module" as QM
participant "Read DB" as DB

SCHED -> CH: CreateBalanceSnapshotCommand
activate CH

CH -> AS: ValidateAccount
activate AS
AS --> CH: Account Valid
deactivate AS

CH -> BS: CalculateBalance
activate BS

BS -> AA: LoadAccount
activate AA
AA --> BS: Account State
deactivate AA

BS -> ES: Store BalanceSnapshotCreatedEvent
ES --> BS: Event Stored

BS --> CH: Balance Calculated
deactivate BS

CH -> EB: Publish BalanceSnapshotCreatedEvent
EB --> CH: Event Published

CH --> SCHED: Success Response
deactivate CH

EB -> QM: Handle BalanceSnapshotCreatedEvent
activate QM
QM -> DB: Update Balance History
DB --> QM: History Updated
QM -> DB: Update Account Balance
DB --> QM: Balance Updated
deactivate QM
@enduml
```

### Profile Sharing Flow
```plantuml
@startuml
participant "API Gateway" as API
participant "Command Handler" as CH
participant "Profile Service" as PS
participant "Auth Service" as AS
participant "Profile Aggregate" as PA
participant "EventStore" as ES
participant "Event Bus" as EB
participant "Query Module" as QM
participant "Read DB" as DB

API -> CH: ShareProfileCommand
activate CH

CH -> AS: ValidatePermissions
activate AS
AS --> CH: Permissions Valid
deactivate AS

CH -> PS: ShareProfile
activate PS

PS -> PA: LoadProfile
activate PA
PA --> PS: Profile State
deactivate PA

PS -> AS: CreateSharedAccess
activate AS
AS --> PS: Access Created
deactivate AS

PS -> ES: Store ProfileSharedEvent
ES --> PS: Event Stored

PS --> CH: Profile Shared
deactivate PS

CH -> EB: Publish ProfileSharedEvent
EB --> CH: Event Published

CH --> API: Success Response
deactivate CH

EB -> QM: Handle ProfileSharedEvent
activate QM
QM -> DB: Update Shared Access
DB --> QM: Access Updated
deactivate QM
@enduml
```

### Account Creation Flow
```plantuml
@startuml
participant "API Gateway" as API
participant "Command Handler" as CH
participant "Account Service" as AS
participant "Entity Service" as ES
participant "Currency Service" as CS
participant "Account Aggregate" as AA
participant "EventStore" as EVS
participant "Event Bus" as EB
participant "Query Module" as QM
participant "Read DB" as DB

API -> CH: CreateAccountCommand
activate CH

CH -> ES: ValidateEntity
activate ES
ES --> CH: Entity Valid
deactivate ES

CH -> AS: CreateAccount
activate AS

AS -> CS: ValidateCurrency
activate CS
CS --> AS: Currency Valid
deactivate CS

AS -> AA: CreateAccount
activate AA
AA -> EVS: Store AccountCreatedEvent
EVS --> AA: Event Stored
AA --> AS: Account Created
deactivate AA

AS --> CH: Account Ready
deactivate AS

CH -> EB: Publish AccountCreatedEvent
EB --> CH: Event Published

CH --> API: Success Response
deactivate CH

EB -> QM: Handle AccountCreatedEvent
activate QM
QM -> DB: Create Account View
DB --> QM: Updated
deactivate QM
@enduml
```

### Net Worth Calculation Flow
```plantuml
@startuml
participant "Query Module" as QM
participant "Balance Service" as BS
participant "Currency Service" as CS
participant "Cache Service" as CACHE
participant "Read DB" as DB

QM -> BS: CalculateNetWorth
activate BS

BS -> DB: FetchAccountBalances
activate DB
DB --> BS: Account Data
deactivate DB

BS -> CS: ConvertCurrencies
activate CS
CS --> BS: Converted Balances
deactivate CS

BS -> CACHE: StoreCalculation
activate CACHE
CACHE --> BS: Cached
deactivate CACHE

BS --> QM: Net Worth Result
deactivate BS

QM -> DB: UpdateNetWorthHistory
activate DB
DB --> QM: Updated
deactivate DB
@enduml
```

### Manual Transaction Import Flow
```plantuml
@startuml
participant "API Gateway" as API
participant "Command Handler" as CH
participant "Import Service" as IS
participant "Validation Service" as VS
participant "Transaction Service" as TS
participant "EventStore" as ES
participant "Event Bus" as EB
participant "ML Service" as ML
participant "Read DB" as DB

API -> CH: ImportTransactionsCommand
activate CH

CH -> IS: ProcessImport
activate IS

IS -> VS: ValidateFormat
activate VS
VS --> IS: Format Valid
deactivate VS

IS -> TS: CreateTransactions
activate TS

TS -> ES: Store TransactionsImportedEvent
ES --> TS: Event Stored

TS -> EB: Publish TransactionsImportedEvent
EB --> TS: Event Published

TS --> IS: Transactions Created
deactivate TS

IS --> CH: Import Complete
deactivate IS

CH --> API: Success Response
deactivate CH

EB -> ML: Handle TransactionsImportedEvent
activate ML
ML -> ML: Train Categorization Model
deactivate ML

EB -> DB: Update Transaction Views
activate DB
DB --> EB: Updated
deactivate DB
@enduml
```

## Authentication Flows

### Authentication Flow
```plantuml
@startuml
participant "API Gateway" as API
participant "Command Handler" as CH
participant "Auth Service" as AS
participant "User Service" as US
participant "Profile Service" as PS
participant "User Aggregate" as UA
participant "EventStore" as ES
participant "Event Bus" as EB
participant "Query Module" as QM
participant "Read DB" as DB

API -> CH: LoginUserCommand
activate CH

CH -> AS: ValidateCredentials
activate AS
AS --> CH: Credentials Valid
deactivate AS

CH -> US: GetOrCreateUser
activate US

US -> UA: LoadUser
activate UA
UA --> US: User State
deactivate UA

US -> PS: GetUserProfiles
activate PS
PS --> US: User Profiles
deactivate PS

US -> ES: Store UserLoggedInEvent
ES --> US: Event Stored

US --> CH: User Details
deactivate US

CH -> EB: Publish UserLoggedInEvent
EB --> CH: Event Published

CH --> API: Success Response with Token
deactivate CH

EB -> QM: Handle UserLoggedInEvent
activate QM
QM -> DB: Update Last Login
DB --> QM: Updated
deactivate QM
@enduml
```

## Sync Flows

### Data Sync Flow
```plantuml
@startuml
participant "Scheduler" as SCHED
participant "Command Handler" as CH
participant "Sync Service" as SS
participant "Account Service" as AS
participant "Transaction Service" as TS
participant "External API" as EXT
participant "Account Aggregate" as AA
participant "EventStore" as ES
participant "Event Bus" as EB
participant "Query Module" as QM
participant "ML Service" as ML
participant "Read DB" as DB

SCHED -> CH: SyncAccountCommand
activate CH

CH -> SS: InitiateSync
activate SS

SS -> AS: ValidateAccount
activate AS
AS -> AA: LoadAccount
AA --> AS: Account State
AS --> SS: Account Valid
deactivate AS

SS -> EXT: FetchTransactions
activate EXT
EXT --> SS: New Transactions
deactivate EXT

SS -> ES: Store TransactionsImportedEvent
ES --> SS: Event Stored
SS -> EB: Publish TransactionsImportedEvent
EB --> SS: Event Published

SS -> TS: ProcessTransactionsBatch
activate TS
loop For each transaction
    TS -> ES: Store TransactionCreatedEvent
    ES --> TS: Event Stored
    TS -> EB: Publish TransactionCreatedEvent
    EB --> TS: Event Published
end
TS --> SS: Batch Processed
deactivate TS

SS -> ES: Store AccountSyncedEvent
ES --> SS: Event Stored

SS --> CH: Sync Complete
deactivate SS

CH -> EB: Publish AccountSyncedEvent
EB --> CH: Event Published

CH --> SCHED: Success Response
deactivate CH

EB -> QM: Handle TransactionsImportedEvent
activate QM
QM -> DB: Prepare For Batch
DB --> QM: Ready
deactivate QM

EB -> QM: Handle TransactionCreatedEvent (Multiple)
activate QM
QM -> DB: Update Transaction Views
DB --> QM: Updated
deactivate QM

EB -> ML: Handle TransactionsImportedEvent
activate ML
ML -> ML: Batch Train Model
deactivate ML

EB -> QM: Handle AccountSyncedEvent
activate QM
QM -> DB: Update Account Status
DB --> QM: Updated
deactivate QM
@enduml
```
