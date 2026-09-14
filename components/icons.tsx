import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 };

export function ArrowIcon({ direction = "right", ...props }: IconProps & { direction?: "left" | "right" }) {
  return <svg {...base} {...props} style={{ transform: direction === "left" ? "rotate(180deg)" : undefined }}><path d="M5 12h14M14 7l5 5-5 5" /></svg>;
}

export function CheckIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m5 12 4 4L19 6" /></svg>;
}

export function ClockIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
}

export function ExpandIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5" /></svg>;
}

export function MonitorIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>;
}

export function CloseIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

export function ResetIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>;
}

export function DownloadIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>;
}
