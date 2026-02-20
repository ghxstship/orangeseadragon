"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { MOTION_PRESET, TRANSITION } from "@/lib/tokens/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <motion.div
            key={pathname}
            initial={MOTION_PRESET.fadeUp.initial}
            animate={MOTION_PRESET.fadeUp.animate}
            exit={MOTION_PRESET.fadeUp.exit}
            transition={TRANSITION.page}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
}
