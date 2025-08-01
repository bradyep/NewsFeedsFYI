#!/usr/bin/env node

/**
 * This is a server script to run the Express app for NewsFeedsFYI.
 * It is the entry point for the backend of the application.
 */

// Register module aliases BEFORE importing any modules
import 'module-alias/register';

import express from 'express';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session = require('express-session');

// Import route modules
import usersRouter = require('./routes/users');
import linksRouter = require('./routes/links');
import pagesRouter = require('./routes/pages');
import userFeedsRouter = require('./routes/user-feeds');
import indexRouter = require('./routes/index');
import authenticateRouter = require('./routes/authenticate');

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
// Serve static files from the public directory (legacy assets)
app.use(express.static(path.join(__dirname, '../../public')));

// Serve built client files from dist directory (for production)
app.use(express.static(path.join(__dirname, '../')));

app.use(session({ 
  secret: 'this is a picture', 
  resave: true,
  saveUninitialized: true
 }));

authenticateRouter.initPassport(app);

// Route handlers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/links', linksRouter);
app.use('/pages', pagesRouter);
app.use('/userfeeds', userFeedsRouter);
app.use('/authenticate', authenticateRouter.router);

// Simple API route for testing
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the NewsFeedsFYI API' });
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../index.html'));
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
