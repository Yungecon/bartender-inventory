# Implementation Plan

- [x] 1. Project Setup and Core Infrastructure
  - Initialize Next.js 14+ project with TypeScript and essential dependencies
  - Configure Supabase integration with environment variables and client setup
  - Set up Prisma ORM with PostgreSQL schema and migration system
  - Configure tRPC with type-safe API routes and client-side integration
  - Set up Tailwind CSS with component library (shadcn/ui) and responsive design system
  - _Requirements: 18.1, 18.2, 18.3_

- [x] 1.1 Database Schema Implementation
  - Create Prisma schema with all core models (Ingredient, Supplier, Location, InventorySnapshot, Invoice, InvoiceLine, ReorderDraft, EmailTemplate, RestaurantProfile)
  - Implement database relationships and constraints with proper indexing
  - Set up Supabase Row Level Security policies for role-based access control
  - Create initial database migration and seed script with sample data structure
  - _Requirements: 11.1, 11.2, 17.1, 17.2_

- [x] 1.2 Write unit tests for database models and relationships
  - Create test utilities for Prisma operations and data validation
  - Write tests for model relationships and constraint validation
  - _Requirements: 11.1, 11.2_

- [ ] 2. Authentication and Authorization System
  - Implement Supabase Auth integration with passwordless magic link authentication
  - Create role-based access control middleware for Admin/Manager/Staff roles
  - Set up protected route guards and permission checking utilities
  - Build user management interface for role assignment and access control
  - _Requirements: 17.1, 17.2_

- [ ] 2.1 User Interface Components
  - Create login page with magic link authentication flow
  - Build user management dashboard for admin role assignment
  - Implement role-based navigation and feature access controls
  - _Requirements: 17.1, 17.2_

- [ ] 2.2 Write authentication and authorization tests
  - Test magic link authentication flow and session management
  - Verify role-based access control and permission enforcement
  - _Requirements: 17.1, 17.2_

- [x] 3. Core Ingredient and Supplier Management
  - Implement Ingredient CRUD operations with validation and error handling
  - Create Supplier management system with contact information and communication preferences
  - Build master inventory list interface with current pricing and product specifications
  - Implement product categorization and tagging system (core, common, overstock, program)
  - _Requirements: 11.1, 11.2, 11.3, 12.1, 12.2, 12.3_

- [x] 3.1 Ingredient Management UI
  - Create ingredient list view with filtering, sorting, and search functionality
  - Build ingredient creation and editing forms with validation
  - Implement tag management interface with automatic and manual categorization
  - Create supplier management interface with contact and template configuration
  - _Requirements: 11.4, 12.1, 12.2, 12.4_

- [x] 3.2 Write unit tests for ingredient and supplier operations
  - Test CRUD operations and data validation for ingredients and suppliers
  - Verify tagging system logic and categorization algorithms
  - _Requirements: 11.1, 12.1, 12.2_

- [x] 4. Multi-Location Inventory Tracking System
  - Implement Location model and management for hobbit, cabinet, and bar areas
  - Create InventorySnapshot system for time-series inventory data storage
  - Build inventory aggregation logic for multi-location totals and values
  - Implement 12-month historical tracking with monthly entry creation
  - _Requirements: 4.1, 4.2, 4.3, 6.1, 6.2, 6.3_

- [x] 4.1 Inventory History Interface
  - Create 12-month inventory view with historical data visualization
  - Build location-specific inventory displays with aggregated totals
  - Implement trend analysis interface showing inventory patterns over time
  - _Requirements: 4.3, 6.3, 6.4_

- [ ]* 4.2 Write tests for inventory tracking and aggregation
  - Test multi-location inventory calculations and aggregation logic
  - Verify 12-month historical data storage and retrieval
  - _Requirements: 4.1, 4.2, 6.1, 6.2_

- [x] 4.3 Foundation Code Review and Cleanup Phase
  - Review tasks 1-4 for code consistency and remove any temporary files
  - Update all import statements and ensure proper TypeScript integration
  - Verify database relationships work correctly across all models
  - Clean up any unused dependencies or development artifacts
  - _Requirements: 1.1, 11.1, 4.1_

- [ ] 5. Voice-Activated Inventory Counting System
  - Integrate speech recognition API (Whisper) for voice input processing
  - Implement text-to-speech confirmation system for entered values
  - Create mobile-first worksheet interface with voice controls and visual feedback
  - Build inventory submission system that populates InventorySnapshot records
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 5.1 Voice Interface Components
  - Create VoiceRecorder component with microphone access and audio processing
  - Build ConfirmationReader component for text-to-speech value confirmation
  - Implement WorksheetGrid component with location-specific counting interface
  - Create hands-free navigation and submission controls
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 5.2 Write tests for voice recognition and confirmation systems
  - Test speech-to-text accuracy and error handling
  - Verify text-to-speech confirmation functionality
  - _Requirements: 1.1, 1.2_

- [ ] 6. Worksheet Functionality for Temporary Counting
  - Implement temporary worksheet storage that doesn't persist after submission
  - Create location-specific counting interface (hobbit, cabinet, bar)
  - Build aggregation system for combining location counts into final totals
  - Implement submission workflow that transfers data to permanent InventorySnapshot storage
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 6.1 Worksheet User Interface
  - Create temporary counting interface with location organization
  - Build submission confirmation dialog with aggregated totals preview
  - Implement worksheet reset and clear functionality
  - _Requirements: 14.1, 14.2, 14.3_

- [ ]* 6.2 Write tests for worksheet functionality and data flow
  - Test temporary storage and submission workflow
  - Verify location aggregation and final total calculations
  - _Requirements: 14.1, 14.3, 14.4_

- [ ] 7. Invoice Processing and OCR System
  - Integrate OCR service (Tesseract/Vision API) for invoice text extraction
  - Implement invoice upload system with file validation and security scanning
  - Create data standardization engine for various supplier invoice formats
  - Build price delta detection system with threshold-based approval workflow
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 7.1 Invoice Processing Interface
  - Create invoice upload interface with drag-and-drop functionality
  - Build OCR results review and correction interface
  - Implement price delta review queue with approval/rejection controls
  - Create invoice processing status tracking and error handling
  - _Requirements: 5.1, 5.2, 5.4_

- [ ]* 7.2 Write tests for OCR processing and data standardization
  - Test invoice text extraction accuracy and error handling
  - Verify price delta detection and approval workflow
  - _Requirements: 5.1, 5.3, 5.4_

- [ ] 8. POS Integration and Data Processing
  - Implement file import system for Toast, Micros, and other POS exports
  - Create data normalization engine for various POS table formats
  - Build product mapping system to link POS items with inventory ingredients
  - Implement sales data processing for trend analysis and chatbot insights
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 8.1 POS Integration Interface
  - Create POS file upload interface with format detection
  - Build product mapping interface for linking POS items to ingredients
  - Implement import status tracking and error reporting
  - _Requirements: 10.1, 10.3, 10.4_

- [ ]* 8.2 Write tests for POS data processing and normalization
  - Test various POS format parsing and standardization
  - Verify product mapping accuracy and data integrity
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 9. Excel and CSV Export System
  - Implement Excel export functionality with accounting-ready formatting
  - Create CSV export system with customizable column selection
  - Build export configuration interface for date ranges and data filtering
  - Implement scheduled export functionality for automated reporting
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 9.1 Export Interface and Configuration
  - Create export builder interface with format and filter options
  - Build export history tracking and download management
  - Implement export scheduling and automated delivery system
  - _Requirements: 2.1, 2.2_

- [ ]* 9.2 Write tests for export functionality and data formatting
  - Test Excel and CSV generation with various data sets
  - Verify export formatting and accounting software compatibility
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 9.3 Input Systems Code Review and Cleanup Phase
  - Review tasks 5-9 for code consistency and remove temporary processing files
  - Update all API endpoints to ensure consistent error handling
  - Verify voice interface components work across different browsers
  - Clean up upload directories and temporary OCR processing files
  - _Requirements: 1.1, 5.1, 2.1_

- [ ] 10. AI Ingredient Tagging and Enrichment System
  - Integrate LLM API for automatic ingredient research and profile generation
  - Implement background job system for processing new ingredients
  - Create structured metadata storage for flavor profiles, origin, and cultural information
  - Build ingredient profile display interface with educational content organization
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 10.1 AI Integration and Profile Management
  - Create LLM adapter interface for pluggable AI service integration
  - Build ingredient profile editing interface for manual corrections
  - Implement background job queue for AI processing with error handling
  - _Requirements: 3.1, 3.3, 3.4_

- [ ]* 10.2 Write tests for AI integration and profile generation
  - Test LLM API integration and response processing
  - Verify ingredient profile storage and retrieval
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 11. Staff Training Chatbot System
  - Implement educational chatbot with ingredient knowledge and cocktail recommendations
  - Create conversation interface with product information and usage suggestions
  - Build integration with ingredient profiles and sales trend data
  - Implement restaurant profile integration for personalized recommendations
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 11.1 Training Bot Interface and Logic
  - Create chat interface with message history and conversation management
  - Build recommendation engine using ingredient profiles and sales data
  - Implement restaurant profile integration for contextual suggestions
  - _Requirements: 7.1, 7.2, 7.4_

- [ ]* 11.2 Write tests for chatbot logic and recommendation system
  - Test conversation flow and response generation
  - Verify recommendation accuracy and contextual relevance
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 12. Inventory Management Chatbot System
  - Implement overstock detection and special recommendation system
  - Create cocktail recipe suggestions based on available inventory and tags
  - Build integration with reorder orchestrator for inventory optimization
  - Implement bar program profile consideration for recommendation personalization
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 12.1 Inventory Bot Logic and Recommendations
  - Create overstock analysis engine with recipe suggestion algorithms
  - Build inventory optimization recommendations based on usage patterns
  - Implement integration with restaurant profile for brand-aligned suggestions
  - _Requirements: 8.1, 8.2, 8.4_

- [ ]* 12.2 Write tests for inventory analysis and recommendation logic
  - Test overstock detection and recipe suggestion algorithms
  - Verify inventory optimization recommendations and accuracy
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 13. Intelligent Reorder Orchestration System
  - Implement par level monitoring and below-threshold detection system
  - Create automated reorder quantity calculation using purchase history
  - Build supplier-grouped reorder draft generation with email template integration
  - Implement outbox management system with human approval workflow
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.6_

- [ ] 13.1 Reorder Management Interface
  - Create par level configuration interface for ingredient management
  - Build reorder outbox with draft editing and approval controls
  - Implement supplier-specific reorder draft organization and management
  - _Requirements: 15.1, 15.3, 15.4_

- [ ] 13.2 Write tests for reorder calculation and draft generation
  - Test par level monitoring and shortage detection algorithms
  - Verify reorder quantity calculations and supplier grouping logic
  - _Requirements: 15.1, 15.2, 15.3_

- [ ] 14. Email Template and Communication System
  - Implement email template management with dynamic variable support
  - Create SMTP integration for automated and manual email sending
  - Build supplier communication preference management (auto-send policies)
  - Implement email audit logging with delivery confirmation tracking
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 15.5, 15.7_

- [ ] 14.1 Email Management Interface
  - Create email template editor with variable insertion and preview
  - Build email sending interface with recipient management and scheduling
  - Implement email audit log with delivery status and payload tracking
  - _Requirements: 16.2, 16.3, 16.5, 15.7_

- [ ]* 14.2 Write tests for email template system and delivery
  - Test email template rendering and variable substitution
  - Verify SMTP integration and delivery confirmation handling
  - _Requirements: 16.2, 16.4, 16.6_

- [ ] 15. Restaurant Profile Management System
  - Implement restaurant profile storage with flexible attribute system
  - Create "Magic Refresh" functionality using LLM for profile structuring
  - Build profile editing interface with sustainability and program focus
  - Implement profile integration across chatbot and recommendation systems
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 15.1 Profile Management Interface
  - Create restaurant profile editing interface with structured input fields
  - Build "Magic Refresh" button with LLM integration for profile enhancement
  - Implement profile preview and validation system
  - _Requirements: 9.1, 9.2, 9.3_

- [ ]* 15.2 Write tests for profile management and LLM integration
  - Test profile data validation and storage
  - Verify "Magic Refresh" functionality and LLM response processing
  - _Requirements: 9.1, 9.2, 9.4_

- [ ] 16. Trend Analysis and Industry Integration
  - Implement sales trend analysis using POS data and inventory snapshots
  - Create industry data integration placeholders for external feed processing
  - Build trend visualization interface with movement pattern identification
  - Implement trend-based insights for chatbot and recommendation systems
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 16.1 Trend Analysis Interface
  - Create trend dashboard with visual charts and movement indicators
  - Build trend-based alert system for unusual inventory patterns
  - Implement trend integration with chatbot recommendation engines
  - _Requirements: 13.1, 13.3, 13.4_

- [ ]* 16.2 Write tests for trend analysis and pattern detection
  - Test trend calculation algorithms and pattern recognition
  - Verify trend-based recommendation accuracy and relevance
  - _Requirements: 13.1, 13.2, 13.3_

- [ ] 16.3 AI and Configuration Systems Code Review and Cleanup Phase
  - Review tasks 10-16 for code consistency and remove temporary AI processing files
  - Update all AI adapter interfaces to ensure consistent error handling
  - Verify chatbot responses align with restaurant profile settings
  - Clean up background job artifacts and ensure proper async error recovery
  - _Requirements: 3.1, 7.1, 8.1, 9.1, 13.1_

- [ ] 17. Security Implementation and Audit System
  - Implement comprehensive audit logging for all critical operations
  - Create file upload security with type validation and virus scanning hooks
  - Build rate limiting system for external API calls and user actions
  - Implement data encryption and secure storage for sensitive information
  - _Requirements: 17.3, 17.4, 17.5_

- [ ] 17.1 Security and Audit Interface
  - Create audit log viewer with filtering and search capabilities
  - Build security configuration interface for rate limits and file restrictions
  - Implement security monitoring dashboard with alert system
  - _Requirements: 17.3, 17.5_

- [ ]* 17.2 Write security tests and vulnerability assessments
  - Test file upload security and validation systems
  - Verify rate limiting and audit logging functionality
  - _Requirements: 17.3, 17.4, 17.5_

- [ ] 18. Deployment and CI/CD Configuration
  - Configure Vercel deployment with environment variable management
  - Set up GitHub Actions for automated testing, building, and deployment
  - Implement database migration system for production deployments
  - Create monitoring and error tracking for production environment
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [ ] 18.1 Production Configuration and Monitoring
  - Create production environment configuration with secrets management
  - Build deployment monitoring dashboard with health checks
  - Implement error tracking and performance monitoring integration
  - _Requirements: 18.1, 18.4, 18.5_

- [ ]* 18.2 Write deployment and integration tests
  - Test CI/CD pipeline functionality and deployment process
  - Verify production configuration and environment setup
  - _Requirements: 18.2, 18.3, 18.4_

- [ ] 18.3 Security and Deployment Code Review and Cleanup Phase
  - Review tasks 17-18 for security implementation and remove temporary security files
  - Update all authentication and authorization implementations for consistency
  - Verify audit logging works across all critical operations
  - Clean up deployment artifacts and ensure proper environment configuration
  - _Requirements: 17.1, 17.3, 18.1_

- [ ] 19. Foundation Debugging and Code Consistency Phase
  - Review and debug all foundation code (tasks 1-4) for consistency and completeness
  - Update all import statements and type definitions across foundation files
  - Remove temporary files, unused imports, and development artifacts
  - Ensure database schema consistency across all model references
  - Verify authentication integration works across all protected routes
  - Run comprehensive linting and type checking on foundation codebase
  - _Requirements: 18.1, 17.1, 11.1_

- [ ] 20. Foundation Design Push and Review Phase
  - Deploy foundation components (auth, database, core CRUD) to preview environment
  - Create basic UI for ingredient and supplier management for visual testing
  - Test authentication flow and role-based access in deployed environment
  - Document any issues found and create fix list for next debugging phase
  - _Requirements: 18.1, 17.1, 3.1_

- [ ] 21. Input Systems Debugging and Code Consistency Phase
  - Review and debug voice interface, worksheet, and processing systems (tasks 5-8)
  - Update all API endpoints to ensure consistent error handling and validation
  - Remove temporary processing files and clean up upload directories
  - Ensure OCR and POS integration adapters have consistent interfaces
  - Verify voice recognition components work across different browsers/devices
  - Update all component imports and ensure proper TypeScript integration
  - _Requirements: 1.1, 5.1, 10.1, 14.1_

- [ ] 22. Input Systems Design Push and Review Phase
  - Deploy voice counting interface and invoice processing to preview environment
  - Test voice recognition and worksheet functionality on mobile devices
  - Verify invoice upload and OCR processing works with sample files
  - Test POS integration with sample data files from different systems
  - Document user experience issues and performance bottlenecks
  - _Requirements: 1.1, 5.1, 10.1, 14.1_

- [ ] 23. AI and Automation Systems Debugging and Code Consistency Phase
  - Review and debug AI services, chatbots, and reorder systems (tasks 9-14)
  - Update all AI adapter interfaces to ensure consistent error handling
  - Remove temporary AI processing files and clean up background job artifacts
  - Ensure email template system has consistent variable substitution across all templates
  - Verify chatbot responses are consistent with restaurant profile settings
  - Update all async job handlers and ensure proper error recovery
  - _Requirements: 3.1, 7.1, 8.1, 15.1, 16.1_

- [ ] 24. AI and Automation Design Push and Review Phase
  - Deploy chatbot interfaces and reorder management to preview environment
  - Test AI ingredient tagging with real product data
  - Verify email template generation and sending functionality
  - Test chatbot conversations and recommendation accuracy
  - Evaluate reorder draft generation and approval workflow
  - Document AI service performance and recommendation quality
  - _Requirements: 3.1, 7.1, 8.1, 15.1, 16.1_

- [ ] 25. Complete System Debugging and Code Consistency Phase
  - Review entire codebase for consistency across all components and systems
  - Update all cross-system integrations and ensure proper data flow
  - Remove all temporary files, debug logs, and development artifacts
  - Ensure all environment variables are properly configured and documented
  - Verify all API endpoints have consistent authentication and authorization
  - Update all TypeScript types and interfaces for complete type safety
  - Run comprehensive test suite and fix any integration issues
  - _Requirements: All requirements integration_

- [ ] 26. Final System Integration and End-to-End Workflows
  - Integrate all SLC nodes with proper data flow and error handling
  - Implement cross-system communication and event handling
  - Create comprehensive system testing with realistic data scenarios
  - Build system administration interface for monitoring and maintenance
  - _Requirements: All requirements integration_

- [ ] 26.1 System Administration and Monitoring
  - Create system health dashboard with component status monitoring
  - Build data integrity checking and maintenance utilities
  - Implement system backup and recovery procedures
  - _Requirements: All requirements integration_

- [ ]* 26.2 Write comprehensive end-to-end tests
  - Test complete workflows from voice counting to export generation
  - Verify cross-system integration and data consistency
  - _Requirements: All requirements integration_

- [ ] 27. Production Deployment and Final Review Phase
  - Deploy complete system to production environment with full monitoring
  - Test all workflows end-to-end in production environment
  - Verify performance under realistic load conditions
  - Create comprehensive user documentation and admin guides
  - Implement production monitoring and alerting systems
  - Document deployment process and maintenance procedures
  - _Requirements: 18.1, 18.4, 18.5_