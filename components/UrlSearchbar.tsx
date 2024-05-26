import getHtml from "@/hooks/htmlHandler";
import { FullRecipeInfo, cleanPageContent, initThread } from "@/hooks/recipeAnalyzer";
import { useState } from "react";
import { Searchbar } from "react-native-paper";

export type UrlSearchbarProps = {
    onThreadCreated: (threadId: string) => void,
    onContentReceived: (content: FullRecipeInfo) => void,
    onContentAnalyzed: () => void,
    onError: (err: any) => void,
    id: string,
    placeholder: string
};

export default function UrlSearchbar({ onThreadCreated, onContentReceived, onContentAnalyzed, onError,
    id = 'urlInput',
    placeholder = 'Enter URL here' }: UrlSearchbarProps) {

    const [url, setUrl] = useState('');
    const [urlInputLoading, setUrlInputLoading] = useState(false);
    const [threadId, setThreadId] = useState('');

    const onSubmitEditing = (onContentReceived: (content: FullRecipeInfo) => void,
        onContentAnalyzed: () => void,
        onError: (err: any) => void): void => {
        setUrlInputLoading(true);
        getHtml(url)
            .then(html => cleanPageContent(html))
            .then(fullRecipe => {
                initThread(fullRecipe)
                    .then(threadId => {
                        setThreadId(threadId);
                        onThreadCreated(threadId);
                    })
                    .then(_ => {
                        onContentAnalyzed();
                        setUrlInputLoading(false);
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

    return (
        <Searchbar
            value={url}
            id={id}
            placeholder={placeholder}
            onChangeText={newText => setUrl(newText)}
            loading={urlInputLoading}
            onSubmitEditing={_ => onSubmitEditing(threadId, onContentReceived, onContentAnalyzed, onError)}
        />
    );
}