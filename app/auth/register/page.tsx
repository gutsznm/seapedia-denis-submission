import { ArrowLeftIcon } from "lucide-react";
import { RegisterForm } from "@/components/register-form";
import Image from "next/image";
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
      <div className="flex items-center justify-center gap-4 md:justify-start">
          <Link 
            href="/" 
            className="flex items-center justify-center p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
          >
            <ArrowLeftIcon className="size-6" />
          </Link>
          <div className="h-6 w-[1px] bg-border hidden md:block" />
          <div className="flex-shrink-0">
            <Image
              src="/seapedia-logo.webp"
              alt="Logo Seapedia"
              width={130}
              height={130}
              priority
            />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/side-image.webp"
          alt="Side Image"
          width={1920}
          height={1080}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
