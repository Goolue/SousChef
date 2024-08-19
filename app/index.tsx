import Chat, { ChatMessage } from "@/components/Chat";
import RecipeSummary from "@/components/RecipeSummary";
import UrlSearchbar from "@/components/UrlSearchbar";
import { FullRecipeInfo, askQuestion } from "@/hooks/recipeAnalyzer";
import { useRef, useState } from "react";
import { ScrollView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DefaultTheme, FAB, PaperProvider } from "react-native-paper";
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { StyleSheet } from "react-native";
import Colors from "@/constants/Colors";
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import ResultsView from "@/components/ResultsView";

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
