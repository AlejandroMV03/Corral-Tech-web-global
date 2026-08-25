import Icon from "@mdi/react";

interface MdiIconProps {
  path: string;
  size?: number | string;
  className?: string;
  color?: string;
}

export default function MdiIcon({ path, size = 1, className = "", color }: MdiIconProps) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      <Icon path={path} size={size} color={color || "currentColor"} />
    </span>
  );
}