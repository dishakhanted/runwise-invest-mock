import { Logo } from "@/components/Logo";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center text-center">
        <Logo className="h-32 w-32 mb-8" />
        <h1 className="mb-4 text-4xl font-bold">Welcome to GrowWise</h1>
        <p className="text-xl text-muted-foreground">Your intelligent financial companion</p>
      </div>
    </div>
  );
};

export default Index;
