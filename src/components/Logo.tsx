import logo from "@/assets/poonji-logo-new.png";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className = "h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32" }: LogoProps) => {
  return (
    <img 
      src={logo} 
      alt="Poonji" 
      className={`${className} object-contain object-center`}
      style={{ background: 'transparent' }}
    />
  );
};
