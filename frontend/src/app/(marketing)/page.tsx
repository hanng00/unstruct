"use client";

import { Button } from "@/components/ui/button";
import { REDIRECT_AFTER_SIGN_IN } from "@/lib/constants";
import { useRouter } from "next/navigation";

const LandingPage = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push(REDIRECT_AFTER_SIGN_IN);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-4xl font-medium">Unstruct</h1>
          <p className="text-lg text-muted-foreground">
            Drop files. Review rows. Blend into products. Download clarity.
          </p>
        </div>

        <Button onClick={handleGetStarted}>Get Started</Button>
      </div>
    </div>
  );
};

export default LandingPage;
