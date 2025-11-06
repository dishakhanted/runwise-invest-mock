import logo from "@/assets/growwise-logo-transparent.png";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className = "h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" }: LogoProps) => {
  return <img src={logo} alt="GrowWise" className={className} />;
};
