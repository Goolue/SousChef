import UrlSearchbar from "@/components/UrlSearchbar";
import { FullRecipeInfo } from "@/hooks/recipeAnalyzer";
import { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import Colors from "@/constants/Colors";
import ResultsView from "@/components/ResultsView";
import { Alert, BackHandler } from "react-native";
import OpenAiRealtimeHandler from "@/hooks/openAiRealtimeHandler";
import { onAudioReceived } from "@/hooks/audioHandler";

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
        {
          text: "SOUNDDDD",
          onPress: () => {
            const realtimeHandler = new OpenAiRealtimeHandler({
              conversationInitPrompts: {
                  systemPrompt: 'I will ask you to say things and you will say them. Answer in 10 words. Always reply in audio',
              },
              onResponseTextReceived: (response: string) => {},
              onResponseTextDone: (text?: string) => {},
              onAudioReceived: onAudioReceived,
              onAudioDone: () => console.log('audio done'),
          });
          realtimeHandler.initWebsocket();
          setTimeout(() => {
            realtimeHandler.sendMessage('Say hello');
          }, 3000);
          }
        },
      ]
    );

  useEffect(() => {
    const backAction = () => {
      // Show a confirmation dialog
      // if (!fullRecipeInfo) {
      //   return false;
      // }
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