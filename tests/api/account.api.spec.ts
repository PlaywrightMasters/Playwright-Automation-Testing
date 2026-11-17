import { test, expect } from '@fixtures/test';
import { buildUser } from '@data/user.factory';

test.describe('Account API', () => {
  test(
    'API-07: account lifecycle – create, read, update, delete',
    { tag: '@smoke' },
    async ({ api, newUser }) => {
      await test.step('create the account', async () => {
        const { body } = await api.createAccount(newUser);
        expect(body).toEqual({ responseCode: 201, message: 'User created!' });
      });

      await test.step('reject a second account with the same email', async () => {
        const { body } = await api.createAccount(newUser);
        expect(body).toEqual({ responseCode: 400, message: 'Email already exists!' });
      });

      await test.step('verify the credentials', async () => {
        const { body } = await api.verifyLogin({
          email: newUser.email,
          password: newUser.password,
        });
        expect(body).toEqual({ responseCode: 200, message: 'User exists!' });
      });

      await test.step('read the stored details', async () => {
        const { body } = await api.getUserDetailByEmail(newUser.email);
        expect(body.user).toMatchObject({
          name: newUser.name,
          email: newUser.email,
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          company: newUser.company,
          address1: newUser.address1,
          country: newUser.country,
          state: newUser.state,
          city: newUser.city,
          zipcode: newUser.zipcode,
        });
      });

      await test.step('update profile fields', async () => {
        const changes = buildUser();
        const updated = {
          ...newUser,
          company: changes.company,
          city: changes.city,
          zipcode: changes.zipcode,
        };
        const { body } = await api.updateAccount(updated);
        expect(body).toEqual({ responseCode: 200, message: 'User updated!' });

        const { body: details } = await api.getUserDetailByEmail(newUser.email);
        expect(details.user).toMatchObject({
          company: updated.company,
          city: updated.city,
          zipcode: updated.zipcode,
        });
      });

      await test.step('delete the account', async () => {
        const { body } = await api.deleteAccount(newUser.email, newUser.password);
        expect(body).toEqual({ responseCode: 200, message: 'Account deleted!' });

        const { body: login } = await api.verifyLogin({
          email: newUser.email,
          password: newUser.password,
        });
        expect(login.responseCode).toBe(404);
      });
    },
  );

  test('API-08: verifyLogin with unknown credentials returns 404', async ({ api, newUser }) => {
    const { body } = await api.verifyLogin({ email: newUser.email, password: newUser.password });

    expect(body).toEqual({ responseCode: 404, message: 'User not found!' });
  });

  test('API-09: verifyLogin without an email is a bad request', async ({ api }) => {
    const { body } = await api.verifyLogin({ password: 'irrelevant' });

    expect(body).toEqual({
      responseCode: 400,
      message: 'Bad request, email or password parameter is missing in POST request.',
    });
  });

  test('API-10: DELETE verifyLogin is rejected as an unsupported method', async ({ api }) => {
    const { body } = await api.deleteVerifyLogin();

    expect(body).toEqual({ responseCode: 405, message: 'This request method is not supported.' });
  });

  test('API-11: user details for an unknown email return 404', async ({ api, newUser }) => {
    const { body } = await api.getUserDetailByEmailExpectingError(newUser.email);

    expect(body).toEqual({
      responseCode: 404,
      message: 'Account not found with this email, try another email!',
    });
  });
});
