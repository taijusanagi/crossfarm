import { theme } from "@chakra-ui/pro-theme";
import { extendTheme } from "@chakra-ui/react";
import { lightTheme } from "@rainbow-me/rainbowkit";

const font = "VT323";

export const myChakraUITheme = extendTheme(
  {
    colors: { ...theme.colors, brand: theme.colors.green },
    fonts: {
      body: font,
    },
  },
  theme
);

const rainbowKitTheme = lightTheme();
export const myRainbowKitTheme = {
  ...rainbowKitTheme,
  colors: {
    ...rainbowKitTheme.colors,
    accentColor: theme.colors.green[500],
  },
  fonts: {
    ...rainbowKitTheme.fonts,
    body: font,
  },
  shadows: {
    ...rainbowKitTheme.shadows,
    connectButton: theme.shadows.md,
  },
};
