import { readFileSync, writeFileSync } from "node:fs";

const path = "src/server/mock/seed.ts";
let s = readFileSync(path, "utf8");

s = s.replace(/badge_color: "#14532d"/, 'badge_color: "#161616"');

s = s.replace(
  /display_name: "([^"]+)",\n(\s+)bio:/g,
  'display_name: "$1",\n$2email: null,\n$2bio:',
);

const demoBlock =
  /id: DEMO_USER_ID,\n    username: "angelo",\n    display_name: "Angelo Castellani",\n    email: null,\n    bio: "Dueño de Nueva Era Maracaibo\. Azul\. Siempre listo para una rolada con amigos\.",\n    avatar_url: avatarFallback\("angelo-castellani"\),\n    city: "Maracaibo",\n    country: "VE",\n    lat: 10\.654,\n    lng: -71\.612,\n    belt: "blue",\n    stripes: 2,\n    belt_verified: true,\n    belt_verified_by: "user-5",\n    belt_verified_at: iso\(-30 \* day\),\n    role: "owner",\n    academy_id: "acad-3",\n    created_at: iso\(-60 \* day\),\n    updated_at: iso\(-1 \* day\),/;

s = s.replace(
  demoBlock,
  `id: DEMO_USER_ID,
    username: "pending",
    display_name: "",
    email: null,
    bio: null,
    avatar_url: null,
    city: "",
    country: "VE",
    lat: null,
    lng: null,
    belt: "white",
    stripes: 0,
    belt_verified: false,
    belt_verified_by: null,
    belt_verified_at: null,
    role: "owner",
    academy_id: null,
    onboarding_completed: false,
    created_at: iso(-60 * day),
    updated_at: iso(-1 * day),`,
);

s = s.replace(
  /academy_id: ("[^"]+"|null),\n(\s+)(?!onboarding_completed)created_at:/g,
  "academy_id: $1,\n$2onboarding_completed: true,\n$2created_at:",
);

writeFileSync(path, s);
console.log("ok");
