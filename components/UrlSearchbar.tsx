import getHtml from "@/hooks/htmlHandler";
import { FullRecipeInfo, cleanPageContent, initThread } from "@/hooks/recipeAnalyzer";
import { useState } from "react";
import { DefaultTheme, HelperText, Searchbar } from "react-native-paper";
import Animated, { FadeOutUp } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import Colors from "@/constants/Colors";
import * as Clipboard from 'expo-clipboard';

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
    const [errorText, setErrorText] = useState('');

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

        const getHtmlErrHandler = (err: unknown) => {
            setErrorText(`${err}`)
            console.error(`errorText is now: ${err}`)
        };
        getHtml(url, getHtmlErrHandler)
            .then(html => cleanPageContent(html))
            .then(fullRecipe => {
                if (fullRecipe === null) {
                    return null;
                }
                initThread(fullRecipe)
                    .then(threadId => onThreadCreated(threadId))
                    .then(_ => {
                        onContentAnalyzed();
                        setUrlInputLoading(false);
                        setVisible(false);
                    })
                onContentReceived(fullRecipe);
                return fullRecipe;
            })
            .catch(error => {
                console.error('Error fetching HTML:', error);
                setUrlInputLoading(false);
                onError(error);
            });
    }

    const pasteFromClipboard = async (_ : any) => {
        const text = await Clipboard.getStringAsync();
        setUrl(text);
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
                onTraileringIconPress={pasteFromClipboard}
                value={url}
                id={id}
                placeholder={placeholder}
                onChangeText={newText => setUrl(newText)}
                loading={urlInputLoading}
                onSubmitEditing={_ => onSubmitEditing(onContentReceived, onContentAnalyzed, onError, onSubmit)}  
            />
            <HelperText type="error" visible={errorText !== ''}> 
                {errorText}
            </HelperText>
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
        backgroundColor: Colors.surfaceVariant
    },
    backgroundColor: {
        backgroundColor: Colors.surfaceVariant
    }
});