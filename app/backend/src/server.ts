// app/backend/src/server.ts
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

// --- ROBUST DOTENV LOADING AND VALIDATION ---

// Determine the expected .env file path
const dotEnvPath = path.resolve(__dirname, '../../../.env');

// Attempt to load .env variables
const result = dotenv.config({ path: dotEnvPath });

// Check if dotenv.config() resulted in an error (e.g., file not found)
if (result.error) {
    console.error(`ERROR: Could not load .env file from ${dotEnvPath}`);
    console.error('Please ensure the .env file exists and is accessible.');
    process.exit(1); // Exit the process with an error code
}

// Validate critical environment variables
const requiredEnvVars = ['API_USERNAME', 'API_PASSWORD', 'BACKEND_PORT'];
const missingEnvVars: string[] = [];

for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
        missingEnvVars.push(varName);
    }
}

if (missingEnvVars.length > 0) {
    console.error('\n--- CRITICAL ENVIRONMENT VARIABLES MISSING ---');
    console.error(`The backend requires the following environment variables to be set in your .env file (${dotEnvPath}):`);
    for (const varName of missingEnvVars) {
        console.error(`- ${varName}`);
    }
    console.error('\nPlease ensure these variables are present and have values.');
    console.error('\nExample .env content for backend:');
    console.error(`API_USERNAME=testuser`);
    console.error(`API_PASSWORD=testpassword`);
    console.error(`BACKEND_PORT=3000`);
    console.error('-------------------------------------------\n');
    process.exit(1); // Exit the process with an error code
}


// Now, you can confidently use process.env variables, as they've been validated
const API_USERNAME = process.env.API_USERNAME as string;
const API_PASSWORD = process.env.API_PASSWORD as string; // Be careful exposing plain password, even for logging
const BACKEND_PORT = parseInt(process.env.BACKEND_PORT || '3000', 10); // Parse as integer

console.log('--- Backend Environment Variables ---');
console.log('API_USERNAME:', API_USERNAME);
console.log('API_PASSWORD:', API_PASSWORD ? 'SET' : 'NOT SET');
console.log('BACKEND_PORT:', BACKEND_PORT);
console.log('-----------------------------------');

// End of dotenv loading and validation
// --- REST OF YOUR SERVER CODE ---

const app = express();
const PORT = BACKEND_PORT; // Use the parsed PORT variable

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Backend is running and healthy!');
});

// Example API routes (add your actual routes here)
app.get('/api/data', (req: Request, res: Response) => {
    res.status(200).json({ message: 'This is public data!' });
});

app.post('/api/login', (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (username === API_USERNAME && password === API_PASSWORD) {
        // In a real app, you'd generate a proper JWT token here
        const token = 'fake-jwt-token-for-test-user-12345';
        res.status(200).json({ message: 'Login successful', token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.get('/api/protected', (req: Request, res: Response) => {
    // In a real app, you'd validate the bearer token from the Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token === 'fake-jwt-token-for-test-user-12345') { // Simple token validation for this example
            res.status(200).json({ message: 'This is protected data!', user: API_USERNAME });
        } else {
            res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
    } else {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
});

// Example route for creating a resource (POST)
app.post('/api/resource', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token === 'fake-jwt-token-for-test-user-12345') {
            const { name, description } = req.body;
            if (name && description) {
                // Simulate saving a resource
                const newResource = { id: Date.now(), name, description, createdBy: API_USERNAME };
                res.status(201).json({ message: 'Resource created successfully', resource: newResource });
            } else {
                res.status(400).json({ message: 'Name and description are required.' });
            }
        } else {
            res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
    } else {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
});


app.listen(PORT, () => {
    console.log(`Backend server listening on http://localhost:${PORT}`);
});