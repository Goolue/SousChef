import getHtml from "@/hooks/htmlHandler";
import { FullRecipeInfo, cleanPageContent, initThread } from "@/hooks/recipeAnalyzer";
import { useState } from "react";
import { DefaultTheme, Searchbar } from "react-native-paper";
import Animated, { FadeOutUp } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import Colors from "@/constants/Colors";

export type UrlSearchbarProps = {
    onThreadCreated: (threadId: string) => void,
    onContentReceived: (content: FullRecipeInfo) => void,
    onContentAnalyzed: () => void,
    onError: (err: any) => void,
    onSubmit?: () => void,
    id?: string,
    placeholder?: string,
};

export default function UrlSearchbar({ onSubmit, onThreadCreated, onContentReceived, onContentAnalyzed, onError,
    id = 'urlInput',
    placeholder = 'Enter URL here' }: UrlSearchbarProps) {

    const [visible, setVisible] = useState(true);
    const [url, setUrl] = useState('');
    const [urlInputLoading, setUrlInputLoading] = useState(false);

    const onSubmitEditing = (
        onContentReceived: (content: FullRecipeInfo) => void,
        onContentAnalyzed: () => void,
        onError: (err: any) => void,
        onSubmit?: () => void
    ): void => {
        setUrlInputLoading(true);
        if (onSubmit) {
            onSubmit();
        }

        getHtml(url)
            .then(html => cleanPageContent(html))
            .then(fullRecipe => {
                initThread(fullRecipe)
                    .then(threadId => onThreadCreated(threadId))
                    .then(_ => {
                        onContentAnalyzed();
                        setUrlInputLoading(false);
                    })
                onContentReceived(fullRecipe);
                return fullRecipe;
            })
            .then(_ => setVisible(false))
            .catch(error => {
                console.error('Error fetching HTML:', error);
                setUrlInputLoading(false);
                onError(error);
            });
    }

    return visible && (
        <Animated.View
            exiting={FadeOutUp}
            style={styles.searchbarView}
        >
            <Searchbar
                style={styles.searchbar}
                theme={{...DefaultTheme, colors: {...Colors, background: 'red'}}}
                inputStyle={styles.backgroundColor}
                traileringIcon={'clipboard-outline'}
                onTraileringIconPress={_ => console.log('Clipboard icon pressed')}
                value={url}
                id={id}
                placeholder={placeholder}
                onChangeText={newText => setUrl(newText)}
                loading={urlInputLoading}
                onSubmitEditing={_ => onSubmitEditing(onContentReceived, onContentAnalyzed, onError, onSubmit)}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    searchbarView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    searchbar: {
        borderWidth: 3,
    },
    backgroundColor: {
        backgroundColor: Colors.surfaceVariant
    }
});