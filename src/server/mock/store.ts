import type {
  Academy,
  AcademyMembership,
  BeltPromotion,
  Gathering,
  GatheringParticipant,
  Match,
  Partnership,
  Post,
  PostComment,
  PostLike,
  Profile,
  Technique,
  TechniqueLog,
} from "@/lib/types";
import {
  academies as seedAcademies,
  beltPromotions as seedPromotions,
  gatheringParticipants as seedParticipants,
  gatherings as seedGatherings,
  matches as seedMatches,
  memberships as seedMemberships,
  partnerships as seedPartnerships,
  postComments as seedComments,
  postLikes as seedLikes,
  posts as seedPosts,
  profiles as seedProfiles,
  techniqueLogs as seedLogs,
  techniques as seedTechniques,
} from "./seed";

export interface Account {
  id: string;
  profile_id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface MockStore {
  academies: Academy[];
  memberships: AcademyMembership[];
  beltPromotions: BeltPromotion[];
  accounts: Account[];
  profiles: Profile[];
  partnerships: Partnership[];
  gatherings: Gathering[];
  gatheringParticipants: GatheringParticipant[];
  matches: Match[];
  techniques: Technique[];
  techniqueLogs: TechniqueLog[];
  posts: Post[];
  postLikes: PostLike[];
  postComments: PostComment[];
  sessionUserId: string | null;
}

declare global {
  var __bjjMockStore: MockStore | undefined;
  var __bjjMockStoreVersion: number | undefined;
}

const STORE_VERSION = 11;

function cloneStore(): MockStore {
  return {
    academies: structuredClone(seedAcademies),
    memberships: structuredClone(seedMemberships),
    beltPromotions: structuredClone(seedPromotions),
    accounts: [],
    profiles: structuredClone(seedProfiles),
    partnerships: structuredClone(seedPartnerships),
    gatherings: structuredClone(seedGatherings),
    gatheringParticipants: structuredClone(seedParticipants),
    matches: structuredClone(seedMatches),
    techniques: structuredClone(seedTechniques),
    techniqueLogs: structuredClone(seedLogs),
    posts: structuredClone(seedPosts),
    postLikes: structuredClone(seedLikes),
    postComments: structuredClone(seedComments),
    sessionUserId: null,
  };
}

export function getStore(): MockStore {
  if (
    !globalThis.__bjjMockStore ||
    globalThis.__bjjMockStoreVersion !== STORE_VERSION
  ) {
    globalThis.__bjjMockStore = cloneStore();
    globalThis.__bjjMockStoreVersion = STORE_VERSION;
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
