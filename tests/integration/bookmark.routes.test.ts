//  ------------------------------------------------------------------
//  file: tests\integration\bookmark.routes.test.ts
//  Integration tests for bookmark routes
//  ------------------------------------------------------------------

import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import app from '../../src/app';
import { Bookmark } from '../../src/models/bookmark.model';
import { RefreshToken } from '../../src/models/refreshToken.model';
import { User } from '../../src/models/user.model';

describe('Bookmark Routes', () => {
  let accessToken: string;
  // let userId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Bookmark.deleteMany({});
    await RefreshToken.deleteMany({});

    // Register and login
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    accessToken = res.body.accessToken;
    // userId = res.body.user.id;
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Bookmark.deleteMany({});
    await RefreshToken.deleteMany({});
  });

  describe('POST /api/bookmarks', () => {
    it('should create a new bookmark', async () => {
      const res = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          url: 'https://example.com',
          title: 'Example Site',
          description: 'An example website',
          tags: ['example', 'test'],
        });

      expect(res.status).toBe(201);
      expect(res.body.bookmark).toMatchObject({
        url: 'https://example.com',
        title: 'Example Site',
        description: 'An example website',
        tags: ['example', 'test'],
      });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).post('/api/bookmarks').send({
        url: 'https://example.com',
      });

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid URL', async () => {
      const res = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          url: 'not-a-url',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/bookmarks', () => {
    beforeEach(async () => {
      // Create some bookmarks
      await request(app).post('/api/bookmarks').set('Authorization', `Bearer ${accessToken}`).send({
        url: 'https://example1.com',
        title: 'Example 1',
      });

      await request(app).post('/api/bookmarks').set('Authorization', `Bearer ${accessToken}`).send({
        url: 'https://example2.com',
        title: 'Example 2',
      });
    });

    it('should get all bookmarks', async () => {
      const res = await request(app)
        .get('/api/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.bookmarks).toHaveLength(2);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/bookmarks');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/bookmarks/:id', () => {
    let bookmarkId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          url: 'https://example.com',
          title: 'Example',
        });

      bookmarkId = res.body.bookmark._id;
    });

    it('should get bookmark by ID', async () => {
      const res = await request(app)
        .get(`/api/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.bookmark.url).toBe('https://example.com');
    });

    it('should return 404 if bookmark not found', async () => {
      const res = await request(app)
        .get('/api/bookmarks/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/bookmarks/:id', () => {
    let bookmarkId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          url: 'https://example.com',
          title: 'Original Title',
        });

      bookmarkId = res.body.bookmark._id;
    });

    it('should update bookmark', async () => {
      const res = await request(app)
        .put(`/api/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Title',
        });

      expect(res.status).toBe(200);
      expect(res.body.bookmark.title).toBe('Updated Title');
    });

    it('should return 404 if bookmark not found', async () => {
      const res = await request(app)
        .put('/api/bookmarks/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated',
        });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/bookmarks/:id', () => {
    let bookmarkId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          url: 'https://example.com',
        });

      bookmarkId = res.body.bookmark._id;
    });

    it('should delete bookmark', async () => {
      const res = await request(app)
        .delete(`/api/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Bookmark deleted successfully');

      // Verify bookmark is deleted
      const bookmark = await Bookmark.findById(bookmarkId);
      expect(bookmark).toBeNull();
    });

    it('should return 404 if bookmark not found', async () => {
      const res = await request(app)
        .delete('/api/bookmarks/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });
  });
});
