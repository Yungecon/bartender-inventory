# Requirements Document

## Introduction

The Bartender Inventory System is a comprehensive inventory management solution designed to be "a bartender's best friend." Built around a relational database architecture, the system streamlines inventory counting, invoice processing, and provides AI-powered insights about ingredients and cocktail recommendations. The primary goal is to help bars track inventory efficiently, reduce waste through overstock management, and educate staff about products and cocktail creation.

The system emphasizes practical usability over perfect precision, recognizing that bars operate with inherent variability due to spillage, off-menu decisions, and the dynamic nature of bartending. Rather than attempting to track every ounce, the system focuses on providing valuable insights, workflow acceleration, and inventory assistance that works for bars of all sizes and operational intensities.

**Architecture Approach:** The system follows SLC (System-Logic-Components) methodology, treating all features as interconnected nodes in a living, relational system. Each component maintains clear boundaries while sharing data through a unified PostgreSQL schema with real-time synchronization.

**Technology Stack:** Next.js + TypeScript full-stack application, PostgreSQL database (Supabase), Prisma ORM, tRPC for type-safe APIs, passwordless authentication, Tailwind CSS, and serverless background jobs for AI processing.

Key system components include voice-activated inventory counting, automated data processing from various POS systems, AI-powered ingredient research, dual chatbot systems (staff training and inventory management), comprehensive export capabilities for accounting workflows, and intelligent reorder orchestration.

## Requirements

### Requirement 1: Voice-Activated Inventory Counting

**User Story:** As a bartender taking inventory, I want to count items out loud and have the system automatically populate inventory numbers in the appropriate location columns, so that I can perform hands-free inventory counting while visually inspecting bottles.

#### Acceptance Criteria

1. WHEN a user speaks inventory counts THEN the system SHALL automatically populate numbers in the correct location columns (hobbit, bar, cabinet)
2. WHEN a value is entered in a cell THEN the system SHALL read back the entered value for confirmation
3. WHEN inventory counting is complete THEN the system SHALL provide a submit button to finalize the count
4. WHEN the submit button is pressed THEN the system SHALL populate final inventory count and value into the 12-month tracking sheet

### Requirement 2: Excel Export Functionality

**User Story:** As an accountant or business owner, I want to export inventory data to Excel format, so that I can use the data with existing accounting workflows and share it with external parties.

#### Acceptance Criteria

1. WHEN a user requests an export THEN the system SHALL generate an Excel-compatible spreadsheet
2. WHEN exporting inventory data THEN the system SHALL include supplier information, costs, bottle sizes, and inventory dates
3. WHEN generating exports THEN the system SHALL maintain data formatting that is usable by accounting software

### Requirement 3: AI Ingredient Analysis and Tagging

**User Story:** As a bar manager, I want the system to automatically research and tag new ingredients with detailed information, so that my staff can learn about products and make better recommendations to customers.

#### Acceptance Criteria

1. WHEN a new ingredient is added THEN the system SHALL automatically scrape relevant information about the ingredient
2. WHEN displaying ingredient information THEN the system SHALL show flavor profile, origin, production history, company background, and cultural significance
3. WHEN presenting ingredient data THEN the system SHALL structure information in separate, clearly labeled sections
4. WHEN ingredient information is gathered THEN the system SHALL store it for future staff training purposes

### Requirement 4: Multi-Location Inventory Tracking

**User Story:** As a bartender, I want to track inventory across multiple storage locations (hobbit, cabinets, bar), so that I can get accurate total counts and values for all our products.

#### Acceptance Criteria

1. WHEN counting inventory THEN the system SHALL support separate counts for hobbit, cabinet, and bar locations
2. WHEN all locations are counted THEN the system SHALL aggregate totals for both bottle count and total inventory value
3. WHEN displaying inventory THEN the system SHALL show both individual location counts and combined totals

### Requirement 5: Invoice Processing and Data Standardization

**User Story:** As a bar manager, I want to upload invoices from different suppliers and have the system automatically extract and standardize the data, so that I don't have to manually enter or reformat information.

#### Acceptance Criteria

1. WHEN an invoice is uploaded THEN the system SHALL extract relevant product information regardless of supplier format
2. WHEN processing invoices THEN the system SHALL identify case prices, individual item costs, and product details
3. WHEN invoice data is processed THEN the system SHALL update the master inventory list with current pricing
4. WHEN price changes are detected THEN the system SHALL update costs in the master inventory automatically
5. WHEN standardizing data THEN the system SHALL convert various supplier formats into a consistent internal structure

### Requirement 6: 12-Month Inventory Tracking

**User Story:** As a business owner, I want to maintain 12 months of inventory data for each product, so that I can track cost changes over time and perform annual inventory accounting.

#### Acceptance Criteria

1. WHEN inventory is submitted THEN the system SHALL create monthly entries for each product
2. WHEN storing monthly data THEN the system SHALL capture inventory count, value, and cost at time of submission
3. WHEN displaying historical data THEN the system SHALL show 12 entries per product representing each month
4. WHEN analyzing trends THEN the system SHALL identify unusual patterns or potential errors in inventory data

### Requirement 7: Staff Training Chatbot

**User Story:** As a bartender or server, I want access to an educational chatbot that provides information about products and cocktail recommendations, so that I can better serve customers and learn about our inventory.

#### Acceptance Criteria

1. WHEN staff access the training bot THEN the system SHALL provide educational information about recent popular products
2. WHEN requesting product information THEN the system SHALL share details about flavor profiles, history, and usage recommendations
3. WHEN analyzing sales trends THEN the system SHALL identify products that are moving quickly and provide related education
4. WHEN staff need cocktail guidance THEN the system SHALL suggest recipes and ingredient combinations based on available inventory

### Requirement 8: Inventory Management Chatbot

**User Story:** As a bar manager, I want an inventory-focused chatbot that suggests specials based on overstock and provides recommendations for moving slow inventory, so that I can reduce waste and optimize inventory turnover.

#### Acceptance Criteria

1. WHEN products are marked as overstock THEN the system SHALL suggest cocktail recipes that utilize those ingredients
2. WHEN requesting inventory recommendations THEN the system SHALL provide suggestions based on current stock levels
3. WHEN analyzing inventory tags THEN the system SHALL categorize products as core, common, overstock, or specialty items
4. WHEN suggesting specials THEN the system SHALL consider the bar's program profile and sustainability focus

### Requirement 9: Restaurant Profile Management

**User Story:** As a bar program manager, I want to input and maintain information about our restaurant's beverage program and philosophy, so that AI recommendations align with our brand and concept.

#### Acceptance Criteria

1. WHEN entering restaurant information THEN the system SHALL accept details about beverage program vision, sustainability focus, and concept
2. WHEN raw information is provided THEN the system SHALL offer a "magic refresh" button to restructure input into useful formats
3. WHEN storing program information THEN the system SHALL maintain details about mocktail menus, farm-to-bar practices, and wellness focus
4. WHEN making recommendations THEN the system SHALL consider the restaurant's specific program profile and values

### Requirement 10: POS Integration and Data Processing

**User Story:** As a bar manager, I want the system to read and process data from various POS systems (Toast, Micros), so that I can automatically import sales data without manual formatting or data entry.

#### Acceptance Criteria

1. WHEN POS data is imported THEN the system SHALL read different table formats from various POS systems
2. WHEN processing POS data THEN the system SHALL extract only relevant information for inventory purposes
3. WHEN standardizing POS data THEN the system SHALL convert raw data into the system's structured format
4. WHEN importing sales data THEN the system SHALL require minimal user intervention or data modification

### Requirement 11: Master Inventory List Management

**User Story:** As a bar manager, I want to maintain a master inventory list with current pricing and product details, so that I have a clean, up-to-date reference for all ingredients and their latest costs.

#### Acceptance Criteria

1. WHEN maintaining the master list THEN the system SHALL store only the most current price for each ingredient
2. WHEN invoice data updates pricing THEN the system SHALL automatically update the master inventory list
3. WHEN displaying master inventory THEN the system SHALL show clean, current information without historical pricing
4. WHEN managing ingredients THEN the system SHALL maintain supplier information, bottle sizes, and product specifications

### Requirement 12: Product Categorization and Tagging System

**User Story:** As a bartender, I want products automatically categorized with tags like "core," "common," "overstock," and "program," so that I can quickly understand how each ingredient fits into our bar operations.

#### Acceptance Criteria

1. WHEN categorizing products THEN the system SHALL assign tags including core (menu items), common (regularly used), overstock, and program-specific categories
2. WHEN analyzing usage patterns THEN the system SHALL automatically suggest appropriate tags based on frequency and menu inclusion
3. WHEN displaying inventory THEN the system SHALL show relevant tags for quick identification
4. WHEN managing categories THEN the system SHALL allow manual tag adjustments and custom category creation

### Requirement 13: Trend Analysis and Industry Integration

**User Story:** As a bar manager, I want the system to analyze trends and integrate industry news from sources like Imbibe, so that I can stay informed about market movements and popular products.

#### Acceptance Criteria

1. WHEN analyzing sales data THEN the system SHALL identify trending products and movement patterns
2. WHEN integrating industry data THEN the system SHALL pull relevant information from restaurant and beverage industry sources
3. WHEN presenting trends THEN the system SHALL highlight products moving quickly and suggest related opportunities
4. WHEN providing industry insights THEN the system SHALL connect external trends to current inventory and sales patterns

### Requirement 14: Worksheet Functionality for Inventory Counting

**User Story:** As someone taking inventory, I want a temporary worksheet that helps me organize counting across locations without saving unnecessary data, so that I can efficiently complete inventory tasks with location-specific information.

#### Acceptance Criteria

1. WHEN using the worksheet THEN the system SHALL provide temporary storage for inventory counting that doesn't persist after submission
2. WHEN counting across locations THEN the system SHALL organize data by hobbit, cabinet, and bar areas
3. WHEN completing counts THEN the system SHALL aggregate location data into final totals
4. WHEN submitting worksheet data THEN the system SHALL transfer only final counts and values to permanent storage
5. WHEN displaying worksheet information THEN the system SHALL show location-specific details that assist with inventory organization

### Requirement 15: Intelligent Reorder Orchestration

**User Story:** As a bar manager, I want the system to automatically generate vendor-specific reorder emails when inventory falls below par levels, so that I can maintain optimal stock levels without manual tracking and communication.

#### Acceptance Criteria

1. WHEN inventory levels fall below par_level THEN the system SHALL automatically compute shortfall quantities
2. WHEN generating reorder quantities THEN the system SHALL use last purchased quantity or default_reorder_qty as fallback
3. WHEN creating reorder drafts THEN the system SHALL group items by supplier and use vendor-specific email templates
4. WHEN preparing communications THEN the system SHALL queue drafts in an outbox requiring human approval by default
5. WHEN suppliers have auto_send_policy enabled THEN the system SHALL automatically send orders within business hours
6. WHEN generating reorder emails THEN the system SHALL deduplicate against recent orders within configurable timeframe
7. WHEN sending reorder communications THEN the system SHALL log all email sends with payload hash and recipients for audit trail

### Requirement 16: Email Template and Communication Management

**User Story:** As a bar manager, I want to customize email templates for different suppliers and manage communication preferences, so that reorder requests are professional and supplier-specific.

#### Acceptance Criteria

1. WHEN managing suppliers THEN the system SHALL store contact information, email addresses, and CC recipients
2. WHEN configuring communications THEN the system SHALL allow custom email templates per supplier
3. WHEN creating templates THEN the system SHALL support dynamic variables for product lists, quantities, and context
4. WHEN managing communication preferences THEN the system SHALL allow per-supplier auto-send policies
5. WHEN reviewing outbox THEN the system SHALL display editable additional context fields for each draft
6. WHEN sending emails THEN the system SHALL integrate with SMTP services and handle delivery confirmations

### Requirement 17: Security and Access Control

**User Story:** As a business owner, I want role-based access control and audit logging, so that I can ensure appropriate access levels and maintain accountability for system actions.

#### Acceptance Criteria

1. WHEN managing users THEN the system SHALL support Admin, Manager, and Staff role levels
2. WHEN accessing features THEN the system SHALL enforce role-based permissions for sensitive operations
3. WHEN processing uploads THEN the system SHALL validate file types, sizes, and include security scanning hooks
4. WHEN making external API calls THEN the system SHALL implement rate limiting and error handling
5. WHEN logging activities THEN the system SHALL maintain audit trails for all email sends and critical operations

### Requirement 18: Deployment and Integration Requirements

**User Story:** As a developer, I want the system deployed on modern cloud infrastructure with CI/CD integration, so that updates are reliable and the system is scalable.

#### Acceptance Criteria

1. WHEN deploying the application THEN the system SHALL be compatible with Vercel (primary) and Netlify (fallback)
2. WHEN integrating with version control THEN the system SHALL connect to GitHub for automated CI/CD workflows
3. WHEN managing environments THEN the system SHALL use platform environment variables for secrets and configuration
4. WHEN running background jobs THEN the system SHALL utilize serverless functions and edge computing capabilities
5. WHEN scaling the application THEN the system SHALL handle concurrent users and background processing efficiently