import request from 'supertest';
import { app } from '../server';
import { prisma } from '../lib/prisma';

describe('API Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let methodId: string;
  let sessionId: string;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.brewSession.deleteMany({});
    await prisma.settings.deleteMany({});
    await prisma.user.deleteMany({});
    
    // Ensure we have methods in the database
    const methodCount = await prisma.brewMethod.count();
    if (methodCount === 0) {
      await prisma.brewMethod.createMany({
        data: [
          {
            key: 'v60',
            name: 'Hario V60',
            defaultRatio: 15,
            bloom: true,
            pours: 2,
            presets: {
              grind: 'Medium-fine',
              tempC: 94,
              filter: 'V60 paper',
              tips: ['Rinse filter', 'Swirl after each pour']
            }
          },
          {
            key: 'chemex',
            name: 'Chemex',
            defaultRatio: 16,
            bloom: true,
            pours: 3,
            presets: {
              grind: 'Medium-coarse',
              tempC: 94,
              filter: 'Chemex paper'
            }
          }
        ]
      });
    }
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.brewSession.deleteMany({});
    await prisma.settings.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('Auth Endpoints', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'testpass123',
          displayName: 'Test User',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toMatchObject({
        email: 'test@example.com',
        displayName: 'Test User',
      });
      expect(response.headers['set-cookie']).toBeDefined();

      userId = response.body.user.id;
    });

    it('should not register user with existing email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'testpass123',
          displayName: 'Another User',
        })
        .expect(400);
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpass123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.headers['set-cookie']).toBeDefined();

      // Extract token from cookie for future requests
      const cookie = response.headers['set-cookie'][0];
      authToken = cookie.split('=')[1].split(';')[0];
    });

    it('should not login with incorrect credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should get current user when authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `access_token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toMatchObject({
        email: 'test@example.com',
        displayName: 'Test User',
      });
    });

    it('should logout successfully', async () => {
      await request(app)
        .post('/api/auth/logout')
        .set('Cookie', `access_token=${authToken}`)
        .expect(200);
    });

    it('should not access protected routes without auth', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });
  });

  describe('Settings Endpoints', () => {
    beforeAll(async () => {
      // Re-login for settings tests
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpass123',
        });
      authToken = response.headers['set-cookie'][0].split('=')[1].split(';')[0];
    });

    it('should get user settings with defaults', async () => {
      const response = await request(app)
        .get('/api/settings')
        .set('Cookie', `access_token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.settings).toMatchObject({
        units: 'METRIC',
        tempUnit: 'C',
        recommend: true,
        cupSizeMl: 240,
      });
    });

    it('should update user settings', async () => {
      const response = await request(app)
        .put('/api/settings')
        .set('Cookie', `access_token=${authToken}`)
        .send({
          units: 'IMPERIAL',
          tempUnit: 'F',
          recommend: false,
          cupSizeMl: 300,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.settings).toMatchObject({
        units: 'IMPERIAL',
        tempUnit: 'F',
        recommend: false,
        cupSizeMl: 300,
      });
    });
  });

  describe('Methods Endpoints', () => {
    it('should get all brewing methods', async () => {
      const response = await request(app)
        .get('/api/methods')
        .set('Cookie', `access_token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.methods).toBeInstanceOf(Array);
      expect(response.body.methods.length).toBeGreaterThan(0);
      
      const v60Method = response.body.methods.find((m: any) => m.key === 'v60');
      expect(v60Method).toBeDefined();
      expect(v60Method.name).toBe('Hario V60');
      
      methodId = v60Method.id;
    });

    it('should get specific method by key', async () => {
      const response = await request(app)
        .get('/api/methods/v60')
        .set('Cookie', `access_token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.method).toMatchObject({
        key: 'v60',
        name: 'Hario V60',
        defaultRatio: 15,
        bloom: true,
        pours: 2,
      });
    });

    it('should return 404 for non-existent method', async () => {
      await request(app)
        .get('/api/methods/nonexistent')
        .set('Cookie', `access_token=${authToken}`)
        .expect(404);
    });
  });

  describe('Reverse Brew Endpoints', () => {
    it('should calculate reverse brew recipe', async () => {
      const response = await request(app)
        .post('/api/reverse')
        .set('Cookie', `access_token=${authToken}`)
        .send({
          methodKey: 'v60',
          cups: 2,
          ratio: 15,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.recipe).toMatchObject({
        coffeeGrams: expect.any(Number),
        waterTotalMl: expect.any(Number),
        yieldTargetMl: expect.any(Number),
        pours: expect.arrayContaining([
          expect.objectContaining({
            atSec: expect.any(Number),
            volumeMl: expect.any(Number),
            label: expect.any(String),
          }),
        ]),
      });
    });

    it('should calculate with custom target yield', async () => {
      const response = await request(app)
        .post('/api/reverse')
        .set('Cookie', `access_token=${authToken}`)
        .send({
          methodKey: 'v60',
          cups: 2,
          targetYieldMl: 400,
        })
        .expect(200);

      expect(response.body.recipe.yieldTargetMl).toBe(400);
    });

    it('should validate input parameters', async () => {
      await request(app)
        .post('/api/reverse')
        .set('Cookie', `access_token=${authToken}`)
        .send({
          methodKey: 'invalid',
          cups: -1,
        })
        .expect(400);
    });
  });

  describe('Sessions Endpoints', () => {
    it('should create a new brewing session', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .set('Cookie', `access_token=${authToken}`)
        .send({
          methodId,
          durationSec: 300,
          coffeeGrams: 30,
          waterMl: 450,
          yieldMl: 400,
          rating: 4,
          notes: 'Great brew with floral notes',
          grindSetting: '18',
          waterTempC: 94,
          pours: [
            { atSec: 0, volumeMl: 60, label: 'Bloom' },
            { atSec: 45, volumeMl: 200, label: 'First pour' },
            { atSec: 105, volumeMl: 190, label: 'Second pour' },
          ],
          bean: {
            variety: 'Ethiopian Yirgacheffe',
            roaster: 'Blue Bottle Coffee',
            roastDate: '2024-01-15',
          },
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.session).toMatchObject({
        methodId,
        durationSec: 300,
        coffeeGrams: 30,
        rating: 4,
        notes: 'Great brew with floral notes',
      });
      
      sessionId = response.body.session.id;
    });

    it('should get user sessions', async () => {
      const response = await request(app)
        .get('/api/sessions')
        .set('Cookie', `access_token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sessions).toBeInstanceOf(Array);
      expect(response.body.sessions.length).toBe(1);
      expect(response.body.sessions[0]).toMatchObject({
        id: sessionId,
        methodId,
        rating: 4,
      });
    });

    it('should get specific session', async () => {
      const response = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Cookie', `access_token=${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.session).toMatchObject({
        id: sessionId,
        notes: 'Great brew with floral notes',
        rating: 4,
      });
    });

    it('should update session', async () => {
      const response = await request(app)
        .put(`/api/sessions/${sessionId}`)
        .set('Cookie', `access_token=${authToken}`)
        .send({
          rating: 5,
          notes: 'Updated notes - excellent brew!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.session.rating).toBe(5);
      expect(response.body.session.notes).toBe('Updated notes - excellent brew!');
    });

    it('should search sessions', async () => {
      const response = await request(app)
        .get('/api/sessions?q=excellent')
        .set('Cookie', `access_token=${authToken}`)
        .expect(200);

      expect(response.body.sessions.length).toBe(1);
    });

    it('should not access other users sessions', async () => {
      // Create another user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other@example.com',
          password: 'testpass123',
          displayName: 'Other User',
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@example.com',
          password: 'testpass123',
        });

      const otherToken = loginResponse.headers['set-cookie'][0].split('=')[1].split(';')[0];

      // Try to access first user's session
      await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Cookie', `access_token=${otherToken}`)
        .expect(404);
    });

    it('should delete session', async () => {
      await request(app)
        .delete(`/api/sessions/${sessionId}`)
        .set('Cookie', `access_token=${authToken}`)
        .expect(200);

      // Verify session is deleted
      await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Cookie', `access_token=${authToken}`)
        .expect(404);
    });
  });

  describe('Health Check', () => {
    it('should respond to health check', async () => {
      const response = await request(app)
        .get('/healthz')
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});