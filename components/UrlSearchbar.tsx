import getHtml from "@/hooks/htmlHandler";
import { cleanPageContent, initAssistant } from "@/hooks/recipeAnalyzer";
import { useState } from "react";
import { Searchbar } from "react-native-paper";

export type UrlSearchbarProps = {
    textColor: string,
    threadId: string,
    onContentReceived: (content: string) => void,
    onContentAnalyzed: () => void,
    onError: (err: any) => void,
    id: string,
    placeholder: string
};

export default function UrlSearchbar({ textColor, threadId, onContentReceived, onContentAnalyzed, onError,
        id = 'urlInput',
        placeholder = 'Enter URL here' }: UrlSearchbarProps) {

    const [url, setUrl] = useState('');
    const [urlInputLoading, setUrlInputLoading] = useState(false);

    const onSubmitEditing = (threadId: string,
        onContentReceived: (content: string) => void,
        onContentAnalyzed: () => void,
        onError: (err: any) => void): void => {
        setUrlInputLoading(true);
        getHtml(url)
            .then(html => cleanPageContent(html))
            .then(html => {
                onContentReceived(html);
                setUrlInputLoading(false);
                return html;
            })
            .then(html => initAssistant(html, threadId)
                .then(_ => onContentAnalyzed())
                .catch(error => {
                    console.error('Error initing assistant:', error);
                    onError(error);
                })
            )
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
            placeholderTextColor={textColor}
            onChangeText={newText => setUrl(newText)}
            loading={urlInputLoading}
            onSubmitEditing={_ => onSubmitEditing(threadId, onContentReceived, onContentAnalyzed, onError)}
        />
    );
}