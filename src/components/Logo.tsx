import logo from "@/assets/growwise-logo.png";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className = "h-10 w-10" }: LogoProps) => {
  return <img src={logo} alt="GrowWise" className={className} style={{ backgroundColor: 'hsl(40, 35%, 92%)' }} />;
};
