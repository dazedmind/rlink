# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.11] - 2026-03-18

### Fixed
- DSL Tracker Form: Replaced hardcoded dropdown values with dynamic options.
- Reservation Form: Added input validation and resolved an issue where reservations were not correctly linking to project inventory.
- Article Editor: Resolved a bug where setting an article type to announcement could be changed after being set.

### Removed
- IAM: Removed the conditional "Set New Password" input that was previously shown only for Google-authenticated users.

### Changed
- Tables: Added a delete confirmation dialog to all tables that support record deletion.
- IAM User Form: Added input validation to the User Form Modal.
- UX: Improved overall user experience with response caching, smooth animations, and skeleton loaders for async content.
- Transitioned to tanstack query for a more efficient data state management.
- CMS: Added slug input fields for Projects, Careers, and Articles.
- IAM: Updated the Department enum to reflect actual company departments.
- Codebase: Refactored and unified shared types into `types.ts` to improve maintainability and scalability.

## [0.0.10] - 2026-03-13

### Added
- Amenities Tab: Created a separate section in CMS with cover photo upload support.
- Department Column: Added a department column in careers table for better organization.

### Changes
- Project Table: Updated the project layout to a table format for better visibility.
- Dashboard Layout: Reorganized the CMS dashboard for improved flow.
- Career Table: Removed the `purpose` field to reduce data redundancy.
- Image Optimization: Enhanced thumbnail quality for better performance.

### Fixed
- Publish Date: Fixed the bug not saving publish dates to the database.

## [0.0.9] - 2026-03-12

### Added
- CMS: Added a photo gallery on projects that allows photo gallery on specific models
- Settings: Added a password validation with "strength meter" and a list of requirements on the new password input in the Privacy & Security tab
- User Management: Added a generate password button on the password input for faster account creation

### Changes
- CMS: Re-arranged the layout overview and redesigned the Nearby Landmarks input on project overview.
- Code refactoring on ENUM values, and other related database changes from the abovementioned features

## [0.0.8] - 2026-03-11

### Added
- CMS: Added main dashboard contents
- Database: Added enum options for Project stage, status, and type
- Added notification database and notificate API GET routes
- CRM: Added a view by block/by house model filter on Project Inventory

### Changes
- Refactored all hardcoded select options and put in `types.ts` for easier changes integration
- Removed the self-sign up option for security purposes

### Fixes
- Fixed inventory does not allow same block numbers with different house model
 
## [0.0.7] - 2026-03-10

### Added
- User Management: added activity logs and logging for user changes
- CMS: Added subpages (seo, analytics, security) for the Developer Tools sidebar
- Added a toggle group for the Article Editor on News Articles tabs
- Added show as password/plain text button for all password inputs
 
### Changes
- CMS: Refactored the codebase for Projects fixing long waiting time 
- Re-arranged the Project subpage's layout 
- Refactored the codebase for News article page to lessen confusion

### Fixes
- Fixed the layout shift when opening modals/popups

## [0.0.6] - 2026-03-09

### Added
- User Management: added users management using better-auth
- Added department ENUM and types
- Fixed the order of projects shown in the Inventory tab
- (CMS): Added security tools page 

### Changes
- Re-arranged the System Setting's layout

### Removed
- Removed unused tabs/routes in the CMS

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