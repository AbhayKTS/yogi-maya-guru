import { Flower2 } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Flower2 className={`${sizeClasses[size]} text-primary animate-sacred-glow`} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-glow opacity-20 rounded-full blur-lg animate-gentle-float" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-bold text-sacred font-devanagari`}>
            Ayur.AI
          </span>
          <span className="text-xs text-wisdom font-medium tracking-wider">
            GURU
          </span>
        </div>
      )}
    </div>
  );
};