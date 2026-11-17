import type { APIRequestContext } from '@playwright/test';
import type { z } from 'zod';
import type { User } from '@data/user.factory';
import {
  BrandsResponseSchema,
  MessageResponseSchema,
  ProductsResponseSchema,
  UserDetailResponseSchema,
} from './schemas';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type FormFields = Record<string, string>;

export interface ApiResult<T> {
  /** Transport status. The store answers 200 even for logical errors. */
  httpStatus: number;
  body: T;
}

/** Typed client for https://automationexercise.com/api_list. */
export class AutomationExerciseApi {
  constructor(private readonly request: APIRequestContext) {}

  getProducts() {
    return this.send('GET', '/api/productsList', ProductsResponseSchema);
  }

  postProducts() {
    return this.send('POST', '/api/productsList', MessageResponseSchema);
  }

  getBrands() {
    return this.send('GET', '/api/brandsList', BrandsResponseSchema);
  }

  putBrands() {
    return this.send('PUT', '/api/brandsList', MessageResponseSchema);
  }

  searchProduct(term: string) {
    return this.send('POST', '/api/searchProduct', ProductsResponseSchema, {
      search_product: term,
    });
  }

  searchProductWithoutTerm() {
    return this.send('POST', '/api/searchProduct', MessageResponseSchema);
  }

  verifyLogin(credentials: { email?: string; password?: string }) {
    const form: FormFields = {};
    if (credentials.email !== undefined) form.email = credentials.email;
    if (credentials.password !== undefined) form.password = credentials.password;
    return this.send('POST', '/api/verifyLogin', MessageResponseSchema, form);
  }

  deleteVerifyLogin() {
    return this.send('DELETE', '/api/verifyLogin', MessageResponseSchema);
  }

  createAccount(user: User) {
    return this.send('POST', '/api/createAccount', MessageResponseSchema, toAccountForm(user));
  }

  updateAccount(user: User) {
    return this.send('PUT', '/api/updateAccount', MessageResponseSchema, toAccountForm(user));
  }

  deleteAccount(email: string, password: string) {
    return this.send('DELETE', '/api/deleteAccount', MessageResponseSchema, { email, password });
  }

  getUserDetailByEmail(email: string) {
    return this.send('GET', '/api/getUserDetailByEmail', UserDetailResponseSchema, undefined, {
      email,
    });
  }

  /** Same endpoint, parsed as an error message for negative scenarios. */
  getUserDetailByEmailExpectingError(email: string) {
    return this.send('GET', '/api/getUserDetailByEmail', MessageResponseSchema, undefined, {
      email,
    });
  }

  private async send<S extends z.ZodType>(
    method: HttpMethod,
    path: string,
    schema: S,
    form?: FormFields,
    params?: Record<string, string>,
  ): Promise<ApiResult<z.infer<S>>> {
    const response = await this.request.fetch(path, { method, multipart: form, params });
    const text = await response.text();

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(
        `${method} ${path} returned a non-JSON body (HTTP ${response.status()}): ${text.slice(0, 200)}`,
      );
    }

    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw new Error(
        `${method} ${path} response broke its contract: ${parsed.error.message}\nBody: ${text.slice(0, 500)}`,
      );
    }
    return { httpStatus: response.status(), body: parsed.data };
  }
}

function toAccountForm(user: User): FormFields {
  return {
    name: user.name,
    email: user.email,
    password: user.password,
    title: user.title,
    birth_date: user.birthDay,
    birth_month: user.birthMonth,
    birth_year: user.birthYear,
    firstname: user.firstName,
    lastname: user.lastName,
    company: user.company,
    address1: user.address1,
    address2: user.address2,
    country: user.country,
    zipcode: user.zipcode,
    state: user.state,
    city: user.city,
    mobile_number: user.mobileNumber,
  };
}
