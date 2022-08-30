// Hide console.log
global.console = {
  log: jest.fn(),
  // Keep native behaviour for other methods
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

const supertest = require('supertest');
const jwt = require('jwt-simple');

// Include the app
const app = require('./app.js');

// Endpoint prefix
const prefix = '/adminmate/api';

// Before all
beforeAll(done => {
  done();
});

// login
describe('Testing POST /api/login', () => {
  it('should return a 403 http response', async () => {
    // Make request
    const response = await supertest(app)
      .post(prefix + '/login')
      .send();

    // Check response
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Invalid request');
  });

  it('should return a 403 http response', async () => {
    // Make request
    const response = await supertest(app)
      .post(prefix + '/login')
      .send({
        password: 'bad_password'
      });

    // Check response
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Invalid request');
  });

  it('should return a 403 http response', async () => {
    // Make request
    const response = await supertest(app)
      .post(prefix + '/login')
      .send({
        password: 'demo-password'
      });

    // Check response
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Invalid request');
  });

  it('should return a 200 http response', async () => {
    const loginToken = jwt.encode({
      project_id: '6037b459cbb0f63c219789eb',
      exp_date: Date.now() + 600 * 1000
    }, '7dn6m0zrcsqta5b57hug52xlira4upqdempch65mwy5guehr33vt0r1s8cyrnmko');

    // Make request
    const response = await supertest(app)
      .post(prefix + '/login')
      .send({
        password: 'demo-password',
        loginToken
      });

    // Check response
    expect(response.status).toBe(200);
    expect(typeof response.body.admin_token).toBe('string');
  });
});

// After all
afterAll(done => {
  done();
});
