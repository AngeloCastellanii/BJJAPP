"use client";

import { Avatar } from "@/components/profile/avatar";
import { AvatarCatalog } from "@/components/profile/avatar-catalog";
import { Button } from "@/components/ui/button";
import { SoftPanel } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { BELTS, BELT_LABELS } from "@/lib/belts";
import type { Academy, Belt, Profile } from "@/lib/types";
import { updateProfile } from "@/server/repositories/profiles";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function ProfileEditForm({
  profile,
  academies,
}: {
  profile: Profile;
  academies: Academy[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);

  if (!open) {
    return (
      <Button variant="secondary" className="w-full" onClick={() => setOpen(true)}>
        Editar perfil
      </Button>
    );
  }

  return (
    <SoftPanel className="animate-rise p-4">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setError(null);
          start(async () => {
            try {
              await updateProfile({
                display_name: String(fd.get("display_name")),
                username: String(fd.get("username")),
                bio: String(fd.get("bio")),
                city: String(fd.get("city")),
                belt: fd.get("belt") as Belt,
                stripes: Number(fd.get("stripes")),
                academy_id: String(fd.get("academy_id") || "") || null,
                avatar_url: avatarUrl,
              });
              setOpen(false);
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Error");
            }
          });
        }}
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-xl tracking-tight">Editar</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Avatar
              name={profile.display_name}
              src={avatarUrl}
              size="lg"
            />
            <div>
              <Label>Avatar</Label>
              <p className="mt-1 text-xs text-muted">Elige uno del catálogo</p>
            </div>
          </div>
          <AvatarCatalog
            value={avatarUrl}
            onChange={setAvatarUrl}
            preferredSeed={profile.username}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="display_name">Nombre</Label>
            <Input
              id="display_name"
              name="display_name"
              defaultValue={profile.display_name}
              required
            />
          </div>
          <div>
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              name="username"
              defaultValue={profile.username}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" name="city" defaultValue={profile.city} required />
          </div>
          <div>
            <Label htmlFor="belt">Cinturón</Label>
            <Select id="belt" name="belt" defaultValue={profile.belt}>
              {BELTS.map((b) => (
                <option key={b} value={b}>
                  {BELT_LABELS[b]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="stripes">Grados</Label>
            <Select
              id="stripes"
              name="stripes"
              defaultValue={String(profile.stripes)}
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="academy_id">Academia</Label>
          <Select
            id="academy_id"
            name="academy_id"
            defaultValue={profile.academy_id ?? ""}
          >
            <option value="">Sin academia</option>
            {academies.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.city}
              </option>
            ))}
          </Select>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button className="w-full" disabled={pending}>
          Guardar cambios
        </Button>
      </form>
    </SoftPanel>
  );
}
