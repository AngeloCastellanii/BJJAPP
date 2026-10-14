import type {
  Academy,
  Gathering,
  GatheringParticipant,
  Match,
  Partnership,
  Post,
  Profile,
  Technique,
  TechniqueLog,
} from "@/lib/types";
import {
  academies as seedAcademies,
  gatheringParticipants as seedParticipants,
  gatherings as seedGatherings,
  matches as seedMatches,
  partnerships as seedPartnerships,
  posts as seedPosts,
  profiles as seedProfiles,
  techniqueLogs as seedLogs,
  techniques as seedTechniques,
} from "./seed";

export interface MockStore {
  academies: Academy[];
  profiles: Profile[];
  partnerships: Partnership[];
  gatherings: Gathering[];
  gatheringParticipants: GatheringParticipant[];
  matches: Match[];
  techniques: Technique[];
  techniqueLogs: TechniqueLog[];
  posts: Post[];
  sessionUserId: string | null;
}

declare global {
  var __bjjMockStore: MockStore | undefined;
}

function cloneStore(): MockStore {
  return {
    academies: structuredClone(seedAcademies),
    profiles: structuredClone(seedProfiles),
    partnerships: structuredClone(seedPartnerships),
    gatherings: structuredClone(seedGatherings),
    gatheringParticipants: structuredClone(seedParticipants),
    matches: structuredClone(seedMatches),
    techniques: structuredClone(seedTechniques),
    techniqueLogs: structuredClone(seedLogs),
    posts: structuredClone(seedPosts),
    sessionUserId: null,
  };
}

export function getStore(): MockStore {
  if (!globalThis.__bjjMockStore) {
    globalThis.__bjjMockStore = cloneStore();
  }
  return globalThis.__bjjMockStore;
}

export function resetStore() {
  globalThis.__bjjMockStore = cloneStore();
  return globalThis.__bjjMockStore;
}

export function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}
