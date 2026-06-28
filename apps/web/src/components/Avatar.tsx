import { cleanName } from "../ranks";

interface Props {
  name: string;
  color?: string;
  size?: number;
}

/**
 * Generated avatar (initials on a tinted tile). Critical Ops player icons are
 * not available on any public CDN, so we render a stylized placeholder instead.
 */
export function Avatar({ name, color = "#ff6a1a", size = 56 }: Props) {
  const initials =
    cleanName(name)
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <div
      className="clip-corner flex items-center justify-center font-display font-bold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        color,
        background: `linear-gradient(135deg, ${color}33, ${color}0d)`,
        border: `1px solid ${color}66`,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
