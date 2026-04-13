import { useRef, useState } from "react";
import { apiClient, getAvatarUrl } from "@/lib/apiClient";
import type { Astronaut as AstronautOut } from "@/api/types";

/**
 * Recadre l'image au carré centré et la renvoie en JPEG 400×400.
 * Pas de repositionnement interactif : crop centré automatique.
 */
function centerCrop(file: File, size = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const s = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas non supporté"));
      ctx.drawImage(
        img,
        (img.width - s) / 2,
        (img.height - s) / 2,
        s,
        s,
        0,
        0,
        size,
        size,
      );
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Conversion échouée"))),
        "image/jpeg",
        0.9,
      );
    };
    img.onerror = () => reject(new Error("Image invalide"));
    img.src = objectUrl;
  });
}

interface AvatarUploadProps {
  astronautId: number;
  currentPhotoUrl: string | null | undefined;
  initials: string;
  color: string;
  onUploaded: (astronaut: AstronautOut) => void;
}

export function AvatarUpload({
  astronautId,
  currentPhotoUrl,
  initials,
  color,
  onUploaded,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hovering, setHovering] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const avatarSrc = getAvatarUrl(currentPhotoUrl);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPendingFile(file);
    setUploadError(null);
    e.target.value = "";
  }

  function handleCancel() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
    setUploadError(null);
  }

  async function handleConfirm() {
    if (!pendingFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const cropped = await centerCrop(pendingFile);
      const form = new FormData();
      form.append("file", cropped, "avatar.jpg");
      const updated = await apiClient.upload<AstronautOut>(
        `/astronauts/${astronautId}/photo`,
        form,
      );
      onUploaded(updated);
      handleCancel();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      {/* Avatar cliquable */}
      <div
        style={{ position: "relative", display: "inline-block" }}
        onMouseEnter={() => { setHovering(true); }}
        onMouseLeave={() => { setHovering(false); }}
        onClick={() => { inputRef.current?.click(); }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            overflow: "hidden",
            cursor: "pointer",
            background: `linear-gradient(135deg, ${color}50, ${color}18)`,
            border: `3px solid ${color}60`,
            boxShadow: hovering ? `0 0 24px ${color}50` : `0 0 16px ${color}20`,
            transition: "box-shadow 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="Avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span
              style={{
                color,
                fontSize: 32,
                fontWeight: 800,
                fontFamily: "'Arial Black', Arial, sans-serif",
              }}
            >
              {initials}
            </span>
          )}
          {/* Overlay hover */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: hovering ? 1 : 0,
              transition: "opacity 0.2s",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: 11,
                fontWeight: 600,
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              ✏<br />Modifier
            </span>
          </div>
        </div>
      </div>

      {/* Input fichier caché */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Modal de preview */}
      {previewUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
        >
          <div
            style={{
              background: "#0c1524",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              maxWidth: 360,
              width: "100%",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "white", fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>
                Aperçu de la photo
              </p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0 }}>
                La photo sera recadrée au centre
              </p>
            </div>

            {/* Preview circulaire */}
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                overflow: "hidden",
                border: `3px solid ${color}80`,
                boxShadow: `0 0 30px ${color}30`,
                flexShrink: 0,
              }}
            >
              <img
                src={previewUrl}
                alt="Aperçu"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {uploadError && (
              <p style={{ color: "#ff3b5c", fontSize: 13, margin: 0, textAlign: "center" }}>
                {uploadError}
              </p>
            )}

            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button
                type="button"
                onClick={handleCancel}
                disabled={uploading}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  cursor: uploading ? "not-allowed" : "pointer",
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => { void handleConfirm(); }}
                disabled={uploading}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: `${color}20`,
                  border: `1px solid ${color}60`,
                  borderRadius: 8,
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: uploading ? "not-allowed" : "pointer",
                  opacity: uploading ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {uploading ? "Upload en cours…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
