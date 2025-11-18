//  ------------------------------------------------------------------
//  file: tests\unit\auth.service.test.ts
//  Unit tests for the auth servic
//  ------------------------------------------------------------------

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Bookmark } from '../../src/models/bookmark.model';
import { RefreshToken } from '../../src/models/refreshToken.model';
import { User } from '../../src/models/user.model';
import { authService } from '../../src/services/auth.service';

describe('AuthService', () => {
  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
    await Bookmark.deleteMany({});
    await RefreshToken.deleteMany({});
  });

  afterEach(async () => {
    // Clean up after each test
    await User.deleteMany({});
    await Bookmark.deleteMany({});
    await RefreshToken.deleteMany({});
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result = await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user).toMatchObject({
        name: 'Test User',
        email: 'test@example.com',
      });
      expect(result.user.id).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw ConflictException if email already exists', async () => {
      await authService.register({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'password123',
      });

      await expect(
        authService.register({
          name: 'Second User',
          email: 'duplicate@example.com',
          password: 'password456',
        }),
      ).rejects.toThrow('Email already registered');
    });

    it('should store refresh token in database', async () => {
      const result = await authService.register({
        name: 'Test User',
        email: 'token@example.com',
        password: 'password123',
      });

      const storedToken = await RefreshToken.findOne({ token: result.refreshToken });
      expect(storedToken).toBeDefined();
      expect(storedToken?.userId.toString()).toBe(result.user.id);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await authService.register({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const result = await authService.login({
        email: 'login@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('login@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('User not found');
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      await expect(
        authService.login({
          email: 'login@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Invalid credentials');
    });

    // it('should invalidate old refresh tokens on new login', async () => {
    //   const firstLogin = await authService.login({
    //     email: 'login@example.com',
    //     password: 'password123',
    //   });

    //   const secondLogin = await authService.login({
    //     email: 'login@example.com',
    //     password: 'password123',
    //   });

    //   // Old token should be deleted
    //   const oldToken = await RefreshToken.findOne({ token: firstLogin.refreshToken });
    //   expect(oldToken).toBeNull();

    //   // New token should exist
    //   const newToken = await RefreshToken.findOne({ token: secondLogin.refreshToken });
    //   expect(newToken).toBeDefined();
    // });
  });

  describe('refreshAccessToken', () => {
    let validRefreshToken: string;
    let userId: string;

    beforeEach(async () => {
      const result = await authService.register({
        name: 'Refresh User',
        email: 'refresh@example.com',
        password: 'password123',
      });
      validRefreshToken = result.refreshToken;
      userId = result.user.id;
    });

    it('should generate new access token with valid refresh token', async () => {
      const result = await authService.refreshAccessToken(validRefreshToken);

      expect(result.accessToken).toBeDefined();
      expect(typeof result.accessToken).toBe('string');
    });

    it('should throw BadRequestException if refresh token is not provided', async () => {
      await expect(authService.refreshAccessToken('')).rejects.toThrow('No refresh token provided');
    });

    it('should throw UnauthorizedException if refresh token does not exist in database', async () => {
      await expect(authService.refreshAccessToken('invalid-token')).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should throw UnauthorizedException and delete token if token is invalid', async () => {
      // Store an invalid token
      await RefreshToken.create({
        userId,
        token: 'malformed-jwt-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await expect(authService.refreshAccessToken('malformed-jwt-token')).rejects.toThrow(
        'Expired or invalid refresh token',
      );

      // Token should be deleted
      const deletedToken = await RefreshToken.findOne({ token: 'malformed-jwt-token' });
      expect(deletedToken).toBeNull();
    });
  });

  describe('logout', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const result = await authService.register({
        name: 'Logout User',
        email: 'logout@example.com',
        password: 'password123',
      });
      refreshToken = result.refreshToken;
    });

    it('should delete refresh token from database', async () => {
      await authService.logout(refreshToken);

      const token = await RefreshToken.findOne({ token: refreshToken });
      expect(token).toBeNull();
    });

    it('should throw BadRequestException if refresh token is not provided', async () => {
      await expect(authService.logout('')).rejects.toThrow('No refresh token provided');
    });

    it('should succeed silently if token does not exist (idempotent)', async () => {
      // First logout
      await authService.logout(refreshToken);

      // Second logout should not throw
      await expect(authService.logout(refreshToken)).resolves.not.toThrow();
    });
  });

  describe('getProfile', () => {
    let userId: string;

    beforeEach(async () => {
      const result = await authService.register({
        name: 'Profile User',
        email: 'profile@example.com',
        password: 'password123',
      });
      userId = result.user.id;
    });

    it('should return user profile', async () => {
      const profile = await authService.getProfile(userId);

      expect(profile).toMatchObject({
        id: userId,
        name: 'Profile User',
        email: 'profile@example.com',
      });
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      await expect(authService.getProfile('507f1f77bcf86cd799439011')).rejects.toThrow(
        'User not found',
      );
    });

    it('should not include password in profile', async () => {
      const profile = await authService.getProfile(userId);
      expect(profile).not.toHaveProperty('password');
    });
  });
});
