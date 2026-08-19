import { Text, styled, View } from "@tamagui/core";
import { Pressable } from "react-native";
import type { ReactNode } from "react";

export const AppRoot = styled(View, {
  name: "AppRoot",
  flex: 1,
  backgroundColor: "$background",
});

export const Screen = styled(View, {
  name: "Screen",
  flex: 1,
});

export const Scroll = styled(View, {
  name: "Scroll",
  flex: 1,
  flexGrow: 1,
});

export const Eyebrow = styled(Text, {
  name: "Eyebrow",
  fontFamily: "$mono",
  fontSize: "$1",
  letterSpacing: 4,
  textTransform: "uppercase",
  color: "$faint",
});

export const Card = styled(View, {
  name: "Card",
  borderWidth: 1,
  borderColor: "$stroke2",
  borderRadius: "$5",
  backgroundColor: "$surface",
  overflow: "hidden",
});

export const Hairline = styled(View, {
  name: "Hairline",
  height: 1,
  backgroundColor: "$stroke",
});

const ButtonFrame = styled(Pressable, {
  name: "Button",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: "$2",
  borderRadius: "$4",
  paddingVertical: "$4",
  paddingHorizontal: "$5",
  pressStyle: {
    transform: [{ scale: 0.97 }],
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: "$accent",
        borderWidth: 0,
      },
      ghost: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "$stroke2",
      },
      soft: {
        backgroundColor: "$accentTint",
        borderWidth: 1,
        borderColor: "$accent",
      },
    },
    size: {
      md: {
        height: 48,
        borderRadius: "$4",
      },
      lg: {
        height: 54,
        borderRadius: "$5",
      },
    },
  } as const,

  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

const ButtonLabel = styled(Text, {
  name: "ButtonLabel",
  fontFamily: "$display",
  fontSize: "$5",
  fontWeight: "700",
  letterSpacing: 2,
  color: "$white",

  variants: {
    variant: {
      primary: {
        color: "$white",
      },
      ghost: {
        color: "$ink",
      },
      soft: {
        color: "$accentBright",
      },
    },
  } as const,
});

export function Button({
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ButtonFrame> & {
  variant?: "primary" | "ghost" | "soft";
  size?: "md" | "lg";
}) {
  return (
    <ButtonFrame variant={variant} size={size} {...props}>
      <ButtonLabel variant={variant}>{children}</ButtonLabel>
    </ButtonFrame>
  );
}

export function IconButton({
  children,
  size = 40,
  ...props
}: { children: ReactNode; size?: number } & Omit<
  React.ComponentProps<typeof ButtonFrame>,
  "size"
>) {
  return (
    <ButtonFrame
      variant="ghost"
      width={size}
      height={size}
      borderRadius="$3"
      padding={0}
      {...props}
    >
      {children}
    </ButtonFrame>
  );
}
