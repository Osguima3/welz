# Product Requirements Document

## **Software Description**

### **Overview**  
**Welz** is an AI-driven personal finance platform that unifies **digital and physical financial ecosystems** for individuals and households. By aggregating data from banks, investment platforms, and manual cash transactions, Welz provides a real-time, holistic view of net worth, spending habits, and financial health.  

### **Mission**  
Empower users to master their finances by bridging the gap between digital accounts and physical cash, delivering AI-curated insights, and enabling collaborative financial planning.  

---

## **Added Value**

### **Core Value Proposition**  
* **Comprehensive Financial Picture**  
   - **Unified Aggregation**: Seamlessly integrates bank accounts, credit cards, investments, **cash accounts**, and debts into a single dashboard.  
   - **Physical + Digital**: Track cash transactions alongside digital spending for a complete financial snapshot.  

* **Intelligent Automation**  
   - **AI-Driven Insights**: Automatically categorizes transactions, forecasts trends, and flags anomalies.  
   - **Net Worth Dynamics**: Real-time calculation of assets (liquid funds, investments, cash) vs. liabilities (loans, credit).  

* **Collaborative Finance**  
   - **Shared Budgets**: Households or groups can manage joint expenses with role-based permissions.  
   - **Multi-Currency Support**: Convert and track balances across currencies in a unified view.  

* **Regulatory Compliance**  
   - GDPR and PSD2-compliant architecture with end-to-end encryption and Open Banking integrations.  

---

## **Competitive Advantages**

### **Competitor Comparison**  

| **Feature**               | **Welz**                                    | **Fintonic**               | **Monefy**                  | **Bilance**                 |  
|---------------------------|---------------------------------------------|----------------------------|-----------------------------|-----------------------------|  
| **Institution Coverage**  | 2,000+ (EU-focused, including stock market) | 1,000+ (EU-focused)        | Manual entry only           | 500+ (regional banks)       |  
| **Cash Account Support**  | ✔️ Manual logging or receipt OCR scanning   | ❌                         | ✔️ Basic manual logging     | ❌                         |  
| **AI Insights**           | Predictive analytics + anomaly detection    | Rule-based categorization  | ❌                          | Basic tagging               |  
| **Collaboration**         | Shared budgets & multi-user financials      | Individual-only            | Individual-only             | Individual-only             |  
| **Compliance**            | GDPR, PSD2, Open Banking                    | GDPR-only                  | Minimal                     | GDPR-only                   |  

---

### **Key Differentiators**  
* **Hybrid Account Management**  
   - **Unique Support for Cash**: Log physical transactions with notes or photos. Sync cash balances with digital accounts for true net worth accuracy.

* **Proactive Financial Guardrails**  
   - AI predicts overspending risks and suggests adjustments (e.g., “Reduce dining out by 20% to stay within budget”).

* **Household-Centric Design**  
   - Create shared financial goals (e.g., vacations, mortgages) with contribution tracking and progress visualizations.

* **Open Ecosystem**  
   - APIs for third-party integrations (e.g., tax software, accounting tools) and future SMB modules (e.g., invoicing).

---

## **Lean Canvas**  

| **Section**            | **Details**                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| **Problem**            | 1. Fragmented financial data across banks, stock brokers, and cash.<br>2. Lack of unified net worth tracking for EU users with multi-institution portfolios.<br>3. Manual transaction categorization and limited insights for stock market investments. |
| **Solution**           | 1. Aggregate EU banks, stock brokers (e.g., Degiro, eToro), and cash accounts.<br>2. Real-time net worth dashboard with stock holdings valuation.<br>3. AI-driven categorization and trend analysis for stocks/transactions. |
| **Key Metrics**        | - Number of connected institutions per user.<br>- % of users adopting AI suggestions.<br>- Average net worth accuracy improvement. |
| **Unique Value Proposition** | *“The only platform that unifies banking, stock trading, and cash management with AI-powered financial intelligence.”* |
| **Unfair Advantage**   | 1. Hybrid aggregation (Open Banking + stock APIs + cash tracking).<br>2. Proprietary AI trained on EU-specific financial behavior.<br>3. GDPR/PSD2 compliance by design. |
| **Customer Segments**  | **Primary**: EU individuals with diversified portfolios (stocks, savings, cash).<br>**Secondary**: Households/families managing shared expenses and long-term goals. |
| **Channels**           | 1. Web/App Store/Play Store.<br>2. Partnerships with EU fintechs/stock brokers.<br>3. Finance-focused social media (YouTube, LinkedIn). |
| **Cost Structure**     | - TrueLayer API subscription<br>- Deno Deploy infrastructure<br>- AI/ML model training<br>- Compliance/audit costs. |
| **Revenue Streams**    | - **Freemium**: Free tier (basic features).<br>- **Subscription**: Premium tier (advanced analytics, shared budgets). |

---

## **Use Cases**  

### **Use Case 1: Categorize New Transactions**  
**Description**:  
Automatically categorizes new transactions from **manual cash entries** or **synced financial accounts** using AI suggestions, allowing users to refine labels.  

**Flow**:  
1. **Transaction Source**:  
   - **Manual Cash Entry**: User inputs amount, date, and notes.  
   - **Synced Account**: Aggregator imports transactions from connected accounts.  
2. **AI Suggestion**: AI model suggests a category (e.g., "Groceries" for a transaction at "Lidl").  
3. **User Review**:  
   - **Accept**: Transaction is saved with the AI-suggested category.  
   - **Reject**: User edits the category (e.g., changes "Entertainment" to "Dining").  
4. **Data Update**:  
   - Categorized transactions update the net worth dashboard and category analytics.  

**Diagram**:  
```plantuml
@startuml
[New Transaction] --> [Source]
[Source] --> [User Inputs Amount, Date, Notes] : Manual Cash Entry
[Source] --> [Aggregator Imports Data] : Synced Account
[User Inputs Amount, Date, Notes] --> [AI Suggests Category]
[Aggregator Imports Data] --> [AI Suggests Category]
[AI Suggests Category] --> [User Review]
[User Review] --> [Save Categorized Transaction] : Accept
[User Review] --> [User Edits Category] : Reject
[User Edits Category] --> [Save Categorized Transaction]
[Save Categorized Transaction] --> [Update Net Worth & Category Analytics]
@enduml
```  

---

### **Use Case 2: View Financial Insights Dashboard**  
**Description**:  
Displays real-time net worth, monthly income/expenses, stock portfolio performance, and AI-predicted end-of-month (EOM) financial status.  

**Flow**:  
1. **Fetch Data**:  
   - Aggregates balances from connected accounts (bank, stocks, cash).  
   - Fetches transactions for the current month.  
2. **Calculate Metrics**:  
   - **Net Worth**: Assets (cash + stocks + bank) – Liabilities (loans + credit).  
   - **Current Month Expenses/Income**: Sum of categorized transactions.  
   - **Portfolio Change**: % change in stock holdings.  
   - **EOM Prediction**: Projects net worth based on current spending/income trends.  
3. **Display Dashboard**:  
   - Visualizes trends (line/pie charts).  
   - Highlights overspending alerts or portfolio risks.  

**Diagram**:  
```plantuml
@startuml
[User Opens Dashboard] --> [Fetch Balances & Transactions]
[Fetch Balances & Transactions] --> [Calculate Net Worth]
[Fetch Balances & Transactions] --> [Sum Monthly Expenses/Income]
[Fetch Balances & Transactions] --> [Compute Portfolio Change]
[Fetch Balances & Transactions] --> [Predict EOM Net Worth]
[Calculate Net Worth] --> [Display Dashboard with Charts/Alerts]
[Sum Monthly Expenses/Income] --> [Display Dashboard with Charts/Alerts]
[Compute Portfolio Change] --> [Display Dashboard with Charts/Alerts]
[Predict EOM Net Worth] --> [Display Dashboard with Charts/Alerts]
[Display Dashboard with Charts/Alerts] --> [Drill Down: Adjust Forecast Assumptions]
@enduml
```  

---

### **Use Case 3: Analyze Per-Category Expenses & Income**  
**Description**:  
Drill down into specific categories (e.g., "Groceries", "Salary") to analyze spending patterns and income sources.  

**Flow**:  
1. **Select Category**: User chooses a category from the dashboard.  
2. **Fetch Transactions**: Retrieves all transactions in the selected category.  
3. **Display Analytics**:  
   - **Trends**: Weekly/monthly spending/income.  
   - **Top Merchants**: Most frequent payees (e.g., "Lidl" for Groceries).  
   - **Budget Comparison**: Placeholder for future budget integration.  

**Diagram**:  
```plantuml
@startuml
[User Selects Category] --> [Fetch Transactions in Category]
[Fetch Transactions in Category] --> [Calculate Trends: Weekly/Monthly]
[Fetch Transactions in Category] --> [Identify Top Merchants]
[Fetch Transactions in Category] --> [Compare vs. Budget]
[Calculate Trends: Weekly/Monthly] --> [Display Category Breakdown]
[Identify Top Merchants] --> [Display Category Breakdown]
[Compare vs. Budget] --> [Display Category Breakdown]
@enduml
```
