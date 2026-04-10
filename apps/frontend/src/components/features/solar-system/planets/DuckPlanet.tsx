import duckPng from "../../../../../img/planets/duck-planete.png";

export function DuckPlanet({ size }: { size: number }) {
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
        src={duckPng}
        alt="Duck Invaders"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: "drop-shadow(0 0 14px rgba(50, 220, 80, 0.7))",
        }}
        draggable={false}
      />
    </div>
  );
}
