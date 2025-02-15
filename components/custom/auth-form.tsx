import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Eye, EyeOff } from "lucide-react"; // Importing icons

export function AuthForm({
  action,
  children,
  defaultEmail = "",
}: {
  action: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  defaultEmail?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Email Address
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm border-none"
          type="email"
          placeholder="example@sorvx.com"
          autoComplete="email"
          required
          defaultValue={defaultEmail}
          aria-label="Email Address"
        />

        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Password
        </Label>

        <div className="relative">
          <Input
            id="password"
            name="password"
            className="bg-muted text-md md:text-sm border-none pr-10"
            type={showPassword ? "text" : "password"}
            required
            aria-label="Password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {children}
    </form>
  );
}
