# Redis Backend Application

A basic backend application built with Node.js, Express, and TypeScript.

## Features

- TypeScript support
- Express.js framework
- CORS enabled
- Environment variables support
- Hot reload in development

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Run the development server with hot reload:

```bash
npm run dev
```

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Production

Run the compiled application:

```bash
npm start
```

## Available Routes

- `GET /` - Welcome message
- `GET /health` - Health check endpoint
- `GET /api/hello?name=YourName` - Example API route

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=3000
```

