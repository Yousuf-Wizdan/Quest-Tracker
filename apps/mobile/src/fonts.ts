import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export const fonts = {
  SpaceGrotesk_400Regular: require("../assets/fonts/SpaceGrotesk_400Regular.ttf"),
  SpaceGrotesk_500Medium: require("../assets/fonts/SpaceGrotesk_500Medium.ttf"),
  SpaceGrotesk_600SemiBold: require("../assets/fonts/SpaceGrotesk_600SemiBold.ttf"),
  SpaceGrotesk_700Bold: require("../assets/fonts/SpaceGrotesk_700Bold.ttf"),
  Newsreader_400Regular: require("../assets/fonts/Newsreader_400Regular.ttf"),
  Newsreader_400Regular_Italic: require("../assets/fonts/Newsreader_400Regular_Italic.ttf"),
  JetBrainsMono_400Regular: require("../assets/fonts/JetBrainsMono_400Regular.ttf"),
  JetBrainsMono_600SemiBold: require("../assets/fonts/JetBrainsMono_600SemiBold.ttf"),
};

void SplashScreen.preventAutoHideAsync();

export function useAppFonts() {
  const [loaded, error] = useFonts(fonts);

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  return loaded || error;
}
