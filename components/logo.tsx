import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: { width: 100, height: 32 },
    md: { width: 140, height: 45 },
    lg: { width: 180, height: 58 },
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.svg"
        alt="flowRealtor"
        width={sizes[size].width}
        height={sizes[size].height}
        priority
        unoptimized
      />
    </div>
  );
}
