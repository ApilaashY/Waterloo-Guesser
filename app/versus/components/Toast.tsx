interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="mb-4">
      <div className="p-4 text-sm rounded-lg bg-red-50 text-red-800" role="alert">
        <span className="font-medium">Alert:</span> {message}
      </div>
    </div>
  );
}
