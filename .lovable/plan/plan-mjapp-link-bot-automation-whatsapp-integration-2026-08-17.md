# Plan: MJApp Link Bot - Automation & WhatsApp Integration

Build a modern web/mobile application for automated WhatsApp group link management using the official WhatsApp Business Platform API.

## User Interface & Experience
- Modern, responsive dashboard with a sidebar navigation.
- Dark/Light mode support using Shadcn UI.
- Visual feedback for message delivery status (Sent, Pending, Failed).
- Interactive campaign builder with message preview.

## Data Schema (Lovable Cloud)
- `profiles`: User management and roles (Admin).
- `groups`: WhatsApp group metadata (Name, ID, Category, Status).
- `campaigns`: Campaign details (Title, Message, Link, Schedule, Status).
- `campaign_results`: History of message attempts (Timestamp, Target Group, Status, Error Logs).
- `settings`: WhatsApp API configuration (Phone Number ID, Access Token).

## Features
- **Admin Dashboard**: Real-time stats on campaigns and delivery metrics.
- **Group Management**: CRUD for authorized groups with categorization.
- **Campaign Creator**: Rich text/emoji support for messages with link embedding.
- **Automation Engine**: 
  - Immediate and scheduled sending.
  - Background processing using TanStack Server Functions.
  - `pg_cron` for recurring tasks and retries.
- **WhatsApp Integration**: 
  - Official Cloud API integration.
  - Environment variable security for credentials.
- **Spam Protection**: Rate limiting and opt-out logic.

## Technical Details
- **Frontend**: TanStack Start, React 19, Tailwind CSS v4, Shadcn UI.
- **Backend**: TanStack Server Functions (`createServerFn`), Server Routes (`/api/public/*`) for webhooks/cron.
- **Database**: PostgreSQL (Lovable Cloud) with RLS for multi-user security.
- **Scheduling**: `pg_cron` + `pg_net` to trigger server routes.
- **Security**: Supabase Auth, middleware for route protection, and environment secret management.

---

I will now proceed with creating the database schema and the core application structure.
