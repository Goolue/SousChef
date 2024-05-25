// import { Collapsible } from "@/components/Collapsible";
import UrlSearchbar from "@/components/UrlSearchbar";
import { askQuestion } from "@/hooks/recipeAnalyzer";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TextInput, Searchbar } from "react-native-paper";

export default function Index() {
  const [htmlContent, setHtmlContent] = useState('');
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
          textColor={textColor}
          onThreadCreated={threadId => setThreadId(threadId)}
          onContentReceived={content => setHtmlContent(content)}
          onContentAnalyzed={() => setShowQuestionInput(true)}
          onError={_ => setShowQuestionInput(false)}
          id='urlInput'
          placeholder="Enter URL here"
        />
      </View>
      {/* {htmlContent && <Collapsible title='Recipe content'>
          <ScrollView>
            <Text>{htmlContent}</Text>
          </ScrollView>
        </Collapsible>} */}
        {showQuestionInput && <Searchbar 
        id='questionInput'
        placeholder="Ask a question here"
        onChangeText={text => setQuestion(text)}
        value={question}
        onSubmitEditing={_ =>
          askQuestion(question, threadId)
            .then(ans => setAnswer(ans))
            .catch(error => console.error('Error getting an answer for question:', question, error))
        }
        />
        
          // id='questionInput'
          // placeholder="Ask a question here"
          // placeholderTextColor={textColor}
          // label={'Question?'}
          // mode='outlined'
          // multiline={true}
          // onChangeText={text => setQuestion(text)}
          // onSubmitEditing={_ =>
          //   askQuestion(question, threadId)
          //     .then(ans => setAnswer(ans))
          //     .catch(error => console.error('Error getting an answer for question:', question, error))
          // }
        // />
        }
        {showQuestionInput && answer &&
          <ScrollView>
            <Text>{answer}</Text>
          </ScrollView>}
    </GestureHandlerRootView>
  );
}
