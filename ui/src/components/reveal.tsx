"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
};

export function Reveal({ children, className, id, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotionPreference();
  return (
    <motion.div
      className={className}
      id={id}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.55, delay: reduceMotion ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}

export function RevealSection({ children, className, id, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotionPreference();
  return (
    <motion.section
      className={className}
      id={id}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.55, delay: reduceMotion ? 0 : delay }}
    >
      {children}
    </motion.section>
  );
}
