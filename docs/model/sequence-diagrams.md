# Sequence Diagrams

## Table of Contents
- [Transaction Management](#transaction-management)
- [Balance Updates](#balance-updates)
- [Analytics Updates](#analytics-updates)

## Transaction Management

### Create Transaction
```plantuml
@startuml
!pragma teoz true
skinparam responseMessageBelowArrow true
skinparam sequenceMessageAlign direction
skinparam maxMessageSize 100
skinparam participantPadding 20
skinparam boxPadding 10
hide footbox

' Participant definitions
queue       "Event Bus"              as EB
boundary    "API Gateway"            as API
control     "Command Handler"        as CH
control     "Transaction Service"    as TS
control     "Account Service"        as AS
control     "Category Service"       as CS
entity      "Transaction Aggregate"  as TA
entity      "Account Aggregate"      as AA
control     "Query Module"           as QM
database    "Read DB"                as DB

' Flow
API -> CH: CreateTransactionCommand
activate CH

CH -> TS: ValidateTransaction
activate TS

TS -> AS: CheckAccountBalance
activate AS
AS -> AA: GetBalance
AA --> AS: Current Balance
AS --> TS: Balance OK
deactivate AS

TS -> CS: ValidateCategory
activate CS
CS --> TS: Category Valid
deactivate CS

TS --> CH: Transaction Valid
deactivate TS

CH -> TA: CreateTransaction
activate TA
TA --> CH: Transaction Created
deactivate TA

CH -> EB: Publish TransactionCreated
activate EB
EB -> AS: TransactionCreated
EB -> QM: TransactionCreated
EB --> CH: Published
deactivate EB

AS -> AA: UpdateBalance
activate AA
AA -> AA: Calculate New Balance
AA -> DB: Save Balance
AA --> AS: Balance Updated
deactivate AA

AS -> EB: Publish AccountBalanceUpdated
activate EB
EB -> QM: AccountBalanceUpdated
EB --> AS: Published
deactivate EB

QM -> DB: Update Transaction Models
QM -> DB: Update Balance History

CH --> API: Success Response
deactivate CH
@enduml
```

### Update Transaction Category
```plantuml
@startuml
!pragma teoz true
skinparam responseMessageBelowArrow true
skinparam sequenceMessageAlign direction
skinparam maxMessageSize 100
skinparam participantPadding 20
skinparam boxPadding 10
hide footbox

queue       "Event Bus"              as EB
boundary    "API Gateway"            as API
control     "Command Handler"        as CH
control     "Category Service"       as CS
control     "Transaction Service"    as TS
entity      "Transaction Aggregate"  as TA
control     "Query Module"           as QM
control     "Analytics Service"      as AS
database    "Read DB"               as DB

API -> CH: CategorizeTransactionCommand
activate CH

CH -> CS: ValidateCategory
activate CS
CS --> CH: Category Valid
deactivate CS

CH -> TS: UpdateTransactionCategory
activate TS
TS -> TA: LoadTransaction
TA --> TS: Transaction State
TS -> TA: UpdateCategory
TA --> TS: Category Updated
deactivate TS

CH -> EB: Publish TransactionCategorized
activate EB
EB -> QM: TransactionCategorized
EB -> AS: TransactionCategorized
EB --> CH: Published
deactivate EB

AS -> AS: Calculate Category Metrics
AS -> DB: Update Category Analytics

AS -> EB: Publish CategoryInsightsUpdated
activate EB
EB -> QM: CategoryInsightsUpdated
EB --> AS: Published
deactivate EB

QM -> DB: Update Transaction Models
QM -> DB: Update Analytics

CH --> API: Success Response
deactivate CH
@enduml
```

### Calculate Net Worth
```plantuml
@startuml
!pragma teoz true
skinparam responseMessageBelowArrow true
skinparam sequenceMessageAlign direction
skinparam maxMessageSize 100
skinparam participantPadding 20
skinparam boxPadding 10
hide footbox

queue       "Event Bus"              as EB
control     "Query Module"           as QM
control     "Balance Service"        as BS
database    "Read DB"               as DB

EB -> QM: AccountBalanceUpdated
activate QM

QM -> BS: CalculateNetWorth
activate BS

BS -> DB: FetchAllAccountBalances
activate DB
DB --> BS: Current Balances
deactivate DB

BS -> BS: Sum Balances
BS -> DB: UpdateNetWorthHistory
activate DB
DB --> BS: Updated
deactivate DB

BS --> QM: Net Worth Updated
deactivate BS

QM -> EB: Publish NetWorthUpdated
activate EB
EB --> QM: Published
deactivate EB

deactivate QM
@enduml
```

### Calculate Category Insights
```plantuml
@startuml
!pragma teoz true
skinparam responseMessageBelowArrow true
skinparam sequenceMessageAlign direction
skinparam maxMessageSize 100
skinparam participantPadding 20
skinparam boxPadding 10
hide footbox

queue       "Event Bus"              as EB
control     "Query Module"           as QM
control     "Analytics Service"      as AS
database    "Read DB"               as DB

EB -> QM: TransactionCategorized
activate QM

QM -> AS: UpdateCategoryAnalytics
activate AS

AS -> DB: FetchTransactionsByCategory
activate DB
DB --> AS: Transactions
deactivate DB

AS -> AS: Calculate\nCategory Totals
AS -> AS: Calculate\nMonthly Trends
AS -> AS: Calculate\nPercentages

AS -> DB: UpdateCategoryInsights
activate DB
DB --> AS: Updated
deactivate DB

AS -> EB: Publish CategoryInsightsCalculated
activate EB
EB -> QM: CategoryInsightsCalculated
EB --> AS: Published
deactivate EB

AS --> QM: Analytics Updated
deactivate AS

QM --> EB: Processed
deactivate QM
@enduml
```

### Key Events Flow
1. Transaction Events:
   - TransactionCreated -> Updates balances, transaction models
   - TransactionCategorized -> Updates analytics, insights
   - TransactionDeleted -> Updates balances, analytics

2. Account Events:
   - AccountBalanceUpdated -> Updates net worth, balance history

3. Analytics Events:
   - CategoryInsightsUpdated -> Updates read models
   - NetWorthUpdated -> Updates dashboards
