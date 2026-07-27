# BGMI Scrim Timings Management

This project is a full-stack web application designed to help BGMI (Battlegrounds Mobile India) players coordinate their scrimmage (practice match) timings. It features a React frontend and a Node.js/Express backend.

## Project Structure

The project is organized into two main directories:

-   `/client`: Contains the React frontend application.
-   `/server`: Contains the Node.js/Express backend API.

```
c:\BGMI
├───client
│   ├───package.json
│   └───src
│       ├───App.js
│       └───LoginPage.js
└───server
    ├───index.js
    └───package.json
```

---

## Getting Started

### Prerequisites

-   **Node.js:** Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
-   **MongoDB:** A MongoDB database is required. You can use a local installation or a cloud service like MongoDB Atlas. The connection string needs to be placed in `server/index.js`.

### Installation

1.  **Install Server Dependencies:**
    Open a terminal in the `c:\BGMI\server` directory and run:
    ```bash
    npm install
    ```

2.  **Install Client Dependencies:**
    Open a terminal in the `c:\BGMI\client` directory and run:
    ```bash
    npm install
    ```

### Running the Application

1.  **Start the Server:**
    In the `c:\BGMI\server` directory, run:
    ```bash
    npm start
    ```
    The server will start on `http://localhost:3001`.

2.  **Start the Client:**
    In the `c:\BGMI\client` directory, run:
    ```bash
    npm start
    ```
    The client development server will start, and it will automatically open in your browser at `http://localhost:3000`.

---

## Client (React App)

The client is a single-page application built with React.

-   **`client/src/App.js`**: The main component that manages user authentication state and renders the `LoginPage` or the main application.
-   **`client/src/LoginPage.js`**: The component for user registration and login. It uses a username and a 4-digit PIN for authentication and communicates with the backend API to authenticate users.

### Key Libraries

-   **React:** For building the user interface.
-   **Bootstrap:** For styling and UI components.

### Available Scripts

In the `c:\BGMI\client` directory, you can run:

-   `npm start`: Runs the app in development mode.
-   `npm test`: Launches the test runner.
-   `npm run build`: Builds the app for production.

---

## Server (Node.js/Express API)

The server provides a RESTful API for the client application to interact with.

-   **`server/index.js`**: The main entry point for the server. It sets up the Express application, connects to MongoDB, and defines all the API routes.

### Key Libraries

-   **Express:** A web framework for Node.js.
-   **Mongoose:** An Object Data Modeling (ODM) library for MongoDB.
-   **JSON Web Token (JWT):** For implementing user authentication and authorization.
-   **bcryptjs:** For hashing user passwords.
-   **CORS:** To enable Cross-Origin Resource Sharing.
-   **cookie-parser:** To parse cookie headers.

### API Endpoints

All endpoints are prefixed with `/api`.

**Authentication Routes (`/api/auth`)**

-   `POST /register`: Registers a new user.
    -   **Body:** `{ "name": "string", "bgmiId": "string", "pin": "string" }`
-   `POST /login`: Logs in an existing user.
    -   **Body:** `{ "name": "string", "pin": "string" }`
-   `GET /logout`: Logs out the current user by clearing the auth cookie.
-   `GET /me`: Retrieves the profile of the currently logged-in user. (Protected)

**User Routes (`/api/users`)**

-   `GET /`: Retrieves a list of all registered users.
-   `POST /availability`: Updates the availability for the currently logged-in user. (Protected)
    -   **Body:** `{ "availability": [{ "startDate": "date", "endDate": "date", "start": "string", "end": "string" }] }`

### Environment Variables

The following variables need to be configured in `server/index.js`:

-   `MONGO_URI`: The connection string for your MongoDB database.
-   `JWT_SECRET`: A secret key for signing JSON Web Tokens.

**Note:** For production, these should be moved to a `.env` file and loaded using a library like `dotenv`.

---

## Deployment

This guide provides a cost-effective way to deploy the application using free-tier services.

### 1. Database (MongoDB Atlas)

1.  **Create a Free Cluster:**
    -   Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
    -   Create a new "Shared Cluster" (the free M0 tier).
    -   Choose a cloud provider and region (e.g., AWS, N. Virginia `us-east-1`).

2.  **Configure the Database:**
    -   In the "Database Access" section, create a new database user. Note down the username and password.
    -   In the "Network Access" section, add your current IP address to the IP access list. To allow access from anywhere (less secure, but easier for development), you can add `0.0.0.0/0`.
    -   Go to your cluster's "Overview," click "Connect," choose "Connect your application," and copy the connection string. Replace `<username>`, `<password>`, and `<dbname>` with your credentials.

### 2. Backend (Render)

1.  **Create a New Web Service:**
    -   Sign up for a free account at [Render](https://render.com/).
    -   From your dashboard, click "New +" and select "Web Service."
    -   Connect your GitHub or GitLab account and choose the repository for this project.

2.  **Configure the Service:**
    -   **Name:** Give your service a name (e.g., `bgmi-scrim-api`).
    -   **Root Directory:** Set this to `server`.
    -   **Environment:** Select `Node`.
    -   **Build Command:** `npm install`
    -   **Start Command:** `npm start`
    -   **Plan:** Choose the "Free" tier.

3.  **Add Environment Variables:**
    -   Go to the "Environment" tab for your new service.
    -   Add the following secret files:
        -   `MONGO_URI`: The connection string you copied from MongoDB Atlas.
        -   `JWT_SECRET`: A long, random, and secret string for signing JWTs.
        -   `PORT`: `3001`

4.  **Deploy:**
    -   Click "Create Web Service." Render will automatically build and deploy your backend.
    -   Once deployed, note down the URL of your backend service (e.g., `https://bgmi-scrim-api.onrender.com`).

### 3. Frontend (Vercel)

1.  **Create a New Project:**
    -   Sign up for a free account at [Vercel](https://vercel.com/).
    -   From your dashboard, click "Add New..." and select "Project."
    -   Connect your GitHub or GitLab account and choose the repository for this project.

2.  **Configure the Project:**
    -   **Framework Preset:** Vercel should automatically detect that this is a Create React App.
    -   **Root Directory:** Set this to `client`.

3.  **Add Environment Variables:**
    -   Go to the "Settings" tab and then "Environment Variables."
    -   Add a new environment variable:
        -   `REACT_APP_API_URL`: The URL of your deployed backend service on Render (e.g., `https://bgmi-scrim-api.onrender.com`).

4.  **Deploy:**
    -   Click "Deploy." Vercel will build and deploy your frontend.

### 4. Final Configuration (CORS)

1.  **Update Server CORS:**
    -   In `server/index.js`, update the `cors` middleware to only allow requests from your deployed frontend URL.
    ```javascript
    app.use(cors({
        origin: 'https://<your-vercel-app-name>.vercel.app'
    }));
    ```
    -   Commit and push this change to your repository. Render will automatically redeploy your backend with the updated CORS settings.

You should now have a fully deployed, production-ready application!
