export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const variantClass = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    danger: 'btn btn-danger',
  }[variant] || 'btn btn-primary';
  return (
    <button className={`${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}