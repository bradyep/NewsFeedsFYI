#!/usr/bin/env node

/**
 * This is a server script to run the Express app for NewsFeedsFYI
 */

import express from 'express';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3030");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Basic middleware setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../public')));

// Simple API route for testing
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the NewsFeedsFYI API' });
});

// Simple route for users (placeholder)
app.get('/users', (req: Request, res: Response) => {
  res.json({ users: [{ id: 1, name: 'Test User' }] });
});

// Simple route for links (placeholder)
app.get('/links', (req: Request, res: Response) => {
  res.json({ links: [{ id: 1, url: 'https://example.com', title: 'Example' }] });
});

// Simple route for pages (placeholder)
app.get('/pages', (req: Request, res: Response) => {
  res.json({ pages: [{ id: 1, name: 'Home Page' }] });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API available at http://localhost:${port}/api`);
});
