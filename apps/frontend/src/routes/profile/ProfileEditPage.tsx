import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useAstronaut, useUpdateProfile } from "@/api/astronauts";
import { usePlanet } from "@/api/planets";
import { AvatarUpload } from "@/components/features/AvatarUpload";
import type { Astronaut } from "@/api/types";

const schema = z.object({
  hobbies: z.string().max(1000).nullable(),
  client: z.string().max(255).nullable(),
});

type FormValues = z.infer<typeof schema>;

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const astronautId = user?.astronaut_id;

  const { data: astronaut, isLoading } = useAstronaut(astronautId ?? 0);
  const { data: planet } = usePlanet(astronaut?.planet_id ?? 0);
  const updateProfile = useUpdateProfile(astronautId ?? 0);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null | undefined>(undefined);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { hobbies: "", client: "" },
  });

  useEffect(() => {
    if (astronaut) {
      setCurrentPhotoUrl(astronaut.photo_url ?? null);
      reset({
        hobbies: astronaut.hobbies ?? "",
        client: astronaut.client ?? "",
      });
    }
  }, [astronaut, reset]);

  function handlePhotoUploaded(updated: Astronaut) {
    setCurrentPhotoUrl(updated.photo_url ?? null);
  }

  async function onSubmit(values: FormValues) {
    await updateProfile.mutateAsync({
      hobbies: values.hobbies || null,
      client: values.client || null,
    });
    navigate(`/astronauts/${astronautId ?? ""}`);
  }

  if (!astronautId) return null;

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#040812] text-sm text-white/30">
        Chargement…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen flex-col items-center bg-[#040812] px-5 py-16 text-white">
      <div className="w-full max-w-[480px]">
        <button
          onClick={() => {
            navigate(-1);
          }}
          className="mb-6 bg-transparent p-0 text-sm text-white/40 hover:text-white/70"
        >
          ← Retour
        </button>

        <h1 className="mb-6 text-2xl font-bold">Modifier mon profil</h1>

        {/* Avatar upload */}
        {astronautId && astronaut && (
          <div className="mb-8 flex flex-col items-center gap-3">
            <AvatarUpload
              astronautId={astronautId}
              currentPhotoUrl={currentPhotoUrl}
              initials={`${astronaut.first_name.charAt(0)}${astronaut.last_name.charAt(0)}`}
              color={planet?.color_hex ?? "#00c8ff"}
              onUploaded={handlePhotoUploaded}
            />
            <p className="text-xs text-white/30">Cliquer pour changer la photo</p>
          </div>
        )}

        {updateProfile.isError && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {updateProfile.error instanceof Error
              ? updateProfile.error.message
              : "Une erreur est survenue"}
          </div>
        )}

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
          className="flex flex-col gap-5"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
              Hobbies
            </label>
            <textarea
              {...register("hobbies")}
              rows={3}
              placeholder="Tes centres d'intérêt…"
              className="border-white/12 w-full resize-y rounded-lg border bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/20"
            />
            {errors.hobbies && (
              <p className="mt-1 text-xs text-red-400">{errors.hobbies.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
              Client actuel
            </label>
            <input
              {...register("client")}
              type="text"
              placeholder="Nom du client"
              className="border-white/12 w-full rounded-lg border bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/20"
            />
            {errors.client && <p className="mt-1 text-xs text-red-400">{errors.client.message}</p>}
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                navigate(-1);
              }}
              className="border-white/12 bg-white/6 rounded-lg border px-5 py-2.5 text-sm text-white/60 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!isDirty || isSubmitting || updateProfile.isPending}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting || updateProfile.isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
