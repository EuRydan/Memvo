"use client"
import { motion, useInView, Variants } from "framer-motion"
import * as React from "react"

export interface TimelineContentProps {
  children: React.ReactNode;
  className?: string;
  animationNum?: number;
  timelineRef?: React.RefObject<Element | null>;
  customVariants?: Variants | any;
  as?: React.ElementType;
  style?: React.CSSProperties;
}

export function TimelineContent({
  children,
  className,
  animationNum = 0,
  timelineRef,
  customVariants,
  style,
  as: Component = "div",
}: TimelineContentProps) {
  const backupRef = React.useRef(null)
  const actualRef = timelineRef || backupRef
  const isInView = useInView(actualRef, { once: true, margin: "-100px" })
  const MotionComponent = motion(Component as any)

  return (
    <MotionComponent
      ref={!timelineRef ? backupRef : undefined}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={animationNum}
      variants={customVariants}
      style={style}
    >
      {children}
    </MotionComponent>
  )
}
