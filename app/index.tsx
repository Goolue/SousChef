import RecipeSummary from "@/components/RecipeSummary";
import UrlSearchbar from "@/components/UrlSearchbar";
import { FullRecipeInfo, askQuestion } from "@/hooks/recipeAnalyzer";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {DefaultTheme, PaperProvider, Searchbar } from "react-native-paper";

export default function Index() {
  const [fullRecipeInfo, setFullRecipeInfo] = useState(null as FullRecipeInfo | null);
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [threadId, setThreadId] = useState('');

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
          {showQuestionInput &&
            <Searchbar
              id='questionInput'
              placeholder="Ask a question here"
              onChangeText={text => setQuestion(text)}
              value={question}
              loading={question != '' && !answer}
              onSubmitEditing={_ => {
                setAnswer('');
                askQuestion(question, threadId)
                  .then(ans => setAnswer(ans))
                  .catch(error => console.error('Error getting an answer for question:', question, error))
              }}
            />}
            {showQuestionInput && answer &&
            <Text>{answer}</Text>}
        </ScrollView>
      </GestureHandlerRootView>
    </PaperProvider >
  );
}
