import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/runwisr-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("disha.khanted@gmail.com");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 max-w-lg mx-auto w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Runwisr" className="h-20 w-20" />
        </div>

        {/* Form */}
        <h1 className="text-4xl font-bold mb-12">Welcome back!</h1>

        <div className="space-y-6">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 bg-transparent border-b border-t-0 border-x-0 rounded-none border-muted focus-visible:ring-0 focus-visible:border-primary text-lg px-0"
            placeholder="Email"
          />

          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 bg-transparent border-b border-t-0 border-x-0 rounded-none border-muted focus-visible:ring-0 focus-visible:border-primary text-lg px-0"
            placeholder="Password"
          />

          <Button
            onClick={handleLogin}
            className="w-full h-14 text-lg bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl mt-12"
          >
            Log in
          </Button>

          <button className="w-full text-center text-primary hover:text-primary/80 transition-colors">
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
