import { Logo } from "@/components/Logo";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex justify-center py-8">
        <Logo className="h-24 w-24" />
      </div>
      <div className="flex flex-1 items-center justify-center -mt-16">
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-4 text-4xl font-bold">Welcome to GrowWise</h1>
          <p className="text-xl text-muted-foreground">Your intelligent financial companion</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
