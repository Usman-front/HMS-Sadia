export default function Input({ label, name, type = 'text', className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input id={name} name={name} type={type} className={`input ${className}`} {...props} />
    </div>
  );
}