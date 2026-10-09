# 🎬 Movie Discovery Platform

A full-stack Movie Discovery Platform built as part of the **EngageIQ Full Stack Development Internship Assignment**. The application allows users to explore movies, search for titles, view movie information, and interact with a movie-focused interface powered by the IMDb API through RapidAPI.

## 🌐 Live Demo

- **Live Website:** https://movie-discovery-platform-paf2.vercel.app
- **Backend API:** https://movie-discovery-platform-30u4.onrender.com
- **GitHub Repository:** https://github.com/mnrhag5-glitch/movie-discovery-platform

## 📌 Project Overview

The Movie Discovery Platform is designed to provide users with a simple and responsive way to discover movies and explore their information.

The project follows a frontend-backend architecture, with the frontend responsible for the user interface and the backend handling API integration and server-side operations.

## ✨ Features

- Movie discovery and browsing.
- Integration with the IMDb236 API through RapidAPI.
- Movie information, ratings, release details, and posters when available from the API.
- Movie search functionality.
- Responsive user interface.
- REST API integration using a Node.js and Express backend.
- MongoDB database integration.
- Environment-based configuration for sensitive credentials.
- Frontend and backend deployment.

## 🛠️ Tech Stack

**Frontend**
- React.js
- JavaScript
- CSS / Tailwind CSS, as used in the implementation

**Backend**
- Node.js
- Express.js
- REST APIs

**Database**
- MongoDB
- Mongoose, where used

**External Services**
- RapidAPI IMDb236 API
- Wapix WhatsApp API was intended for OTP delivery but could not be successfully integrated within the assignment timeline.

**Deployment**
- Vercel — Frontend
- Render — Backend

## 📂 Project Structure

```text
movie-discovery-platform/
├── frontend/
│   └── src/
│       └── pages/
│           └── Movies.jsx
├── backend/
│   └── src/
│       ├── app.js
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       └── services/
└── README.md
```

The structure above highlights the main application areas. Refer to the repository for the complete project structure.

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- MongoDB connection
- RapidAPI account with access to the IMDb236 API

### 1. Clone the Repository

```bash
git clone https://github.com/mnrhag5-glitch/movie-discovery-platform.git
cd movie-discovery-platform
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 4. Configure Environment Variables

Create the required `.env` file in the backend directory and configure the environment variables used by the application.

Example:

```env
PORT=3000
NODE_ENV=development
MONGODB_URL=your_mongodb_connection_string
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=imdb236.p.rapidapi.com
```

Use the exact variable names required by the source code. Configure any additional variables required by the authentication or OTP implementation.

**Important:** Never commit `.env` files or real API keys, database credentials, or other secrets to GitHub.

### 5. Run the Backend

From the backend directory, use the development script configured in `package.json`. For example:

```bash
npm run dev
```

### 6. Run the Frontend

From the frontend directory:

```bash
npm run dev
```

Open the local URL provided by the frontend development server.

## 🔌 IMDb API Integration

The application uses the IMDb236 API through RapidAPI to retrieve movie information.

The backend uses environment variables to configure the API credentials. Keeping these credentials on the server helps prevent exposure in the frontend.

**Quota limitation:** The RapidAPI BASIC plan has a limited monthly request quota. When the quota is exhausted, requests may fail with HTTP `429 Too Many Requests`. The application depends on the availability and quota of the external API.

## ⚠️ Implementation Limitations and Apology

I made my best effort to implement the requirements specified in the assignment within the available time.

However, I could not successfully connect and configure the Wapix API for WhatsApp OTP delivery. I also encountered difficulties with the Wapix payment/setup process, which prevented me from completing the required integration.

As a result, the following requirements remain incomplete or require further verification:

- WhatsApp OTP delivery and phone verification.
- Phone number and OTP login.
- Forgot password and password reset through OTP.
- Any authentication flow dependent on successful OTP verification.

I sincerely apologize for not being able to complete these requirements within the assignment deadline. I tried my best to resolve the integration issues, but I was unable to get Wapix working successfully.

I acknowledge these limitations and would improve the implementation by resolving the provider integration, completing the authentication flows, and testing the entire user journey end to end.

Additionally, movie saving, saved-movie persistence, and search-state persistence require further verification and improvement.

## 🚀 Deployment

The frontend and backend are deployed separately.

- **Frontend:** Vercel
- **Backend:** Render

Production environment variables must be configured in the respective deployment dashboards. Changes to a local `.env` file do not automatically update deployed environment variables.

## 🔐 Security Considerations

- Keep API keys and database credentials in environment variables.
- Never expose server-side secrets in frontend code.
- Validate incoming requests on the backend.
- Hash passwords before storing them.
- Protect authenticated endpoints with appropriate authorization.
- Apply rate limiting to authentication and OTP endpoints.
- Avoid exposing sensitive user information in API responses.

Security measures and authentication flows should be verified against the actual implementation before production use.

## 📋 Future Improvements

- Complete WhatsApp OTP integration using Wapix.
- Finish and test phone-based login and password reset.
- Complete movie save/unsave functionality and the Saved Movies view.
- Preserve search queries and pagination state across refreshes.
- Improve loading, empty, and error states.
- Add automated tests for authentication and saved-movie APIs.
- Improve API caching and request handling.

## 📬 Submission Links

- **Live Application:** https://movie-discovery-platform-paf2.vercel.app
- **GitHub Repository:** https://github.com/mnrhag5-glitch/movie-discovery-platform

---

**Developed as part of the EngageIQ Full Stack Development Internship Assignment.**
