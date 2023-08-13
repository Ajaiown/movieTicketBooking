const assert = require('assert');
const request = require('supertest');
const app = require('../app'); // Update the path to your app's main file

describe('Login Route', () => {
  it('should log in a user with valid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'testuser',
        password: 'testpassword'
      });

    assert.strictEqual(response.status, 302); // Assuming you're redirecting after successful login
    // Add more assertions to test the behavior as needed
  });

  it('should reject login with invalid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword'
      });

    assert.strictEqual(response.status, 401); // Assuming you're returning 401 Unauthorized
    // Add more assertions to test the behavior as needed
  });
});
