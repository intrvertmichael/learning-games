"use client"

export default function PillButton({
  children,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button className={`pill-button ${className}`.trim()} type={type} {...props}>
      {children}
    </button>
  )
}
