import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth & Protected Routes (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login should return JWT and user', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    expect(res.body.user).toMatchObject({ username: 'admin', role: 'ADMIN' });
  });

  it('GET /greenhouses with token should return 200', async () => {
    const login = await request(server)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' })
      .expect(201);

    const token = login.body.access_token;

    const res = await request(server)
      .get('/greenhouses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /users without token should return 401', async () => {
    await request(server).get('/users').expect(401);
  });

  it('GET /users with admin token should return 200', async () => {
    const login = await request(server)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' })
      .expect(200);

    const token = login.body.access_token;

    const res = await request(server)
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('USER cannot delete a user (AdminGuard) and ADMIN can delete', async () => {
    // register a temporary user with a unique name
    const tempUsername = `tempuser_${Date.now()}`;

    const reg = await request(server)
      .post('/auth/register')
      .send({ username: tempUsername, password: 'temp' })
      .expect(201);

    const newUser = reg.body;
    expect(newUser.username).toBe(tempUsername);

    // login as the new user (USER role)
    const userLogin = await request(server)
      .post('/auth/login')
      .send({ username: tempUsername, password: 'temp' })
      .expect(201);

    const userToken = userLogin.body.access_token;

    // attempt delete with USER token -> should be 403 Forbidden
    await request(server)
      .delete(`/users/${newUser.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    // now delete with ADMIN token -> should succeed (200)
    const adminLogin = await request(server)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' })
      .expect(201);

    const adminToken = adminLogin.body.access_token;

    await request(server)
      .delete(`/users/${newUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});
