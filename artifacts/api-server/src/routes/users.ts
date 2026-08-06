import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

const router: IRouter = Router();

// GET /api/users - List users in Supabase, optionally filtered by role
router.get("/users", async (req, res): Promise<void> => {
  const { role } = req.query;
  try {
    let query = db.select().from(usersTable);
    if (role && typeof role === "string") {
      // @ts-ignore
      const users = await query.where(eq(usersTable.role, role));
      res.json(users);
      return;
    }
    const users = await query.orderBy(usersTable.createdAt);
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login or POST /api/users - Save user input details directly to Supabase
router.post("/auth/login", async (req, res): Promise<void> => {
  const { id, name, email, role, phone, location } = req.body;
  if (!email || !name) {
    res.status(400).json({ error: "Name and Email are required" });
    return;
  }

  const userId = id || `user-${role?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
    
    if (existing.length > 0) {
      // Update last login timestamp and optional updated details
      const [updated] = await db.update(usersTable)
        .set({
          name: name || existing[0].name,
          role: role || existing[0].role,
          phone: phone || existing[0].phone,
          location: location || existing[0].location,
          lastLogin: new Date()
        })
        .where(eq(usersTable.email, email))
        .returning();
      res.json(updated);
      return;
    }

    // Insert new user input into Supabase
    const [newUser] = await db.insert(usersTable).values({
      id: userId,
      name,
      email,
      role: role || "Farmer",
      phone: phone || null,
      location: location || null,
      isVerified: true,
      lastLogin: new Date()
    }).returning();

    res.status(201).json(newUser);
  } catch (err: any) {
    console.error("Error saving user to Supabase:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id
router.get("/users/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
