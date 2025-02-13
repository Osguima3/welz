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

### **[WELZ-003][Backend] Implement core CQRS and Event Bus infrastructure**

**Description**  
Set up the base CQRS architecture with Effect TS implementation and in-memory event bus.

**Details**
- Implement command handling infrastructure
- Create base query infrastructure
- Configure Effect TS patterns
- Set up in-memory event bus with pub/sub
- Configure event handlers

**Acceptance Criteria**
- Command handling works end-to-end
- Events are properly published and consumed
- Query infrastructure supports basic operations
- Event bus handles module communication
- Effect TS patterns are properly implemented

**Effort:** L  
**Priority:** High  
**Dependencies:** WELZ-001

---

### **[WELZ-004][Backend] Create mock data structure and static entities**

**Description**  
Define and implement the data structure for mock financial data with two static entities (Cash and Bank).

**Details**
- Design database schema for accounts and transactions
- Create database migrations
- Implement data seeding for static entities
- Add mock transaction data

**Acceptance Criteria**
- Database schema supports required data
- Static entities are seeded on setup
- Mock data matches real-world scenarios

**Effort:** S  
**Priority:** High  
**Dependencies:** WELZ-003

---

### **[WELZ-005][Frontend] Implement dashboard layout and components**

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
**Dependencies:** WELZ-004

---

### **[WELZ-006][Backend] Implement Transaction API endpoints**

**Description**  
Create comprehensive REST API endpoints for transactions with mock user session.

**Details**
- Set up mock user session middleware
- Implement read endpoints (list, get) with filtering/pagination
- Implement write endpoints (create, update, delete)
- Add input validation and error handling
- Add response caching headers
- Create API documentation

**Acceptance Criteria**
- All endpoints automatically use mock user context
- CRUD operations work correctly with proper validation
- Filtering and pagination work as expected
- Response caching works correctly
- Error responses are consistent
- API documentation is available

**Effort:** L  
**Priority:** High  
**Dependencies:** WELZ-004

---

### **[WELZ-007][Frontend] Create reusable UI component library**

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

### **[WELZ-008][Frontend] Create transaction management interface**

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
**Dependencies:** WELZ-006

---

### **[WELZ-009][Backend] Implement basic analytics endpoints**

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
**Dependencies:** WELZ-006

---

### **[WELZ-010][Frontend] Create insights dashboard**

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
**Dependencies:** WELZ-009

---

### **[WELZ-011][Backend] Implement basic insights endpoints**

**Description**  
Create endpoints for basic financial insights and analytics.

**Details**
- Net worth calculation endpoint
- Monthly spending by category endpoint
- Top spending categories endpoint
- Basic trends endpoints

**Acceptance Criteria**
- Net worth is correctly calculated
- Category breakdowns are accurate
- Trend calculations work properly
- Performance is acceptable

**Effort:** M  
**Priority:** High  
**Dependencies:** WELZ-006

---

### **[WELZ-012][Testing] Create backend unit test suite**

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

### **[WELZ-013][Testing] Create frontend unit test suite**

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
**Dependencies:** WELZ-002, WELZ-007

---

### **[WELZ-014][Testing] Implement E2E test suite**

**Description**  
Implement end-to-end tests for the application.

**Details**
- Set up E2E test structure
- Write tests for core user flows
- Implement test automation
- Integrate with CI pipeline

**Acceptance Criteria**
- Core user flows are covered
- Tests run in CI pipeline
- Test results are reported

**Effort:** L  
**Priority:** High  
**Dependencies:** WELZ-002, WELZ-005, WELZ-008

---

### **[WELZ-015][Documentation] Create OpenAPI documentation**

**Description**  
Create comprehensive API documentation using OpenAPI/Swagger.

**Details**
- Document all endpoints
- Include request/response examples
- Add validation rules
- Document error responses
- Create Swagger UI setup

**Acceptance Criteria**
- OpenAPI spec is complete for all endpoints
- Documentation is accessible via Swagger UI
- All models are properly documented
- Error responses are documented
- Examples are provided for each endpoint

**Effort:** S  
**Priority:** High  
**Dependencies:** WELZ-006

## Ticket Prioritization

| Ticket   | Name | Type | Effort | Priority | Dependencies |
|----------|------|------|---------|-----------|--------------|
| WELZ-001 | Set up core development environment | Infrastructure | M | High | None |
| WELZ-002 | Set up testing infrastructure | Infrastructure | M | High | WELZ-001 |
| WELZ-003 | Implement core CQRS infrastructure | Backend | L | High | WELZ-001 |
| WELZ-012 | Create backend unit test suite | Testing | M | High | WELZ-002, WELZ-003 |
| WELZ-004 | Create mock data structure and static entities | Backend | S | High | WELZ-003 |
| WELZ-007 | Create reusable UI component library | Frontend | M | High | None |
| WELZ-013 | Create frontend unit test suite | Testing | M | High | WELZ-002, WELZ-007 |
| WELZ-005 | Implement dashboard layout and components | Frontend | M | High | WELZ-004 |
| WELZ-006 | Implement Transaction API endpoints | Backend | L | High | WELZ-004 |
| WELZ-008 | Create transaction management interface | Frontend | M | High | WELZ-006 |
| WELZ-014 | Implement E2E test suite | Testing | L | High | WELZ-002, WELZ-005, WELZ-008 |
| WELZ-009 | Implement basic analytics endpoints | Backend | M | Mid | WELZ-006 |
| WELZ-010 | Create insights dashboard | Frontend | M | Mid | WELZ-009 |
| WELZ-011 | Implement basic insights endpoints | Backend | M | High | WELZ-006 |
| WELZ-015 | Create OpenAPI documentation | Documentation | S | High | WELZ-006 |
