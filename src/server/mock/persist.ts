import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Academy, AcademyMembership, Profile } from "@/lib/types";
import { after } from "next/server";
import type { Account, MockStore } from "./store";

const KEY = "bjj-accounts-v1";

type Snapshot = {
  savedAt: number;
  accounts: Account[];
  profiles: Profile[];
  academies: Academy[];
  memberships: AcademyMembership[];
};

type KvBinding = {
  get(key: string, type: "json"): Promise<unknown>;
  put(key: string, value: string): Promise<void>;
};

let current: MockStore | null = null;
let dirty = false;
let chain: Promise<void> = Promise.resolve();
let refreshChain: Promise<void> = Promise.resolve();
let hydrating = false;
let scheduled = false;
let attached = false;
let loadedAt = 0;

function readKv(): KvBinding | null {
  try {
    const { env } = getCloudflareContext();
    const kv = (env as { BJJ_DATA?: KvBinding }).BJJ_DATA;
    if (!kv || typeof kv.get !== "function" || typeof kv.put !== "function") {
      return null;
    }
    return kv;
  } catch {
    return null;
  }
}

function snapshotOf(store: MockStore, savedAt: number): Snapshot {
  return {
    savedAt,
    accounts: store.accounts.map((account) => ({ ...account })),
    profiles: store.profiles.map((profile) => {
      const copy = { ...profile };
      delete copy.academy;
      return copy;
    }),
    academies: store.academies.map((academy) => {
      const copy = { ...academy };
      delete copy.member_count;
      return copy;
    }),
    memberships: store.memberships.map((membership) => {
      const copy = { ...membership };
      delete copy.profile;
      delete copy.academy;
      return copy;
    }),
  };
}

async function readFileSnapshot(): Promise<Snapshot | null> {
  try {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const raw = await readFile(
      join(process.cwd(), ".data", "bjj-store.json"),
      "utf8",
    );
    return JSON.parse(raw) as Snapshot;
  } catch {
    return null;
  }
}

async function writeFileSnapshot(snap: Snapshot) {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const dir = join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "bjj-store.json"), JSON.stringify(snap));
}

async function readSnapshot(): Promise<Snapshot | null> {
  const kv = readKv();
  if (kv) {
    const raw = await kv.get(KEY, "json");
    if (raw && typeof raw === "object") return raw as Snapshot;
    return null;
  }
  return readFileSnapshot();
}

async function writeSnapshot(snap: Snapshot) {
  const kv = readKv();
  if (kv) {
    await kv.put(KEY, JSON.stringify(snap));
    return;
  }
  try {
    await writeFileSnapshot(snap);
  } catch {
    // En el worker no hay disco. Sin KV la cuenta queda solo en memoria.
  }
}

function watchObject<T extends object>(value: T): T {
  return new Proxy(value, {
    set(target, prop, next) {
      const ok = Reflect.set(target, prop, next);
      markDirty();
      return ok;
    },
  });
}

function watchArray<T>(value: T[]): T[] {
  return new Proxy(value, {
    get(target, prop, receiver) {
      const item = Reflect.get(target, prop, receiver);
      if (
        typeof prop === "string" &&
        /^\d+$/.test(prop) &&
        item &&
        typeof item === "object"
      ) {
        return watchObject(item as object);
      }
      return item;
    },
    set(target, prop, next) {
      const ok = Reflect.set(target, prop, next);
      if (prop !== "length") markDirty();
      return ok;
    },
  });
}

function attach(store: MockStore) {
  store.accounts = watchArray(store.accounts);
  store.profiles = watchArray(store.profiles);
  store.academies = watchArray(store.academies);
  store.memberships = watchArray(store.memberships);
}

async function flushOnce() {
  await Promise.resolve();
  if (!dirty || !current) return;
  dirty = false;
  const savedAt = Date.now();
  try {
    await writeSnapshot(snapshotOf(current, savedAt));
    loadedAt = Math.max(loadedAt, savedAt);
  } catch {
    dirty = true;
  }
}

function markDirty() {
  if (hydrating || !current) return;
  dirty = true;
  chain = chain.then(flushOnce, flushOnce);
  if (scheduled) return;
  scheduled = true;
  const job = chain.finally(() => {
    scheduled = false;
  });
  try {
    getCloudflareContext().ctx.waitUntil(job);
  } catch {
    // fuera de una request
  }
  try {
    after(() => job);
  } catch {
    // fuera de una request
  }
}

function applySnapshot(store: MockStore, snap: Snapshot) {
  if (Array.isArray(snap.accounts)) store.accounts = snap.accounts;
  if (Array.isArray(snap.profiles) && snap.profiles.length > 0) {
    store.profiles = snap.profiles.map((profile) => ({
      ...profile,
      onboarding_completed: Boolean(profile.onboarding_completed),
    }));
  }
  if (Array.isArray(snap.academies) && snap.academies.length > 0) {
    store.academies = snap.academies;
  }
  if (Array.isArray(snap.memberships)) store.memberships = snap.memberships;
}

export function refreshStore(store: MockStore) {
  refreshChain = refreshChain.then(() => refreshOnce(store), () => refreshOnce(store));
  return refreshChain;
}

async function refreshOnce(store: MockStore) {
  current = store;
  await chain;
  if (dirty) await flushOnce();
  const snap = await readSnapshot();
  if (!snap?.savedAt || snap.savedAt <= loadedAt) {
    if (!attached) {
      attach(store);
      attached = true;
    }
    return;
  }
  hydrating = true;
  try {
    applySnapshot(store, snap);
    loadedAt = snap.savedAt;
    dirty = false;
  } finally {
    hydrating = false;
    attach(store);
    attached = true;
  }
}

export function flushPersist() {
  return chain;
}
