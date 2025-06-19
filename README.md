# TScan

A modern inventory management system built with Next.js and TypeScript.

## Project Structure

```
tscan/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions and types
│   ├── public/       # Static assets
│   ├── styles/       # CSS and styling files
│   └── ...          # Config files (package.json, tsconfig.json, etc.)
├── backend/          # Backend services (future)
├── docs/             # Documentation
└── README.md         # This file
```

## Getting Started

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

The frontend application will be available at [http://localhost:3000](http://localhost:3000).

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting

## Features

- Modern inventory management interface
- Barcode scanning functionality
- Multi-warehouse support
- Real-time inventory tracking
- Responsive design with Tailwind CSS
- Component library with Radix UI

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Charts**: Recharts
