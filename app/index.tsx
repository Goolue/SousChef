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
  const [threadId, setThreadId] = useState('');

  const searchbarRef = useRef<{ reset: () => void } | null>(null);

  useEffect(() => {
    const backAction = () => {
      // Show a confirmation dialog
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
          }
        ]
      );
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
          onThreadCreated={threadId => setThreadId(threadId)}
          onContentReceived={content => setFullRecipeInfo(content)}
          onContentAnalyzed={() => console.log('Content analyzed')}
          onError={err => console.error('Error:', err)}
          id='urlInput'
          placeholder="Enter URL here"
          ref={searchbarRef}
        />

        {fullRecipeInfo && <ResultsView fullRecipeInfo={fullRecipeInfo} threadId={threadId}/>}
      </GestureHandlerRootView>
    </PaperProvider >
  );
}