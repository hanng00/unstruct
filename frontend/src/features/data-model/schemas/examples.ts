import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  age: z.number().optional(),
  createdAt: z.iso.datetime(),
});

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  category: z.string(),
  inStock: z.boolean(),
});

const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number(),
      price: z
        .number()
        .describe("The price of the item, given in EUR. Example: 100.00"),
    })
  ),
  total: z.number(),
  status: z.enum(["pending", "shipped", "delivered"]),
});


export { OrderSchema, ProductSchema, UserSchema };
