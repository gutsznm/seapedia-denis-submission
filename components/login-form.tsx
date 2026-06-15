"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from 'next/link';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
    const [showPassword, setShowPassword] = React.useState(false)
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="example@seapedia.com"
            required
            className="bg-background"
          />
        </Field>
        <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative w-full">
            <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                required 
                className="pr-10" 
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
                {showPassword ? (
                <svg xmlns="http://w3.org" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.574 1 1 0 0 1 0 .7a10.735 10.735 0 0 1-2.9 4.074"/><path d="M14.6 14.6A4 4 0 0 1 9.4 9.4"/><path d="M2 2l20 20"/><path d="M3.51 9.57a10.74 10.74 0 0 0-.291 2.08 1 1 0 0 0 0 .7 10.743 10.743 0 0 0 13.9 6.58"/></svg>
                ) : (
                <svg xmlns="http://w3.org" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
            </button>
            </div>
        </Field>
        <Field>
          <Button type="submit">Login</Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="underline underline-offset-4">
              Register
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
