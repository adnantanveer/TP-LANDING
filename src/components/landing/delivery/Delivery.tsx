import { DeliveryA } from "./DeliveryA";
import { DeliveryB } from "./DeliveryB";
import { DeliveryC } from "./DeliveryC";
import { useDeliveryVariant } from "./shared";

/**
 * "A delivery model built for certainty" — split out of Process.tsx
 * (which keeps the four how-we-work steps) into its own video-backed
 * beat. Three treatments are built for review; this picks one from the
 * TEMP `?delivery=` switch (see shared.tsx) and defaults to A. Once a
 * winner is chosen, import it directly here and delete the other two
 * files plus the switch.
 */
export function Delivery() {
  const variant = useDeliveryVariant();
  if (variant === "b") return <DeliveryB />;
  if (variant === "c") return <DeliveryC />;
  return <DeliveryA />;
}
