import schizoPng from "../../../../../img/planets/schizo-planete.png";

export function SchizoCatsPlanet({ size }: { size: number }) {
  // The PNG has a black background — mix-blend-mode: screen removes it on dark backgrounds
  return (
    <div
      style={{
        width: size * 2.8,
        height: size * 2.8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={schizoPng}
        alt="SchizoCats"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          mixBlendMode: "screen",
          filter: "drop-shadow(0 0 12px rgba(160, 80, 255, 0.7))",
        }}
        draggable={false}
      />
    </div>
  );
}
