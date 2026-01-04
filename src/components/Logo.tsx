import logo from "@/assets/poonji-logo-new.png";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className = "h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48" }: LogoProps) => {
  return (
    <img 
      src={logo} 
      alt="Poonji" 
      className={`${className} object-contain object-center`}
      style={{ background: 'transparent' }}
    />
  );
};
