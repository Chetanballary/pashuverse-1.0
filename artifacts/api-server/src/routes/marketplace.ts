import { Router, type IRouter } from "express";
import { eq, ilike, and } from "drizzle-orm";
import { db, productsTable, ordersTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  GetProductParams,
  CreateOrderBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/marketplace/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const conditions = [];
  if (parsed.data.category) conditions.push(eq(productsTable.category, parsed.data.category));
  if (parsed.data.search) conditions.push(ilike(productsTable.name, `%${parsed.data.search}%`));
  const products = conditions.length > 0
    ? await db.select().from(productsTable).where(and(...conditions))
    : await db.select().from(productsTable);
  res.json(products);
});

router.get("/marketplace/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(product);
});

router.get("/marketplace/orders", async (req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  res.json(orders);
});

router.post("/marketplace/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, parsed.data.productId));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  const totalAmount = product.price * parsed.data.quantity;
  const [order] = await db.insert(ordersTable).values({
    ...parsed.data,
    productName: product.name,
    totalAmount,
    status: "pending",
  }).returning();
  res.status(201).json(order);
});

export default router;
