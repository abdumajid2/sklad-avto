export function Card({ children, className = "", ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardElevated({ children, className = "", ...props }) {
  return (
    <div className={`card-elevated ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardInteractive({ children, className = "", ...props }) {
  return (
    <div className={`card-interactive ${className}`} {...props}>
      {children}
    </div>
  );
}
