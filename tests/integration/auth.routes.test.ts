//  ------------------------------------------------------------------
//  file: tests\integration\bookmark.routes.test.ts
//  integration tests for the auth servic
//  ------------------------------------------------------------------

import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import app from '../../src/app';
import { Bookmark } from '../../src/models/bookmark.model';
import { RefreshToken } from '../../src/models/refreshToken.model';
import { User } from '../../src/models/user.model';

describe('Auth Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Bookmark.deleteMany({});
    await RefreshToken.deleteMany({});
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Bookmark.deleteMany({});
    await RefreshToken.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.user).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should return 409 if email already exists', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'password123',
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Second User',
        email: 'duplicate@example.com',
        password: 'password456',
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Email already registered');
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test',
        email: 'invalid-email',
        password: '123',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login successfully', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('login@example.com');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should return 404 if user does not exist', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('should return 401 if password is incorrect', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Refresh User',
        email: 'refresh@example.com',
        password: 'password123',
      });
      refreshToken = res.body.refreshToken;
    });

    it('should generate new access token', async () => {
      const res = await request(app).post('/api/auth/refresh').send({
        refreshToken,
      });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });

    it('should return 400 if refresh token is not provided', async () => {
      const res = await request(app).post('/api/auth/refresh').send({});

      expect(res.status).toBe(400);
    });

    it('should return 401 if refresh token is invalid', async () => {
      const res = await request(app).post('/api/auth/refresh').send({
        refreshToken: 'invalid-token',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Logout User',
        email: 'logout@example.com',
        password: 'password123',
      });
      refreshToken = res.body.refreshToken;
    });

    it('should logout successfully', async () => {
      const res = await request(app).post('/api/auth/logout').send({
        refreshToken,
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');

      // Verify token is deleted
      const token = await RefreshToken.findOne({ token: refreshToken });
      expect(token).toBeNull();
    });

    it('should return 400 if refresh token is not provided', async () => {
      const res = await request(app).post('/api/auth/logout').send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/profile', () => {
    let accessToken: string;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Profile User',
        email: 'profile@example.com',
        password: 'password123',
      });
      accessToken = res.body.accessToken;
    });

    it('should return user profile', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        name: 'Profile User',
        email: 'profile@example.com',
      });
    });

    it('should return 401 if no token provided', async () => {
      const res = await request(app).get('/api/auth/profile');

      expect(res.status).toBe(401);
    });

    it('should return 401 if token is invalid', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });
});
