interface AuthErrorAlertProps {
  message: string;
}

export default function AuthErrorAlert({ message }: AuthErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-error/8 border border-error/20 text-body-sm">
      <span className="material-symbols-outlined text-error text-[18px] shrink-0">
        error
      </span>
      <span className="text-error font-medium">{message}</span>
    </div>
  );
}
