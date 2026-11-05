import type { ReactNode } from "react";
import BrandMark from "@/components/brand/BrandMark";

type Props = {
  title: string;
  children: ReactNode;
};

export default function AuthScreen({ title, children }: Props) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-8 bg-background pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-[max(1.5rem,env(safe-area-inset-top,0px))] text-foreground">
      <div className="flex justify-center">
        <BrandMark size="xl" priority className="shadow-sm" />
      </div>
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="text-center text-xl font-semibold">{title}</h1>
        {children}
      </div>
    </div>
  );
}
