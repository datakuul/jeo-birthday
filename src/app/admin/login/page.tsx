"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Lock } from "lucide-react";
import { login, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Card } from "@/components/ui/card";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-5">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="font-serif text-xl text-foreground">
            Janet<span className="text-gold-strong"> at 80</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">Family admin area</p>
        </div>

        <Card className="p-7">
          <div className="mb-5 flex items-center gap-2 text-gold-strong">
            <Lock className="size-4" />
            <h1 className="font-serif text-lg text-foreground">Sign in</h1>
          </div>
          <form action={action} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            {state?.error && (
              <p role="alert" className="rounded-lg bg-[oklch(0.96_0.03_25)] px-3 py-2 text-sm text-destructive">
                {state.error}
              </p>
            )}
            <Button type="submit" variant="gold" className="w-full" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Sign in
            </Button>
          </form>
        </Card>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          <Link href="/" className="underline underline-offset-2 hover:text-foreground">
            ← Back to the celebration site
          </Link>
        </p>
      </div>
    </div>
  );
}
