interface AuthFormInputProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: string;
  required?: boolean;
  labelRight?: React.ReactNode;
  rightElement?: React.ReactNode;
  children?: React.ReactNode;
}

export default function AuthFormInput({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  icon,
  required = true,
  labelRight,
  rightElement,
  children,
}: AuthFormInputProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label
          className="block text-body-sm font-semibold text-on-surface"
          htmlFor={id}
        >
          {label}
        </label>
        {labelRight}
      </div>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[20px] group-focus-within:text-primary transition-colors">
          {icon}
        </span>
        <input
          className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-outline-variant bg-surface text-body-lg focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all placeholder:text-secondary-fixed-dim"
          id={id}
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
        {rightElement}
      </div>
      {children}
    </div>
  );
}
