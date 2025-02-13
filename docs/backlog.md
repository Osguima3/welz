# Backlog

## Table of Contents

- [User Stories](#user-stories)
- [RICE Prioritization](#rice-prioritization)
- [Tickets](#tickets)

## User Stories

### As a user, I want to view mock financial account data to test the consolidated view

**Description:**  
Display pre-configured mock data representing bank accounts and transactions to demonstrate the dashboard's functionality.

**Acceptance Criteria:**  
- Dashboard shows mock bank accounts with balances  
- Transaction list displays sample data  
- Clear indication that data is for demonstration purposes  

---

### As a user, I want to sync my financial accounts using TrueLayer so that I get a consolidated view of my finances

**Description:**  
Enable users to connect and sync their digital financial accounts via TrueLayer API integration so that all transactions are aggregated into one dashboard.

**Acceptance Criteria:**  
- Users can securely link their bank accounts via TrueLayer  
- The system fetches real transaction data  
- Data refresh occurs at configured intervals  

---

### As a user, I want basic transaction management to track my spending

**Description:**  
Allow manual transaction entry with basic CRUD operations.

**Acceptance Criteria:**  
- Basic form for transaction entry (amount, date, category)  
- List view of entered transactions  
- Edit and delete capabilities  

---

### As a user, I want a complete transaction management system with categorization

**Description:**  
Full transaction management system with advanced categorization, bulk operations, and data validation.

**Acceptance Criteria:**  
- Advanced transaction form with auto-categorization  
- Bulk import/export capabilities  
- Transaction splitting and recurring transactions  
- Category management system  

---

### As a user, I want to see basic spending insights so I can understand my finances better

**Description:**  
Display simple statistical insights based on transaction data, such as spending by category and basic trends.

**Acceptance Criteria:**  
- Spending breakdown by category  
- Monthly spending trends  
- Top spending categories  

---

### As a user, I want detailed financial insights with forecasting

**Description:**  
Comprehensive financial analysis including spending patterns, budget tracking, and future projections.

**Acceptance Criteria:**  
- Advanced spending analysis  
- Budget vs actual comparisons  
- Spending forecasts  
- Custom report generation  

---

### As a user, I want basic budget setup so I can track my spending

**Description:**  
Simple budget creation and tracking functionality.

**Acceptance Criteria:**  
- Set monthly budget amounts  
- Basic budget vs actual comparison  
- Visual budget progress indicators  

---

### As a user, I want comprehensive budget management

**Description:**  
Advanced budgeting system with multiple budget types, rolling budgets, and goal tracking.

**Acceptance Criteria:**  
- Multiple budget timeframes  
- Category-specific budgets  
- Budget templates  
- Goal setting and tracking  

## RICE Prioritization

| User Story                       | Reach | Impact | Confidence | Effort | Score   |
|----------------------------------|:-----:|:------:|:----------:|:------:|:-------:|
| **Mock Financial Data**          | **8** | **8**  |   **9**    | **2**  | **288** |
| **Basic Transaction Management** | **7** | **7**  |   **9**    | **2**  | **220** |
| **Basic Spending Insights**      | **8** | **7**  |   **8**    | **3**  | **149** |
| Basic Budget Setup               |   7   |   8    |     8      |   3    |   149   |
| Advanced Budget Management       |   7   |   9    |     7      |   6    |    73   |
| TrueLayer Integration            |   8   |   9    |     8      |   8    |    72   |
| Advanced Financial Analysis      |   8   |   9    |     7      |   7    |    72   |
| Advanced Transaction System      |   7   |   8    |     7      |   6    |    65   |

## Tickets

### **[WELZ-001][Infrastructure] Set up core development environment**

**Description**  
Set up the initial development environment and core infrastructure.

**Details**
- Initialize Deno project
- Set up Fresh framework
- Configure TypeScript
- Set up PostgreSQL database
- Configure Redis instance
- Set up Docker development environment

**Acceptance Criteria**
- Development environment works locally
- Database migrations system in place
- Docker compose configuration ready
- Basic Github Actions CI pipeline configured

**Effort:** M  
**Priority:** High  
**Dependencies:** None

---

### **[WELZ-002][Infrastructure] Set up testing infrastructure**

**Description**  
Set up testing infrastructure for both frontend and backend.

**Details**
- Configure testing frameworks for Deno/Fresh
- Set up E2E testing with Playwright
- Configure test database handling
- Set up test coverage reporting
- Implement CI test automation

**Acceptance Criteria**
- Unit testing framework is configured
- E2E tests can be run locally
- Test database setup/teardown works
- Coverage reports are generated
- Tests run in CI pipeline

**Effort:** M  
**Priority:** High  
**Dependencies:** WELZ-001

---

### **[WELZ-003][Backend] Implement core CQRS infrastructure**

**Description**  
Set up the base CQRS architecture with Effect TS implementation.

**Details**
- Implement command handling infrastructure
- Set up event bus with Redis
- Create base query infrastructure
- Configure Effect TS patterns

**Acceptance Criteria**
- Command handling works end-to-end
- Events are properly published and consumed
- Query infrastructure supports basic operations
- Effect TS patterns are properly implemented

**Effort:** L  
**Priority:** High  
**Dependencies:** WELZ-001

---

### **[WELZ-004][Backend] Set up authentication infrastructure**

**Description**  
Implement basic authentication infrastructure without OAuth providers.

**Details**
- Set up session management
- Implement token service
- Create basic RBAC structure
- Set up audit logging

**Acceptance Criteria**
- Session management works
- Tokens are properly generated and validated
- Basic roles can be assigned
- Security events are logged

**Effort:** M  
**Priority:** High  
**Dependencies:** WELZ-001

---

### **[WELZ-005][Backend] Create mock data structure and API endpoints**

**Description**  
Define and implement the data structure and API endpoints for mock financial data.

**Details**
- Design database schema for accounts and transactions
- Create REST API endpoints for fetching mock data
- Implement data seeding mechanism

**Acceptance Criteria**
- Database schema supports required mock data
- API endpoints return properly formatted JSON
- Mock data matches real-world scenarios

**Effort:** M  
**Priority:** High  
**Dependencies:** None  

---

### **[WELZ-006][Frontend] Implement dashboard layout and components**

**Description**  
Create the main dashboard layout and required components for displaying financial data.

**Details**
- Create reusable dashboard layout
- Implement account summary component
- Implement transaction list component

**Acceptance Criteria**
- Dashboard displays mock account balances
- Transaction list shows paginated data
- Components are responsive

**Effort:** M  
**Priority:** High  
**Dependencies:** WELZ-005

---

### **[WELZ-007][Backend] Implement data normalization service**

**Description**  
Create service to normalize financial data from different sources.

**Details**
- Define unified data model
- Implement transformation logic
- Create validation rules
- Set up error handling

**Acceptance Criteria**
- Data model handles all required fields
- Transformations work correctly
- Validation catches edge cases
- Errors are properly handled and logged

**Effort:** M  
**Priority:** High  
**Dependencies:** WELZ-003

---

### **[WELZ-008][Frontend] Create reusable UI component library**

**Description**  
Develop core UI components needed across the application.

**Details**
- Create basic form components
- Implement data table component
- Design chart components
- Build navigation components

**Acceptance Criteria**
- Components are reusable
- Styling is consistent
- Components are responsive
- Documentation is available

**Effort:** M  
**Priority:** High  
**Dependencies:** None

---

### **[WELZ-009][Backend] Implement transaction CRUD endpoints**

**Description**  
Create API endpoints for basic transaction management.

**Details**
- Design transaction model
- Implement CRUD operations
- Add basic validation

**Acceptance Criteria**
- All CRUD operations work correctly
- Input validation handles edge cases
- Proper error responses

**Effort:** S  
**Priority:** High  
**Dependencies:** WELZ-005

---

### **[WELZ-010][Frontend] Create transaction management interface**

**Description**  
Implement the user interface for transaction management.

**Details**
- Create transaction form component
- Implement transaction list with filtering
- Add edit/delete functionality

**Acceptance Criteria**
- Users can add new transactions
- Transaction list updates in real-time
- Edit and delete operations work correctly

**Effort:** M  
**Priority:** High  
**Dependencies:** WELZ-009

---

### **[WELZ-011][Backend] Implement basic analytics endpoints**

**Description**  
Create endpoints for basic spending insights and statistics.

**Details**
- Implement category-based aggregations
- Create monthly trend calculations
- Add basic statistical endpoints

**Acceptance Criteria**
- Endpoints return correct aggregated data
- Performance is acceptable for large datasets
- Data is properly cached

**Effort:** M  
**Priority:** Mid  
**Dependencies:** WELZ-009

---

### **[WELZ-012][Frontend] Create insights dashboard**

**Description**  
Implement the visualization components for spending insights.

**Details**
- Add charting library integration
- Create category breakdown component
- Implement trends visualization

**Acceptance Criteria**
- Charts display correct data
- Visualizations are interactive
- Components update with new data

**Effort:** M  
**Priority:** Mid  
**Dependencies:** WELZ-011

---

### **[WELZ-013][Backend] Implement event sourcing for transactions**

**Description**  
Set up event sourcing infrastructure for transaction management.

**Details**
- Implement event store
- Create transaction events
- Set up event handlers
- Implement event replay capability

**Acceptance Criteria**
- Events are properly stored
- Transaction history is maintained
- Event replay works correctly
- Performance is acceptable

**Effort:** L  
**Priority:** Mid  
**Dependencies:** WELZ-003

---

### **[WELZ-014][Backend] Create caching infrastructure**

**Description**  
Implement caching strategy for read models.

**Details**
- Set up Redis caching
- Implement cache invalidation
- Create cache warming strategy
- Add monitoring

**Acceptance Criteria**
- Caching improves performance
- Cache invalidation works correctly
- Cache hit rate is monitored
- Cache warming runs automatically

**Effort:** M  
**Priority:** Mid  
**Dependencies:** WELZ-003, WELZ-013

---

### **[WELZ-015][Testing] Create backend unit test suite**

**Description**  
Implement comprehensive unit tests for backend services.

**Details**
- Set up unit test structure
- Create test data factories
- Implement mocking strategy
- Write tests for core services

**Acceptance Criteria**
- Core services have >80% coverage
- Test data factories are reusable
- Mocks are properly implemented
- Tests run in under 2 minutes

**Effort:** M  
**Priority:** High  
**Dependencies:** WELZ-002, WELZ-003

---

### **[WELZ-016][Testing] Create frontend unit test suite**

**Description**  
Implement unit tests for frontend components and services.

**Details**
- Set up component testing
- Implement service mocking
- Create test utilities
- Write tests for core components

**Acceptance Criteria**
- Core components have >80% coverage
- Component tests are isolated
- Service mocks work correctly
- Tests run in under 1 minute

**Effort:** M  
**Priority:** High  
**Dependencies:** WELZ-002, WELZ-008

---

### **[WELZ-017][Testing] Implement E2E test suite**

**Description**  
Create end-to-end tests for critical user journeys.

**Details**
- Set up Playwright configuration
- Create test data seeding
- Implement page objects
- Write core user journey tests

**Acceptance Criteria**
- Critical paths are covered
- Tests are stable and reliable
- Test data is properly managed
- Tests run in under 5 minutes

**Effort:** L  
**Priority:** High  
**Dependencies:** WELZ-002, WELZ-006, WELZ-010

## Ticket Prioritization

| Ticket | Name | Type | Effort | Priority | Dependencies | Score* |
|--------|------|------|---------|-----------|--------------|--------|
| [WELZ-001](#welz-001-infrastructure-set-up-core-development-environment) | Set up core development environment | Infrastructure | M | High | None | 100 |
| [WELZ-002](#welz-002-infrastructure-set-up-testing-infrastructure) | Set up testing infrastructure | Infrastructure | M | High | WELZ-001 | 95 |
| [WELZ-003](#welz-003-backend-implement-core-cqrs-infrastructure) | Implement core CQRS infrastructure | Backend | L | High | WELZ-001 | 90 |
| [WELZ-015](#welz-015-testing-create-backend-unit-test-suite) | Create backend unit test suite | Testing | M | High | WELZ-002, WELZ-003 | 85 |
| [WELZ-005](#welz-005-backend-create-mock-data-structure-and-api-endpoints) | Create mock data structure and API endpoints | Backend | M | High | None | 80 |
| [WELZ-008](#welz-008-frontend-create-reusable-ui-component-library) | Create reusable UI component library | Frontend | M | High | None | 75 |
| [WELZ-016](#welz-016-testing-create-frontend-unit-test-suite) | Create frontend unit test suite | Testing | M | High | WELZ-002, WELZ-008 | 70 |
| [WELZ-006](#welz-006-frontend-implement-dashboard-layout-and-components) | Implement dashboard layout and components | Frontend | M | High | WELZ-005 | 65 |
| [WELZ-009](#welz-009-backend-implement-transaction-crud-endpoints) | Implement transaction CRUD endpoints | Backend | S | High | WELZ-005 | 60 |
| [WELZ-010](#welz-010-frontend-create-transaction-management-interface) | Create transaction management interface | Frontend | M | High | WELZ-009 | 55 |
| [WELZ-017](#welz-017-testing-implement-e2e-test-suite) | Implement E2E test suite | Testing | L | High | WELZ-002, WELZ-006, WELZ-010 | 50 |
| [WELZ-011](#welz-011-backend-implement-basic-analytics-endpoints) | Implement basic analytics endpoints | Backend | M | Mid | WELZ-009 | 45 |
| [WELZ-012](#welz-012-frontend-create-insights-dashboard) | Create insights dashboard | Frontend | M | Mid | WELZ-011 | 40 |
| [WELZ-013](#welz-013-backend-implement-event-sourcing-for-transactions) | Implement event sourcing for transactions | Backend | L | Mid | WELZ-003 | 35 |
| [WELZ-014](#welz-014-backend-create-caching-infrastructure) | Create caching infrastructure | Backend | M | Mid | WELZ-003, WELZ-013 | 30 |
