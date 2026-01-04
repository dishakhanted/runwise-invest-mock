import logo from "@/assets/poonji-logo-new.png";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className = "h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20" }: LogoProps) => {
  return (
    <img 
      src={logo} 
      alt="Poonji" 
      className={`${className} object-contain object-center`}
      style={{ background: 'transparent' }}
    />
  );
};
