import { z } from 'zod';

/**
 * Contract schemas for the AutomationExercise public API.
 *
 * The API always answers with HTTP 200 and reports the logical status in the
 * `responseCode` field of the JSON body, so every schema carries it.
 */

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  price: z.string().regex(/^Rs\. \d+$/),
  brand: z.string().min(1),
  category: z.object({
    usertype: z.object({ usertype: z.string().min(1) }),
    category: z.string().min(1),
  }),
});

export const ProductsResponseSchema = z.object({
  responseCode: z.literal(200),
  products: z.array(ProductSchema),
});

export const BrandsResponseSchema = z.object({
  responseCode: z.literal(200),
  brands: z.array(z.object({ id: z.number().int().positive(), brand: z.string().min(1) })),
});

export const MessageResponseSchema = z.object({
  responseCode: z.number().int(),
  message: z.string(),
});

export const UserDetailResponseSchema = z.object({
  responseCode: z.literal(200),
  user: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    email: z.string(),
    title: z.string(),
    birth_day: z.string(),
    birth_month: z.string(),
    birth_year: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    company: z.string(),
    address1: z.string(),
    address2: z.string(),
    country: z.string(),
    state: z.string(),
    city: z.string(),
    zipcode: z.string(),
  }),
});

export type Product = z.infer<typeof ProductSchema>;
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
