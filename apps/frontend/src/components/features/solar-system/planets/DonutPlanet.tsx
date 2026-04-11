import donutPng from "../../../../../img/planets/donut-planete.png";

export function DonutPlanet({ size }: { size: number }) {
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
        src={donutPng}
        alt="Donut Factory"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          mixBlendMode: "screen",
          filter: "drop-shadow(0 0 14px rgba(220, 50, 30, 0.7))",
        }}
        draggable={false}
      />
    </div>
  );
}
