// app/backend/src/server.ts
import express, { Request, Response, NextFunction } from 'express'; // Import NextFunction
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.BACKEND_PORT || 3000;
const API_USERNAME = process.env.API_USERNAME || 'testuser';
const API_PASSWORD = process.env.API_PASSWORD || 'testpassword';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:8080';

// Configure CORS
const corsOptions = {
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use(bodyParser.json());

// --- Authentication Middleware (NEW or REFACTORED) ---
// This function will check for a valid token
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.warn('Access denied: No token provided.');
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  if (token === 'fake-jwt-token-for-demo') { // In a real app, you'd verify JWT validity here
    // Optionally attach user info to request
    (req as any).user = { username: API_USERNAME }; // For demonstration, attaching fake user
    next(); // Proceed to the next middleware/route handler
  } else {
    console.warn('Access denied: Invalid token.');
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};

// --- API Endpoints ---

// Public Data Endpoint
app.get('/api/public-data', (req, res) => {
  console.log('Access to public data granted.');
  return res.status(200).json({ message: 'This is public data from the backend!' });
});

// Generic Status Endpoint
app.get('/api/status', (req, res) => {
  console.log('Backend status check received.');
  return res.status(200).json({ message: 'Backend is online!' });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username === API_USERNAME && password === API_PASSWORD) {
    const token = 'fake-jwt-token-for-demo'; // In a real app, generate a real JWT
    console.log(`User ${username} logged in successfully.`);
    return res.status(200).json({ message: 'Login successful!', token });
  } else {
    console.warn(`Login attempt failed for username: ${username}`);
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Protected GET route (re-using authenticateToken middleware)
app.get('/api/data', authenticateToken, (req, res) => {
  console.log('Access to protected data granted.');
  // Access user info from req.user if attached by middleware
  const user = (req as any).user ? (req as any).user.username : API_USERNAME;
  return res.status(200).json({ message: 'This is protected data from the backend!', user: user });
});

// --- NEW Protected POST /api/resource endpoint ---
app.post('/api/resource', authenticateToken, (req, res) => {
  const newResource = req.body; // The data sent by the client
  const user = (req as any).user ? (req as any).user.username : API_USERNAME; // Get user from token

  // In a real application, you would save this newResource to a database
  // and assign it a unique ID, associate it with the 'user', etc.
  console.log(`User ${user} created a new resource:`, newResource);

  return res.status(201).json({
    message: 'Resource created successfully!',
    resource: {
      id: `res-${Date.now()}`, // Dummy ID
      createdBy: user,
      ...newResource // Echo back the sent data
    }
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
  console.log(`CORS enabled for origin: ${FRONTEND_ORIGIN}`);
});