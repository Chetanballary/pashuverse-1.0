import mongoose from "mongoose";
import * as schema from "./schema";

const safeGetTableName = (table: any): string => {
  if (!table) return "unknown";
  if (typeof table === "string") return table;
  if (typeof table?.name === "string") return table.name;
  if (typeof table?.tableName === "string") return table.tableName;
  return String(table);
};

const inMemoryStore = new Map<string, any[]>();

const readTableRows = (table: any): any[] => {
  const name = safeGetTableName(table);
  if (!inMemoryStore.has(name)) {
    inMemoryStore.set(name, []);
  }
  return inMemoryStore.get(name)!;
};

class QueryBuilder {
  private table: any;
  private rows: any[];
  private pendingValues: Record<string, any> | null = null;
  private pendingSet: Record<string, any> | null = null;
  private selectFields: any = null;

  constructor(table?: any, rows: any[] = [], selectFields: any = null) {
    this.table = table;
    this.rows = rows;
    this.selectFields = selectFields;
  }

  from(table: any) {
    this.table = table;
    this.rows = readTableRows(table);
    return this;
  }

  where(predicate: any) {
    if (!this.table) return this;
    if (typeof predicate === "function") {
      this.rows = this.rows.filter(predicate);
      return this;
    }
    if (predicate && typeof predicate === "object" && !Array.isArray(predicate)) {
      const entries = Object.entries(predicate);
      if (entries.length) {
        this.rows = this.rows.filter((row) =>
          entries.every(([key, value]) => row[key] === value)
        );
      }
    }
    return this;
  }

  orderBy(sorter: any) {
    if (typeof sorter === "function") {
      this.rows = [...this.rows].sort(sorter);
      return this;
    }
    if (sorter && typeof sorter === "object") {
      const [[key, direction]] = Object.entries(sorter);
      const dir = direction === "desc" ? -1 : 1;
      this.rows = [...this.rows].sort((a, b) => {
        const av = a?.[key];
        const bv = b?.[key];
        if (av == null) return 1;
        if (bv == null) return -1;
        return av > bv ? dir : av < bv ? -dir : 0;
      });
    }
    return this;
  }

  limit(count: number) {
    if (Number.isFinite(count)) {
      this.rows = this.rows.slice(0, count);
    }
    return this;
  }

  values(values: Record<string, any>) {
    this.pendingValues = values;
    return this;
  }

  set(values: Record<string, any>) {
    this.pendingSet = values;
    return this;
  }

  returning() {
    if (!this.table) {
      return this.rows;
    }

    if (this.pendingValues) {
      const entries = Array.isArray(this.rows) ? this.rows : [];
      const row = { ...this.pendingValues };
      readTableRows(this.table).push(row);
      this.rows = [row];
      this.pendingValues = null;
      return this;
    }

    if (this.pendingSet) {
      const tableRows = readTableRows(this.table);
      const updated = tableRows.map((row) => {
        if (!this.rows.includes(row)) return row;
        return { ...row, ...this.pendingSet };
      });
      tableRows.splice(0, tableRows.length, ...updated);
      this.rows = updated.filter((row) => this.rows.includes(row));
      this.pendingSet = null;
      return this;
    }

    return this;
  }

  then(resolve: (value: any) => void) {
    resolve(this.execute());
    return Promise.resolve(this.execute());
  }

  private execute() {
    if (!this.table) return this.rows;
    const baseRows = this.rows.length ? this.rows : readTableRows(this.table);

    if (this.selectFields && typeof this.selectFields === "object") {
      const keys = Object.keys(this.selectFields);
      if (keys.includes("count")) {
        return [{ count: baseRows.length }];
      }
      return baseRows.map((row) => {
        const output: Record<string, any> = {};
        for (const key of keys) {
          output[key] = row[key];
        }
        return output;
      });
    }

    return baseRows;
  }
}

const createMongoCompatDb = () => {
  const db = {
    select: (fields: any = null) => {
      const table = undefined;
      const rows: any[] = [];
      return new QueryBuilder(table, rows, fields);
    },
    insert: (table: any) => new QueryBuilder(table),
    update: (table: any) => new QueryBuilder(table),
    delete: (table: any) => new QueryBuilder(table),
  };

  return db;
};

const mongoUri = process.env.MONGODB_URI;
let db: any;
let connection: any = null;

if (mongoUri) {
  mongoose.connect(mongoUri).catch((err) => {
    console.error("MongoDB connection failed:", err);
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB runtime error:", err);
  });

  db = createMongoCompatDb();
  connection = mongoose.connection;
} else {
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const pg = await import("pg");
  const { Pool } = pg.default ?? pg;

  const connectionString = process.env.DATABASE_URL || "";

  if (!connectionString) {
    console.warn("No MONGODB_URI or DATABASE_URL configured; using local Mongo-compatible fallback.");
    db = createMongoCompatDb();
    connection = null;
  } else {
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false }
    });

    pool.on("error", (err) => {
      console.warn("Database pool background error:", err.message);
    });

    db = drizzle(pool, { schema });
    connection = pool;
  }
}

export { db, connection };
export * from "./schema";
