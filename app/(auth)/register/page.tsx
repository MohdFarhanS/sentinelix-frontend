"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient, ApiError } from "@/lib/api-client";
import { checkPassword, isPasswordValid } from "@/lib/password";
import { PasswordRequirements } from "@/components/password-requirements";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const passwordCheck = checkPassword(password);
  const passwordValid = isPasswordValid(passwordCheck);
  const passwordsMatch = password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!passwordValid) {
      setError("Password does not meet all requirements above.");
      return;
    }
    if (!passwordsMatch) {
      setError("Password confirmation does not match.");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/auth/register", { email, password });
      router.push("/login?registered=1");
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_EXISTS") {
        setError("Email is already registered. Try signing in instead.");
      } else {
        setError(err instanceof ApiError ? err.message : "Registration failed, please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Create Account</h1>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {password.length > 0 && <PasswordRequirements check={passwordCheck} />}
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Signing up..." : "Sign Up"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}