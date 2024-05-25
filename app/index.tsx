import UrlSearchbar from "@/components/UrlSearchbar";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useState } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const [htmlContent, setHtmlContent] = useState('');
  const [url, setUrl] = useState('');
  const [urlInputLoading, setUrlInputLoading] = useState(false);
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [threadId, setThreadId] = useState('');

  const textColor = useThemeColor({ light: 'black', dark: 'white' }, 'text');

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <UrlSearchbar
        textColor={textColor}
        threadId={threadId}
        onContentReceived={content => setHtmlContent(content)}
        onContentAnalyzed={() => setShowQuestionInput(true)}
        onError={_ => setShowQuestionInput(false)}
        id='urlInput'
        placeholder="Enter URL here"
      />
    </View>
  );
}
