# Moderation Admin Dashboard

The admin moderation dashboard is a separate web application for managing community submissions, user trust levels, and content flags.

## Architecture

- **Framework**: React (Vite or Next.js)
- **Backend**: Supabase (shared with the mobile app)
- **Auth**: Supabase Auth with admin role check

## Features (Planned)

- **Queue**: Review pending submissions, approve/reject with notes
- **Users**: View user profiles, trust scores, submission history
- **Settings**: Configure moderation rules, trust thresholds, AI screening sensitivity
- **Flags**: Review flagged content, take action

## Getting Started

```bash
npm install
npm run dev
```

## Deployment

This app will be deployed separately from the mobile app, accessible only to admin users.
