import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useAstronaut, useUpdateProfile } from "@/api/astronauts";

const schema = z.object({
  photo_url: z.string().url("URL invalide").max(500).or(z.literal("")).nullable(),
  hobbies: z.string().max(1000).nullable(),
  client: z.string().max(255).nullable(),
});

type FormValues = z.infer<typeof schema>;

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "white",
  fontSize: 14,
  padding: "10px 14px",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "rgba(255,255,255,0.5)",
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 6,
};

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const astronautId = user?.astronaut_id ?? 0;

  const { data: astronaut, isLoading } = useAstronaut(astronautId);
  const updateProfile = useUpdateProfile(astronautId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { photo_url: "", hobbies: "", client: "" },
  });

  // Pre-fill form when data is loaded
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
    void navigate(`/astronauts/${astronautId}`);
  }

  if (isLoading) {
    return (
      <div style={{
        width: "100vw", height: "100vh", background: "#040812",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,0.3)", fontSize: 14,
      }}>
        Chargement…
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#040812", color: "white",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "60px 20px",
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.4)",
            fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 24,
          }}
        >
          ← Retour
        </button>

        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32, margin: "0 0 32px" }}>
          Modifier mon profil
        </h1>

        {updateProfile.isError && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8, padding: "12px 16px", marginBottom: 20,
            color: "#f87171", fontSize: 13,
          }}>
            {updateProfile.error instanceof Error
              ? updateProfile.error.message
              : "Une erreur est survenue"}
          </div>
        )}

        <form onSubmit={(e) => { void handleSubmit(onSubmit)(e); }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={labelStyle}>Photo (URL)</label>
            <input
              {...register("photo_url")}
              type="url"
              placeholder="https://…"
              style={inputStyle}
            />
            {errors.photo_url && (
              <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{errors.photo_url.message}</p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Hobbies</label>
            <textarea
              {...register("hobbies")}
              rows={3}
              placeholder="Tes centres d'intérêt…"
              style={{ ...inputStyle, resize: "vertical" }}
            />
            {errors.hobbies && (
              <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{errors.hobbies.message}</p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Client actuel</label>
            <input
              {...register("client")}
              type="text"
              placeholder="Nom du client"
              style={inputStyle}
            />
            {errors.client && (
              <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{errors.client.message}</p>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8, color: "rgba(255,255,255,0.6)",
                fontSize: 14, padding: "10px 20px", cursor: "pointer",
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!isDirty || isSubmitting || updateProfile.isPending}
              style={{
                background: isDirty ? "#3b82f6" : "rgba(59,130,246,0.3)",
                border: "none", borderRadius: 8, color: "white",
                fontSize: 14, fontWeight: 600, padding: "10px 24px",
                cursor: isDirty ? "pointer" : "not-allowed",
                opacity: isSubmitting || updateProfile.isPending ? 0.7 : 1,
              }}
            >
              {isSubmitting || updateProfile.isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
