import { type ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-12 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
