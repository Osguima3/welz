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
control     "Command Router"         as CR
control     "Create Transaction"     as CT
control     "Transaction Service"    as TS
control     "Account Service"        as AS
control     "Category Service"       as CS
entity      "Transaction Aggregate"  as TA
entity      "Account Aggregate"      as AA
control     "Query Module"           as QM
database    "Read DB"                as DB

' Flow
API -> CR: CreateTransactionCommand
activate CR
CR -> CT: Route to handler
activate CT

CT -> TS: ValidateTransaction
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

TS --> CT: Transaction Valid
deactivate TS

CT -> TA: CreateTransaction
activate TA
TA --> CT: Transaction Created
deactivate TA

CT -> EB: Publish TransactionCreated
activate EB
EB -> AS: TransactionCreated
EB -> QM: TransactionCreated
EB --> CT: Published
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

CT --> CR: Success Result
deactivate CT
CR --> API: Success Response
deactivate CR
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
control     "Command Router"         as CR
control     "Categorize Transaction" as CAT
control     "Category Service"       as CS
control     "Transaction Service"    as TS
entity      "Transaction Aggregate"  as TA
control     "Query Router"           as QR
control     "Analytics Service"      as AS
database    "Read DB"               as DB

API -> CR: CategorizeTransactionCommand
activate CR
CR -> CAT: Route to handler
activate CAT

CAT -> CS: ValidateCategory
activate CS
CS --> CAT: Category Valid
deactivate CS

CAT -> TS: UpdateTransactionCategory
activate TS
TS -> TA: LoadTransaction
TA --> TS: Transaction State
TS -> TA: UpdateCategory
TA --> TS: Category Updated
deactivate TS

CAT -> EB: Publish TransactionCategorized
activate EB
EB -> QR: TransactionCategorized
EB -> AS: TransactionCategorized
EB --> CAT: Published
deactivate EB

AS -> AS: Calculate Category Metrics
AS -> DB: Update Category Analytics

AS -> EB: Publish CategoryInsightsUpdated
activate EB
EB -> QR: CategoryInsightsUpdated
EB --> AS: Published
deactivate EB

QR -> DB: Update Transaction Models
QR -> DB: Update Analytics

CAT --> CR: Success Result
deactivate CAT
CR --> API: Success Response
deactivate CR
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
control     "Query Router"           as QR
control     "Get Net Worth"          as GNW
control     "Balance Service"        as BS
database    "Read DB"               as DB

EB -> QR: AccountBalanceUpdated
activate QR
QR -> GNW: Route to handler
activate GNW

GNW -> BS: CalculateNetWorth
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

BS --> GNW: Net Worth Updated
deactivate BS

GNW -> EB: Publish NetWorthUpdated
activate EB
EB --> GNW: Published
deactivate EB

GNW --> QR: Success Result
deactivate GNW
deactivate QR
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
control     "Query Router"           as QR
control     "Get Category Insights"  as GCI
control     "Analytics Service"      as AS
database    "Read DB"               as DB

EB -> QR: TransactionCategorized
activate QR
QR -> GCI: Route to handler
activate GCI

GCI -> AS: UpdateCategoryAnalytics
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
EB -> QR: CategoryInsightsCalculated
EB --> AS: Published
deactivate EB

AS --> GCI: Analytics Updated
deactivate AS

GCI --> QR: Success Result
deactivate GCI
deactivate QR
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
