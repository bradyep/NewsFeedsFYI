#!/usr/bin/env node

/**
 * Simple Express server for NewsFeedsFYI backend
 */

import express from 'express';
import { Request, Response } from 'express';
import path from 'path';

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../../public')));

// Simple route for testing
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the NewsFeedsFYI API' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
