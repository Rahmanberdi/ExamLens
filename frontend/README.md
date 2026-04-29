# ExamLens Frontend

A React + TypeScript + Vite application for the ExamLens platform.

## Features

- **Role-based Dashboards**: Specific views for Admin, Teacher, and Student.
- **Multilingual Support**: English, Chinese, and Russian.
- **Dark/Light Mode**: Customizable theme.
- **Modern Tech Stack**: React 19, React Query, Zustand, Axios, i18next.

## Vercel Deployment

This project is configured for easy deployment on Vercel.

### Configuration

The project uses `vercel.json` to handle client-side routing. All requests are redirected to `index.html` to allow `react-router-dom` to manage the routes.

### Environment Variables

When deploying to Vercel, you **must** set the following environment variable in your project settings:

- `VITE_API_URL`: The full URL to your backend API (e.g., `https://api.yourdomain.com/api`).

### Deployment Steps

1. Connect your repository to Vercel.
2. Set the `VITE_API_URL` environment variable.
3. Click **Deploy**.

## Development

```bash
npm install
npm run dev
```

### Build and Lint

```bash
npm run build
npm run lint
```
