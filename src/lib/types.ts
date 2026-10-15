export type Belt =
  | "white"
  | "blue"
  | "purple"
  | "brown"
  | "black"
  | "coral"
  | "red";

export type UserRole = "user" | "coach" | "master" | "owner";

export type GatheringType =
  | "rolada"
  | "open_mat"
  | "event"
  | "competition"
  | "tope"
  | "seminar";

export type GatheringStatus = "upcoming" | "ongoing" | "archived" | "cancelled";
export type PartnershipStatus = "pending" | "accepted" | "rejected" | "cancelled";
export type MatchStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";
export type PostType = "post" | "article";
export type PostVisibility = "public" | "friends" | "academy";
export type ParticipantStatus = "invited" | "joined" | "declined" | "cancelled";
export type MembershipStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface Academy {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  description: string | null;
  logo_url: string | null;
  badge_label: string;
  badge_color: string;
  owner_id: string | null;
  created_at: string;
  member_count?: number;
}

export interface AcademyMembership {
  id: string;
  academy_id: string;
  profile_id: string;
  status: MembershipStatus;
  role_in_academy: UserRole;
  created_at: string;
  updated_at: string;
  academy?: Academy;
  profile?: Profile;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
  belt: Belt;
  stripes: number;
  belt_verified: boolean;
  belt_verified_by: string | null;
  belt_verified_at: string | null;
  role: UserRole;
  academy_id: string | null;
  onboarding_completed: boolean;
  academy?: Academy | null;
  created_at: string;
  updated_at: string;
}

export interface BeltPromotion {
  id: string;
  profile_id: string;
  promoted_by: string;
  from_belt: Belt;
  from_stripes: number;
  to_belt: Belt;
  to_stripes: number;
  notes: string | null;
  created_at: string;
  profile?: Profile;
  promoter?: Profile;
}

export interface Partnership {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: PartnershipStatus;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  addressee?: Profile;
}

export interface Gathering {
  id: string;
  type: GatheringType;
  title: string;
  description: string | null;
  location_name: string;
  city: string;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  host_id: string;
  academy_id: string | null;
  status: GatheringStatus;
  created_at: string;
  host?: Profile;
  academy?: Academy | null;
  participant_count?: number;
  participants?: GatheringParticipant[];
}

export interface GatheringParticipant {
  id: string;
  gathering_id: string;
  profile_id: string;
  status: ParticipantStatus;
  created_at: string;
  profile?: Profile;
}

export interface Match {
  id: string;
  challenger_id: string;
  opponent_id: string;
  status: MatchStatus;
  winner_id: string | null;
  notes: string | null;
  scheduled_at: string | null;
  completed_at: string | null;
  gathering_id: string | null;
  created_at: string;
  updated_at: string;
  challenger?: Profile;
  opponent?: Profile;
  winner?: Profile | null;
}

export interface Technique {
  id: string;
  name: string;
  category: string;
  position: string;
  description: string | null;
}

export interface TechniqueLog {
  id: string;
  profile_id: string;
  technique_id: string;
  notes: string | null;
  practiced_at: string;
  created_at: string;
  technique?: Technique;
}

export interface Post {
  id: string;
  author_id: string;
  type: PostType;
  title: string | null;
  body: string;
  cover_url: string | null;
  image_urls: string[];
  visibility: PostVisibility;
  academy_id: string | null;
  published_at: string;
  created_at: string;
  author?: Profile;
  academy?: Academy | null;
  like_count?: number;
  comment_count?: number;
  liked_by_me?: boolean;
}

export interface PostLike {
  id: string;
  post_id: string;
  profile_id: string;
  created_at: string;
  profile?: Profile;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: Profile;
}

export interface RankingEntry {
  profile_id: string;
  wins: number;
  profile: Profile;
}

export type RankingPeriod = "week" | "month" | "academy";
