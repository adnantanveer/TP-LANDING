import { Code, DeviceMobile, Sparkle, CloudArrowUp, PaintBrush, Compass, PenNib, Hammer, RocketLaunch } from "@phosphor-icons/react";
import type { CapabilityIconKey, ProcessIconKey } from "./content";

const CAPABILITY_ICONS: Record<CapabilityIconKey, typeof Code> = {
  code: Code,
  mobile: DeviceMobile,
  ai: Sparkle,
  cloud: CloudArrowUp,
  design: PaintBrush,
};

const PROCESS_ICONS: Record<ProcessIconKey, typeof Code> = {
  discover: Compass,
  design: PenNib,
  build: Hammer,
  scale: RocketLaunch,
};

export function CapabilityIcon({ icon, className }: { icon: CapabilityIconKey; className?: string }) {
  const Icon = CAPABILITY_ICONS[icon];
  return <Icon weight="light" className={className} />;
}

export function ProcessIcon({ icon, className }: { icon: ProcessIconKey; className?: string }) {
  const Icon = PROCESS_ICONS[icon];
  return <Icon weight="light" className={className} />;
}
