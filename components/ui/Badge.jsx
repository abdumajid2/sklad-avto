import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export function Badge({ variant = "primary", icon: Icon, children, ...props }) {
  const variants = {
    primary: "badge-primary",
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
  };

  return (
    <span className={`badge ${variants[variant] || variants.primary}`} {...props}>
      {Icon && <Icon size={12} className="mr-1" />}
      {children}
    </span>
  );
}

export function Alert({ variant = "info", title, children, onClose, ...props }) {
  const variants = {
    info: "alert-info",
    success: "alert-success",
    warning: "alert-warning",
    error: "alert-error",
  };

  const icons = {
    info: <Info size={20} />,
    success: <CheckCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    error: <AlertCircle size={20} />,
  };

  return (
    <div className={`alert ${variants[variant] || variants.info}`} {...props}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icons[variant]}</div>
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          {children}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
