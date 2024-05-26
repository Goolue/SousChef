// import { Collapsible } from "@/components/Collapsible";
import RecipeSummary from "@/components/RecipeSummary";
import UrlSearchbar from "@/components/UrlSearchbar";
import { FullRecipeInfo, askQuestion } from "@/hooks/recipeAnalyzer";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TextInput, Searchbar } from "react-native-paper";

export default function Index() {
  const [fullRecipeInfo, setFullRecipeInfo] = useState(null as FullRecipeInfo | null);
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [threadId, setThreadId] = useState('');

  const textColor = useThemeColor({ light: 'black', dark: 'white' }, 'text');

  return (
    <GestureHandlerRootView>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <UrlSearchbar
          onThreadCreated={threadId => setThreadId(threadId)}
          onContentReceived={content => setFullRecipeInfo(content)}
          onContentAnalyzed={() => setShowQuestionInput(true)}
          onError={_ => setShowQuestionInput(false)}
          id='urlInput'
          placeholder="Enter URL here"
        />
      </View>
      {fullRecipeInfo && <RecipeSummary recipeInfo={fullRecipeInfo} />}
      {showQuestionInput && <Searchbar
        id='questionInput'
        placeholder="Ask a question here"
        onChangeText={text => setQuestion(text)}
        value={question}
        loading={!answer}
        onSubmitEditing={_ => {
          setAnswer('');
          askQuestion(question, threadId)
            .then(ans => setAnswer(ans))
            .catch(error => console.error('Error getting an answer for question:', question, error))
        }}
      />}
      {showQuestionInput && answer &&
        <ScrollView>
          <Text>{answer}</Text>
        </ScrollView>}
    </GestureHandlerRootView>
  );
}
