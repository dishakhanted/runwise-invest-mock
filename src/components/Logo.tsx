import logo from "@/assets/runwisr-logo.png";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className = "h-10 w-10" }: LogoProps) => {
  return <img src={logo} alt="Runwisr" className={className} />;
};
