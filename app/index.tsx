import UrlSearchbar from "@/components/UrlSearchbar";
import { FullRecipeInfo } from "@/hooks/recipeAnalyzer";
import { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import Colors from "@/constants/Colors";
import ResultsView from "@/components/ResultsView";
import { Alert, BackHandler } from "react-native";

export default function Index() {
  const [fullRecipeInfo, setFullRecipeInfo] = useState(null as FullRecipeInfo | null);

  const searchbarRef = useRef<{ reset: () => void } | null>(null);

  const showBackAlert = () =>
    Alert.alert(
      "Hold on!",
      "Are you sure you want to go back?",
      [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel"
        },
        {
          text: "YES",
          onPress: () => {
            setFullRecipeInfo(null);
            searchbarRef.current?.reset();
          }
        },
      ]
    );

  useEffect(() => {
    const backAction = () => {
      // Show a confirmation dialog
      if (!fullRecipeInfo) {
        return false;
      }
      showBackAlert();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [])

  return (
    <PaperProvider theme={{
      colors: {
        ...DefaultTheme.colors,
        ...Colors,
      }
    }}>
      <GestureHandlerRootView >
        <UrlSearchbar
          onContentReceived={content => setFullRecipeInfo(content)}
          onError={err => console.error('Error:', err)}
          id='urlInput'
          placeholder="Enter URL here"
          ref={searchbarRef}
        />

        {fullRecipeInfo && <ResultsView fullRecipeInfo={fullRecipeInfo} />}
      </GestureHandlerRootView>
    </PaperProvider >
  );
}