import Chat, { ChatMessage } from "@/components/Chat";
import RecipeSummary from "@/components/RecipeSummary";
import UrlSearchbar from "@/components/UrlSearchbar";
import { FullRecipeInfo, askQuestion } from "@/hooks/recipeAnalyzer";
import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

export default function Index() {
  const [fullRecipeInfo, setFullRecipeInfo] = useState(null as FullRecipeInfo | null);
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [threadId, setThreadId] = useState('');

  const chatRef = useRef<{ sendMessage: (message: ChatMessage) => void } | null>(null);

  const ask = async (question: string) => {
    const answer = await askQuestion(question, threadId);
    const message: ChatMessage = {
      text: answer,
      user: {
        _id: 1,
        name: 'Chef'
      }
    };

    chatRef.current?.sendMessage(message);
  };

  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <PaperProvider theme={{
      colors: {
        ...DefaultTheme.colors,
      }
    }}>
      <GestureHandlerRootView >
      <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}>
          <UrlSearchbar
            onThreadCreated={threadId => setThreadId(threadId)}
            onContentReceived={content => setFullRecipeInfo(content)}
            onContentAnalyzed={() => setShowQuestionInput(true)}
            onError={_ => setShowQuestionInput(false)}
            id='urlInput'
            placeholder="Enter URL here"
          />
        </View>
        <ScrollView>
          {fullRecipeInfo && <RecipeSummary recipeInfo={fullRecipeInfo} />}
        </ScrollView>

        <BottomSheet
          ref={bottomSheetRef}
          index={showQuestionInput ? 0 : -1}
          snapPoints={[50, '50%', '85%', '90%']}
          style={{ alignContent: 'center', justifyContent: 'center' }}
        >
          {/*TODO this does not scroll*/}
          <BottomSheetScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Chat isTyping={false} disableComposer={false} ref={chatRef} onSend={msg => ask(msg)} />
          </BottomSheetScrollView>
        </BottomSheet>
      </GestureHandlerRootView>
    </PaperProvider >
  );
}
