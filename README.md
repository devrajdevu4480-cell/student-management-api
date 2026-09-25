# AI Student Management API

A Node.js + Express + MongoDB REST API for managing students with optional Gemini-powered academic insights.

## Features

- Create, read, update, and delete students
- Student performance analytics
- Class-level insights and averages
- Gemini API integration for AI academic summaries
- Fallback local summaries when Gemini is not configured

## Project structure

- `server.js` - app entry point
- `routes/studentRoutes.js` - REST routes
- `models/Student.js` - Mongoose schema
- `services/geminiService.js` - analytics and AI summary logic
- `middleware/errorHandler.js` - centralized error handling
- `config/db.js` - MongoDB connection

## Requirements

- Node.js 18+
- MongoDB running locally on port 27017
- A Gemini API key for full AI features (optional)

## Setup

From the correct project folder:

```bash
cd "C:\Users\VINAYAK M GOLLAR\Desktop\Student-management-api (1)\Student-management-api"
npm install
```

Create or update `.env`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/student_management
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the API:

```bash
npm start
```

## API endpoints

### Student CRUD

- `POST /students`
- `GET /students`
- `GET /students/:id`
- `PUT /students/:id`
- `DELETE /students/:id`

### AI endpoints

- `GET /students/:id/ai-summary`
- `GET /students/ai-insights`

## Example student payload

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "age": 20,
  "course": "BSc Computer Science",
  "marks": {
    "javascript": 90,
    "python": 95,
    "java": 88,
    "DSA": 92
  }
}
```

## Run tests

```bash
npm test
```

## Notes

If MongoDB is not running, the server will fail to connect. If Gemini is not configured, the AI endpoints still return a local generated summary instead of failing.
