import Button from './Button';

export default function Modal({ open, title, children, onClose, actions = [] }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-card w-full max-w-lg">
        <div className="px-4 py-3 border-b">
          <h4 className="text-base font-semibold">{title}</h4>
        </div>
        <div className="p-4">{children}</div>
        <div className="px-4 py-3 border-t flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          {actions.map((a, idx) => (
            <Button key={idx} variant={a.variant || 'primary'} onClick={a.onClick}>
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}