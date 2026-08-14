type AnimatedLogoProps = {
  className?: string;
  animated?: boolean;
};

export function AnimatedLogo({ className = "", animated = false }: AnimatedLogoProps) {
  return (
    <svg
      viewBox="0 0 325 323.45"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {animated ? <circle data-loader-orbit cx="162.5" cy="161.7" r="145" stroke="currentColor" strokeOpacity="0.34" strokeWidth="1.5" strokeDasharray="10 13" /> : null}
      <path
        data-loader-piece={animated ? "true" : undefined}
        fill="currentColor"
        d="M325 226.72v65c0 17.52-14.2 31.72-31.72 31.72H31.72C14.2 323.44 0 309.24 0 291.72v-260C0 14.2 14.2 0 31.72 0h66.55C115.79 0 130 14.2 130 31.72v1.55C130 50.79 115.8 65 98.27 65h-1.55C79.2 65 65 79.2 65 96.72v130c0 17.52 14.2 31.72 31.72 31.72h131.55c17.52 0 31.72-14.2 31.72-31.72 0-17.53 14.2-31.73 31.72-31.73h1.55c17.52 0 31.72 14.2 31.72 31.73Z"
      />
      <rect data-loader-piece={animated ? "true" : undefined} fill="currentColor" x="130" y="130" width="130" height="63.45" rx="31.72" />
    </svg>
  );
}
