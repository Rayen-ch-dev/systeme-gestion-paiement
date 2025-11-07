import supertest from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../../models/User.js';
import express from 'express';
import userRoutes from '../../routes/userRoutes.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

const request = supertest(app);

let mongoServer;

// Test data
const testUser = {
  name: 'Test',
  lastname: 'User',
  cin: '12345678',
  email: 'test@example.com',
  password: 'password123',
  role: 'formateur',
  banque: 'Test Bank',
  rib: '1234567890123456789012',
  specialite: 'Informatique'
};

// Connect to the in-memory database before tests run
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Clear all test data after each test
afterEach(async () => {
  await User.deleteMany({});
});

// Remove and close the db and server after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('User Controller Tests', () => {
  // Test user registration
  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Utilisateur créé avec succès');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should not register user with existing email', async () => {
      // First registration
      await request(app).post('/api/users/register').send(testUser);
      
      // Second registration with same email
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Email ou RIB déjà utilisé');
    });
  });

  // Test user login
  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app).post('/api/users/register').send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Email ou mot de passe incorrect');
    });
  });
});
