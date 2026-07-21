type BrandIconProps = {
  name: "call" | "instagram" | "ubereats" | "whatsapp";
  className?: string;
};

export function BrandIcon({ name, className = "" }: BrandIconProps) {
  const classes = `brand-icon ${className}`.trim();

  if (name === "whatsapp") {
    return (
      <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.78h-.01a9.84 9.84 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26A9.9 9.9 0 0 1 12.05 2a9.82 9.82 0 0 1 6.99 2.9 9.82 9.82 0 0 1 2.9 7c0 5.45-4.44 9.88-9.89 9.88M20.47 3.49A11.82 11.82 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.69 1.45h.01c6.56 0 11.89-5.34 11.89-11.9 0-3.18-1.23-6.16-3.48-8.41" />
      </svg>
    );
  }

  if (name === "call") {
    return (
      <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
      </svg>
    );
  }

  if (name === "ubereats") {
    return (
      <svg className={`${classes} brand-icon-ubereats`} viewBox="0 0 36 24" aria-hidden="true" focusable="false">
        <path d="M3 4h13v3H6v3h9v3H6v4h10v3H3V4Zm17 0h13v3H23v3h9v3h-9v4h10v3H20V4Z" />
      </svg>
    );
  }

  return (
    <svg className={`${classes} brand-icon-outline`} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle className="brand-icon-dot" cx="17.5" cy="6.5" r="1" />
    </svg>
  );
}
