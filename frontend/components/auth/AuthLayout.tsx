import AuthHeader from "./AuthHeader";
import AuthBrandPanel from "./AuthBrandPanel";

interface AuthLayoutProps {
  brandTitle: React.ReactNode;
  brandSubtitle: string;
  formIcon: string;
  formTitle: string;
  formSubtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export default function AuthLayout({
  brandTitle,
  brandSubtitle,
  formIcon,
  formTitle,
  formSubtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-surface">
      <AuthHeader />

      <main className="flex-1 flex flex-col lg:flex-row w-full min-h-screen">
        {/* Left: Brand Panel */}
        <AuthBrandPanel title={brandTitle} subtitle={brandSubtitle} />

        {/* Right: Form Panel */}
        <div className="w-full lg:w-[45%] flex justify-center items-center px-6 sm:px-10 lg:px-14 py-20 lg:py-12 bg-surface-container-lowest border-l border-outline-variant/20 relative">
          <div className="w-full max-w-[420px]">
            {/* Form Header */}
            <div className="mb-8 text-center lg:text-left">
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center mb-5 mx-auto lg:mx-0">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  {formIcon}
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-on-surface mb-2 tracking-tight">
                {formTitle}
              </h2>
              <p className="text-base text-secondary">{formSubtitle}</p>
            </div>

            {/* Form Content */}
            {children}

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-secondary">{footer}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
