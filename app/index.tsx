import RecipeSummary from "@/components/RecipeSummary";
import UrlSearchbarWithLoading from "@/components/UrlSearchBarWithLoading";
import UrlSearchbar from "@/components/UrlSearchbar";
import { FullRecipeInfo, askQuestion } from "@/hooks/recipeAnalyzer";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, DefaultTheme, PaperProvider, Searchbar } from "react-native-paper";

export default function Index() {
  const [fullRecipeInfo, setFullRecipeInfo] = useState(null as FullRecipeInfo | null);
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [threadId, setThreadId] = useState('');

  const clean: FullRecipeInfo = {
    "title": "גלידוניות וניל ולוטוס ב-5 מרכיבים",
    "intro": "אוהבים גלידוניות? מתים על קינוחים פשוטים? הגעתם למקום הנכון. הניחו רגע לגרסה הקנויה והממכרת, ובואו לדאוג לעצמכם עם קינוח ביתי מושלם ומינימום מרכיבים.",
    "prepAndCookTime": {
      "workTime": "שעה",
      "totalTime": "יותר משלוש שעות",
      "difficulty": "בינוני"
    },
    "ingredients": [
      "330 מ\"ל (גביע ושליש) שמנת מתוקה",
      "200 גרם (חצי פחית) חלב מרוכז",
      "150 גרם עוגיות לוטוס, קצוצות גס",
      "350 גרם שוקולד מריר, קצוץ",
      "3 כפות שמן צמחי"
    ],
    "steps": [
      "מקציפים את השמנת המתוקה עד לקבלת קצפת יציבה. שמים את החלב המרוכז ועוגיות הלוטוס בקערה, ומערבבים פנימה את הקצפת בתנועות קיפול.",
      "משטחים את התערובת בתבנית מרובעת בגודל 20 ס\"מ (מרופדת בניילון נצמד או נייר אפייה), ומקפיאים למשך הלילה.",
      "פורסים את הגלידה בזריזות לקוביות של כ-4 ס\"מ בעזרת סכין חדה, ומחזירים להקפאה עד להתייצבות מלאה. מסדרים את הקוביות על תבנית מרופדת בנייר אפייה, ושומרים במקפיא (חשוב שקוביות הגלידה יהיו קפואות היטב לפני שמצפים אותן).",
      "ממיסים בבן מארי או במיקרוגל את השוקולד המריר, מוסיפים שמן ומערבבים. מצננים עד שהשוקולד אינו חם למגע אך עדיין נוזלי.",
      "מניחים את קוביות הגלידה על מזלג (אחת בכל פעם), וטובלים בשוקולד המומס. מניחים מיד על התבנית (חשוב לעבוד במהירות ובחדר ממוזג היטב). מעבירים להקפאה לכמה שעות עד להתייצבות מלאה."
    ],
    "comments": "* בימי הקיץ הלוהטים מומלץ לעבוד בחדר ממוזג, ולוודא שהמקפיא מכוון להקפאה מקסימלית כדי שהגלידה תהיה יציבה כמה שיותר."
  };

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
