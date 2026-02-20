"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MOTION_PRESET, TRANSITION, DURATION } from "@/lib/tokens/motion";

export default function Template({ children }: { children: React.ReactNode }) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : MOTION_PRESET.fadeUpSubtle.initial}
            animate={MOTION_PRESET.fadeUpSubtle.animate}
            transition={shouldReduceMotion ? { duration: DURATION.instant } : TRANSITION.template}
        >
            {children}
        </motion.div>
    );
}
