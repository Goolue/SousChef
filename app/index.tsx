import UrlSearchbar from "@/components/UrlSearchbar";
import { FullRecipeInfo } from "@/hooks/recipeAnalyzer";
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { StyleSheet } from "react-native";
import Colors from "@/constants/Colors";
import ResultsView from "@/components/ResultsView";
import Chat from "@/components/Chat";

export default function Index() {
  const [fullRecipeInfo, setFullRecipeInfo] = useState(null as FullRecipeInfo | null);
  const [threadId, setThreadId] = useState('');

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
        />

        {fullRecipeInfo && <ResultsView fullRecipeInfo={fullRecipeInfo} threadId={threadId}/>}
      </GestureHandlerRootView>
    </PaperProvider >
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 30,
    borderWidth: 3,
    opacity: 0.8,
  },
  fabSpeak: {
    margin: 16,
    right: -10,
    bottom: 30,
  },
  fabAlwaysOn: {
    margin: 16,
    right: 0,
    bottom: 100,
  },
});
