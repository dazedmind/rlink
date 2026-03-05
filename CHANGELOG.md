# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.5] - 2026-03-05

### Added
- API Routes for Content Management System
- Created the UI for the CMS and basic CRUD 
- Fixed the Reservation and Inventory from the recent database changes

## [0.0.4] - 2026-03-02

### Added
- Security & Middleware Layer: Implemented a robust security architecture including global authentication middleware and server-side rate limiting to prevent API abuse and brute-force attempts.
- Campaign Management Engine: Completed the Newsletter and Marketing Campaigns module, featuring a full CRUD lifecycle and a polished Markdown-based composer for high-fidelity communication.
- Access Control: Integrated secure route protection to ensure sensitive CRM data (Leads, Inquiries) is strictly accessible via authenticated admin sessions.
- Inventory Page: Added the inventory management for checking and viewing available or sold units.

### Changed
- UI/UX Polish: Refined the Newsletter dashboard and campaign preview layouts for improved mobile responsiveness and administrative workflow efficiency.
- Layout Polishing: Improved mobile responsivess and auto layout on smaller screen size. 

## [0.0.3] - 2026-02-27

### Added
- Data Export Engine: Implemented CSV serialization for all CRM tables with support for enum-to-string label mapping.
- Advanced Filtering & Sorting: Introduced multi-dimensional filtering and sorting capabilities to the Leads and Inquiries tables.
- Service API Layer: Deployed RESTful API endpoints for Leads Management, Inquiry Inbox, and Newsletter subscriptions.
- Scalability Optimizations: Implemented server-side pagination with a default limit of 10 records per request to optimize memory overhead and response latency.
- Newsletter Subscription Tracking: Added status field to Newsletter schema to manage subscription states (Subscribed/Unsubscribed).

### Changed
- Schema Refactoring: Decoupled clientName into firstName and lastName across the database and frontend for improved searchability and data normalization.
- UI/UX Refinement: Relayouted modular components (Composer, Lead Details, Inquiry Inbox) using Shadcn Dialog primitives for better accessibility and responsive consistency.
- Motion Design: Integrated global entry animations (fade-in/zoom-in) for a more fluid and professional interface transitions.

## [0.0.2] - 2026-02-26

### Added
- Added CHANGELOG.md
- Automated Inventory Logic: Implemented a useEffect hook to auto-generate inventoryCode based on project initials (e.g., "Arcoe Residence" → "AR"), Block, and Lot.
- Dynamic Lot Status: Added disabled attribute logic to Lot selection dropdowns to show reserved/sold lots while preventing selection.
- Inventory PATCH API: Created a specialized endpoint /api/projects/inventory to link reservations to specific inventory items via soldTo IDs.

### Changed
- State Management Refactor: Converted ReservationDetailModal to a fully controlled component pattern to fix UI synchronization issues.
- API Robustness: Updated Reservation PATCH API with a whitelist of allowedFields and improved error handling for Drizzle ORM array returns.
- UI/UX Improvements: Standardized context menus into a reusable component supporting custom icons, colors, and e.stopPropagation().

### Fixed
- Fixed a bug where the projectName was not persisting during updates due to a key mismatch between frontend state and backend schema.
- Resolved an issue where hidden inputs weren't correctly syncing with the formData object during programmatic updates.

## [0.0.1] - 2026-02-25

### Added
- Created the boilerplate code, layout, and template for the RLink admin portal