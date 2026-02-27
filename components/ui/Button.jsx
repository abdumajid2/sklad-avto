export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  children,
  className = "",
  ...props
}) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
    ghost: "btn-ghost",
  };

  const sizes = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  return (
    <button
      disabled={disabled}
      className={`${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ variant = "ghost", size = "md", disabled = false, children, className = "", ...props }) {
  return (
    <button
      disabled={disabled}
      className={`btn ${variant === "ghost" ? "btn-ghost" : "btn-outline"} ${size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "btn-md"} !rounded-lg !p-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
