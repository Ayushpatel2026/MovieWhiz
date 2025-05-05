import request from 'supertest';
import express, { Express } from 'express';

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

const identifyRouter = require('../../src/routes/identify');

// Mock Firebase Admin SDK's verifyIdToken for controlled authentication
jest.mock('../../src/middleware/auth', () => ({
  isAuthenticated: jest.fn(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer valid-token') {
      req.user = { uid: 'test-user-uid' }; // Simulate authenticated user
      next();
    } else {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  }),
}));

describe('POST /api/identify/movie', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/identify', identifyRouter);
  });

  it('should return 401 if no Authorization header is provided', async () => {
    const response = await request(app)
      .post('/api/identify/movie')
      .send({ text: 'A movie' });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized: Invalid token');
  });

  it('should return 401 if an invalid Authorization header is provided', async () => {
    const response = await request(app)
      .post('/api/identify/movie')
      .set('Authorization', 'Bearer invalid-token')
      .send({ text: 'A movie' });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized: Invalid token');
  });

  it('should return 400 if no input is provided', async () => {
    const response = await request(app)
      .post('/api/identify/movie')
      .set('Authorization', 'Bearer valid-token')
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('At least one input type is required');
  });

  it('should return a success response if text input is provided and authentication is valid', async () => {
    const response = await request(app)
      .post('/api/identify/movie')
      .set('Content-Type', 'multipart/form-data')
      .set('Authorization', 'Bearer valid-token')
      .field('text', 'A movie about a young wizard who goes to a magical school named Hogwarts for the first time and kills Professor Quirrell.');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.movieName).toBe('Harry Potter and the Sorcerer\'s Stone');
    expect(response.body.overallConfidence).toBeGreaterThan(80);
  });

  it('should handle form data correctly', async () => {

    const formData = {
      actors: ["Tom Hanks"],
      settings: ["Vietnam"],
    };

    const response = await request(app)
      .post('/api/identify/movie')
      .set('Content-Type', 'multipart/form-data')
      .set('Authorization', 'Bearer valid-token')
      .field('form', JSON.stringify(formData)); 

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.movieName).toBe('Forrest Gump');
  });

  it('should handle audio file uploads', async () => {
    console.log('Running audio file test...');
    const response = await request(app)
      .post('/api/identify/movie')
      .set('Content-Type', 'multipart/form-data')
      .set('Authorization', 'Bearer valid-token')
      .attach('file', path.resolve(__dirname, '../data/Aint_No_Mountain_High_Enough.mp3')) 

    
    expect(response.statusCode).toBe(206);

    // This is the actual response you would expect from the AUDD API - but my API key has expired
    // expect(response.statusCode).toBe(200);
    // expect(response.body.status).toBe('success');
    // expect(response.body.movieName).toBe('Guardians of the Galaxy');
  });

  it('should handle partial responses (206)', async () => {

    const response = await request(app)
      .post('/api/identify/movie')
      .set('Content-Type', 'multipart/form-data')
      .set('Authorization', 'Bearer valid-token')
      .field('text', 'A vague movie');

    expect(response.statusCode).toBe(206);
    expect(response.body.status).toBe('partial');
  });
});