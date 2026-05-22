type Props = {
  shape?: 'rounded' | 'square';
  radius?: number;
  placeholder: string;
  className?: string;
  dark?: boolean;
  label?: string;
  height?: number | string;
};

export function ImageSlot({
  shape = 'rounded',
  radius = 14,
  placeholder,
  className,
  dark,
  label,
  height = 360,
}: Props) {
  return (
    <div
      className={`img-placeholder ${dark ? 'dark' : ''} ${className ?? ''}`}
      style={{
        borderRadius: shape === 'rounded' ? `${radius}px` : 0,
        height,
        width: '100%',
      }}
      role="img"
      aria-label={placeholder}
    >
      {label && <span className="ip-label">{label}</span>}
      {!label && <span className="ip-label">PHOTO · DROP-IN</span>}
    </div>
  );
}
