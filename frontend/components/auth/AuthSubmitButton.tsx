interface AuthSubmitButtonProps {
  loading: boolean;
  loadingText: string;
  text: string;
}

export default function AuthSubmitButton({
  loading,
  loadingText,
  text,
}: AuthSubmitButtonProps) {
  return (
    <button
      className="w-full bg-primary-container text-on-primary py-3.5 rounded-xl text-body-lg font-headline-md font-semibold hover:bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all flex justify-center items-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      type="submit"
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="spinner" /> {loadingText}
        </>
      ) : (
        <>
          {text}
          <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </>
      )}
    </button>
  );
}
