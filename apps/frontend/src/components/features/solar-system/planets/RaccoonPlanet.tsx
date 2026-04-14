import raccoonPng from "../../../../../img/planets/raccoon-planete.png";

// Raccoons of Asgard — PNG custom
export function RaccoonPlanet({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        filter: "drop-shadow(0 0 12px rgba(234,179,8,0.6))",
      }}
    >
      <img
        src={raccoonPng}
        alt="Raccoons of Asgard"
        draggable={false}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}
