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

export default function Index() {
  const [fullRecipeInfo, setFullRecipeInfo] = useState(null as FullRecipeInfo | null);
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [threadId, setThreadId] = useState('');
  const [playSound, setPlaySound] = useState(true);
  const [keepAwake, setKeepAwake] = useState(false);

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

  // const info : FullRecipeInfo = {
  //   title: 'title',
  //   ingredients: ['fhdskds', 'fdjksdnms;afhl', 'fbdjskndks'],
  //   steps: ['fhdskds', 'fdjksdnms;afhl', 'fbdjskndks'],
  // }

  return (
    <PaperProvider theme={{
      colors: {
        ...DefaultTheme.colors,
        // ...Colors,
        // onSurfaceVariant: 'red'
      }
    }}>
      <GestureHandlerRootView >
        <UrlSearchbar
          onThreadCreated={threadId => setThreadId(threadId)}
          onContentReceived={content => setFullRecipeInfo(content)}
          onContentAnalyzed={() => setShowQuestionInput(true)}
          onError={_ => setShowQuestionInput(false)}
          id='urlInput'
          placeholder="Enter URL here"
        />

        <ScrollView>
          {fullRecipeInfo && <RecipeSummary recipeInfo={fullRecipeInfo} />}
        </ScrollView>

        <BottomSheet
          ref={bottomSheetRef}
          index={showQuestionInput ? 0 : -1}
          snapPoints={[50, '90%']}
          enableContentPanningGesture={false} // Disable gestures inside the bottom sheet
        >
          <BottomSheetScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Chat playSound={playSound} disableComposer={false} ref={chatRef} onSend={msg => ask(msg)} />
          </BottomSheetScrollView>
        </BottomSheet>

        <FAB
          style={{ ...styles.fab, ...styles.fabSpeak }}
          icon={playSound ? 'volume-off' : 'volume-high'}
          mode='flat'
          size='medium'
          visible={showQuestionInput}
          onPress={() => {
            setPlaySound(!playSound);
            console.log(`Set playSound to ${!playSound}`)
          }}
        />
        <FAB
          style={{ ...styles.fab, ...styles.fabAlwaysOn }}
          icon={keepAwake ? 'eye-off' : 'eye'}
          mode='flat'
          size='small'
          visible={showQuestionInput}
          onPress={() => {
            if (!keepAwake) {
              console.log('Activating keep awake');
              activateKeepAwakeAsync();
              setKeepAwake(true);
            }
            else {
              console.log('Deactivating keep awake');
              deactivateKeepAwake();
              setKeepAwake(false);
            }
          }}
        />

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
