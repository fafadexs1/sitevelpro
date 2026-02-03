type FilterOp = "eq" | "in" | "gte" | "lt";

type Filter = {
  op: FilterOp;
  column: string;
  value: any;
};

type Order = {
  column: string;
  ascending: boolean;
};

type QueryPayload = {
  table: string;
  action: "select" | "insert" | "update" | "delete" | "upsert";
  columns?: string[] | null;
  returning?: string[] | null;
  values?: any;
  filters?: Filter[];
  order?: Order[];
  limit?: number;
  single?: boolean;
  maybeSingle?: boolean;
  onConflict?: string | null;
};

type QueryResult<T = any> = {
  data: T | null;
  error: { message: string; code?: string } | null;
};

export type AuthUser = { id: string; email: string };
type AuthSession = { user: AuthUser };

const authListeners = new Set<(event: string, session: AuthSession | null) => void>();

function notifyAuth(event: string, session: AuthSession | null) {
  authListeners.forEach((listener) => listener(event, session));
}

class QueryBuilder {
  private table: string;
  private action: QueryPayload["action"] | null = null;
  private columns: string[] | null = null;
  private returning: string[] | null = null;
  private values: any = null;
  private filters: Filter[] = [];
  private orderByList: Order[] = [];
  private limitCount: number | null = null;
  private singleFlag = false;
  private maybeSingleFlag = false;
  private onConflict: string | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = "*") {
    const parsed = parseColumns(columns);
    if (this.action && this.action !== "select") {
      this.returning = parsed;
    } else {
      this.action = "select";
      this.columns = parsed;
    }
    return this;
  }

  insert(values: any) {
    this.action = "insert";
    this.values = values;
    return this;
  }

  update(values: any) {
    this.action = "update";
    this.values = values;
    return this;
  }

  delete() {
    this.action = "delete";
    return this;
  }

  upsert(values: any, options?: { onConflict?: string }) {
    this.action = "upsert";
    this.values = values;
    this.onConflict = options?.onConflict ?? null;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ op: "eq", column, value });
    return this;
  }

  in(column: string, value: any[]) {
    this.filters.push({ op: "in", column, value });
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push({ op: "gte", column, value });
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push({ op: "lt", column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderByList.push({ column, ascending: options?.ascending !== false });
    return this;
  }

  limit(count: number) {
    if (Number.isFinite(count)) {
      this.limitCount = count;
    }
    return this;
  }

  single() {
    this.singleFlag = true;
    return this;
  }

  maybeSingle() {
    this.maybeSingleFlag = true;
    return this;
  }

  async execute(): Promise<QueryResult> {
    const action = this.action ?? "select";
    const payload: QueryPayload = {
      table: this.table,
      action,
      columns: this.columns,
      returning: this.returning,
      values: this.values,
      filters: this.filters,
      order: this.orderByList,
      limit: this.limitCount ?? undefined,
      single: this.singleFlag,
      maybeSingle: this.maybeSingleFlag,
      onConflict: this.onConflict,
    };

    try {
      const res = await fetch("/api/admin/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as QueryResult;
      return data;
    } catch (error: any) {
      return { data: null, error: { message: error?.message || "Request failed" } };
    }
  }

  then(resolve: (value: QueryResult) => any, reject?: (reason: any) => any) {
    return this.execute().then(resolve, reject);
  }
}

class StorageBucket {
  private bucket: string;

  constructor(bucket: string) {
    this.bucket = bucket;
  }

  async upload(path: string, file: File, options?: { upsert?: boolean }) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);
    formData.append("bucket", this.bucket);
    if (options?.upsert) {
      formData.append("upsert", "true");
    }

    try {
      const res = await fetch("/api/admin/storage/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data as QueryResult<{ path: string }>;
    } catch (error: any) {
      return { data: null, error: { message: error?.message || "Upload failed" } };
    }
  }

  getPublicUrl(path: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return { data: { publicUrl: `${origin}/uploads/${this.bucket}/${path}` } };
  }

  async remove(paths: string[]) {
    try {
      const res = await fetch("/api/admin/storage/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: this.bucket, paths }),
      });
      const data = await res.json();
      return data as QueryResult;
    } catch (error: any) {
      return { data: null, error: { message: error?.message || "Remove failed" } };
    }
  }
}

class StorageClient {
  from(bucket: string) {
    return new StorageBucket(bucket);
  }
}

class AuthClient {
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { data: { user: null }, error: { message: errorData?.message || "Login failed" } };
      }

      const data = await res.json();
      const user: AuthUser = data?.user ?? { id: email, email };
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_session", JSON.stringify({ user }));
      }
      notifyAuth("SIGNED_IN", { user });
      return { data: { user }, error: null };
    } catch (error: any) {
      return { data: { user: null }, error: { message: error?.message || "Login failed" } };
    }
  }

  async signOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_session");
    }
    notifyAuth("SIGNED_OUT", null);
    return { error: null };
  }

  async getSession() {
    if (typeof window === "undefined") {
      return { data: { session: null } };
    }
    const stored = localStorage.getItem("admin_session");
    if (!stored) {
      return { data: { session: null } };
    }
    const session = JSON.parse(stored);
    return { data: { session } };
  }

  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
    authListeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => authListeners.delete(callback),
        },
      },
    };
  }
}

type RealtimeChannel = {
  on: (...args: any[]) => RealtimeChannel;
  subscribe: () => RealtimeChannel;
};

function createRealtimeChannel(): RealtimeChannel {
  const channel: RealtimeChannel = {
    on: () => channel,
    subscribe: () => channel,
  };
  return channel;
}

type AdminClient = {
  from: (table: string) => QueryBuilder;
  storage: StorageClient;
  auth: AuthClient;
  channel: (_name: string) => RealtimeChannel;
  removeChannel: (_channel: RealtimeChannel) => null;
};

let cachedClient: AdminClient | null = null;

export function createClient(): AdminClient {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = {
    from: (table: string) => new QueryBuilder(table),
    storage: new StorageClient(),
    auth: new AuthClient(),
    channel: (_name: string) => createRealtimeChannel(),
    removeChannel: (_channel: RealtimeChannel) => null,
  };

  return cachedClient;
}

function parseColumns(columns: string) {
  if (!columns || columns.trim() === "*" || columns.trim() === "") {
    return null;
  }
  return columns.split(",").map((col) => col.trim()).filter(Boolean);
}
