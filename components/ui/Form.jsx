import { AlertCircle } from "lucide-react";

export function Input({ error, helperText, label, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input className={`input ${error ? "input-error" : ""}`} {...props} />
      {helperText && <p className="form-helper">{helperText}</p>}
      {error && (
        <div className="flex items-center gap-1 text-error-400 text-xs mt-1">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}

export function Select({ error, helperText, label, children, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select
        className={`input ${error ? "input-error" : ""} cursor-pointer`}
        {...props}
      >
        {children}
      </select>
      {helperText && <p className="form-helper">{helperText}</p>}
      {error && (
        <div className="flex items-center gap-1 text-error-400 text-xs mt-1">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}

export function Textarea({ error, helperText, label, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <textarea className={`input resize-none ${error ? "input-error" : ""}`} {...props} />
      {helperText && <p className="form-helper">{helperText}</p>}
      {error && (
        <div className="flex items-center gap-1 text-error-400 text-xs mt-1">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}
