import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, communityPostsTable } from "@workspace/db";
import {
  ListCommunityPostsQueryParams,
  CreateCommunityPostBody,
  GetCommunityPostParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/community/posts", async (req, res): Promise<void> => {
  const parsed = ListCommunityPostsQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  let posts;
  if (parsed.data.category) {
    posts = await db.select().from(communityPostsTable).where(eq(communityPostsTable.category, parsed.data.category)).orderBy(communityPostsTable.createdAt);
  } else {
    posts = await db.select().from(communityPostsTable).orderBy(communityPostsTable.createdAt);
  }
  res.json(posts);
});

router.post("/community/posts", async (req, res): Promise<void> => {
  const parsed = CreateCommunityPostBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [post] = await db.insert(communityPostsTable).values(parsed.data).returning();
  res.status(201).json(post);
});

router.get("/community/posts/:id", async (req, res): Promise<void> => {
  const params = GetCommunityPostParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [post] = await db.select().from(communityPostsTable).where(eq(communityPostsTable.id, params.data.id));
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }
  res.json(post);
});

export default router;
