import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registered at module scope (not inside an effect) so it always runs before any
// component effect that creates a ScrollTrigger, regardless of child/parent effect order.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
