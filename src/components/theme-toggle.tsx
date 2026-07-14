"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * One-tap theme switch. The initial theme is auto-detected from the OS
 * (provider `defaultTheme="system"`); tapping flips directly between light and dark
 * with no menu.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Temayı değiştir">
      <Sun className="size-4 rotate-0 scale-100 transition-all duration-[--duration-normal] dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all duration-[--duration-normal] dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
