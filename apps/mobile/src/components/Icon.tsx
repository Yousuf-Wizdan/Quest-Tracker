import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react-native";
import * as icons from "lucide-react-native";
import { palette } from "../palette";

export type IconName = keyof typeof icons;

const iconMap = icons as unknown as Record<string, LucideIcon>;

interface IconProps extends Omit<ComponentProps<LucideIcon>, "color" | "size" | "strokeWidth"> {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, color, strokeWidth = 1.7, ...props }: IconProps) {
  const LucideComponent = iconMap[name as string] as LucideIcon | undefined;
  if (!LucideComponent) {
    return null;
  }
  const fallbackColor = palette.faint;
  return (
    <LucideComponent
      size={size}
      color={color ?? fallbackColor}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}
