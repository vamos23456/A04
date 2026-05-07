"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type MenuToggleIconProps = React.ComponentProps<"svg"> & {
  open?: boolean
  duration?: number
}

export function MenuToggleIcon({
  open = false,
  duration = 300,
  className,
  ...props
}: MenuToggleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("transition-transform", className)}
      style={{ transitionDuration: `${duration}ms` }}
      aria-hidden="true"
      {...props}
    >
      <path
        d={open ? "M6 6L18 18" : "M4 7H20"}
        className="origin-center transition-all"
        style={{ transitionDuration: `${duration}ms` }}
      />
      <path
        d={open ? "M6 18L18 6" : "M4 12H20"}
        className={cn("origin-center transition-all", open && "opacity-0")}
        style={{ transitionDuration: `${duration}ms` }}
      />
      {open ? null : (
        <path
          d="M4 17H20"
          className="origin-center transition-all"
          style={{ transitionDuration: `${duration}ms` }}
        />
      )}
    </svg>
  )
}
