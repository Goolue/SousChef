import UrlSearchbar from "@/components/UrlSearchbar";
import { FullRecipeInfo } from "@/hooks/recipeAnalyzer";
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import Colors from "@/constants/Colors";
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