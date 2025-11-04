import { Logo } from "@/components/Logo";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex justify-center pt-8 pb-4">
        <Logo className="h-32 w-32" />
      </div>
      <div className="flex flex-1 items-center justify-center -mt-20">
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-4 text-4xl font-bold">Welcome to GrowWise</h1>
          <p className="text-xl text-muted-foreground">Your intelligent financial companion</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
