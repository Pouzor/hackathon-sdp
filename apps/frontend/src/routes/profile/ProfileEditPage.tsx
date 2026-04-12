import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useAstronaut, useUpdateProfile } from "@/api/astronauts";

const schema = z.object({
  photo_url: z
    .string()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\/.+/.test(v), { message: "URL invalide" })
    .nullable(),
  hobbies: z.string().max(1000).nullable(),
  client: z.string().max(255).nullable(),
});

type FormValues = z.infer<typeof schema>;

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const astronautId = user?.astronaut_id;

  const { data: astronaut, isLoading } = useAstronaut(astronautId ?? 0);
  const updateProfile = useUpdateProfile(astronautId ?? 0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { photo_url: "", hobbies: "", client: "" },
  });

  useEffect(() => {
    if (astronaut) {
      reset({
        photo_url: astronaut.photo_url ?? "",
        hobbies: (astronaut as { hobbies?: string | null }).hobbies ?? "",
        client: (astronaut as { client?: string | null }).client ?? "",
      });
    }
  }, [astronaut, reset]);

  async function onSubmit(values: FormValues) {
    await updateProfile.mutateAsync({
      photo_url: values.photo_url || null,
      hobbies: values.hobbies || null,
      client: values.client || null,
    });
    void navigate(`/astronauts/${astronautId ?? ""}`);
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
          onClick={() => navigate(-1)}
          className="mb-6 bg-transparent p-0 text-sm text-white/40 hover:text-white/70"
        >
          ← Retour
        </button>

        <h1 className="mb-8 text-2xl font-bold">Modifier mon profil</h1>

        {updateProfile.isError && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {updateProfile.error instanceof Error
              ? updateProfile.error.message
              : "Une erreur est survenue"}
          </div>
        )}

        <form onSubmit={(e) => { void handleSubmit(onSubmit)(e); }} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
              Photo (URL)
            </label>
            <input
              {...register("photo_url")}
              type="url"
              placeholder="https://…"
              className="w-full rounded-lg border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/20"
            />
            {errors.photo_url && (
              <p className="mt-1 text-xs text-red-400">{errors.photo_url.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
              Hobbies
            </label>
            <textarea
              {...register("hobbies")}
              rows={3}
              placeholder="Tes centres d'intérêt…"
              className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/20"
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
              className="w-full rounded-lg border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/20"
            />
            {errors.client && (
              <p className="mt-1 text-xs text-red-400">{errors.client.message}</p>
            )}
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-white/12 bg-white/6 px-5 py-2.5 text-sm text-white/60 hover:text-white"
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
