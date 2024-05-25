import getHtml from "@/hooks/htmlHandler";
import { cleanPageContent, initThread } from "@/hooks/recipeAnalyzer";
import { useState } from "react";
import { Searchbar } from "react-native-paper";

export type UrlSearchbarProps = {
    textColor: string,
    onThreadCreated: (threadId: string) => void,
    onContentReceived: (content: string) => void,
    onContentAnalyzed: () => void,
    onError: (err: any) => void,
    id: string,
    placeholder: string
};

export default function UrlSearchbar({ textColor, onThreadCreated, onContentReceived, onContentAnalyzed, onError,
    id = 'urlInput',
    placeholder = 'Enter URL here' }: UrlSearchbarProps) {

    const [url, setUrl] = useState('');
    const [urlInputLoading, setUrlInputLoading] = useState(false);
    const [threadId, setThreadId] = useState('');

    const onSubmitEditing = (threadId: string,
        onContentReceived: (content: string) => void,
        onContentAnalyzed: () => void,
        onError: (err: any) => void): void => {
        setUrlInputLoading(true);
        getHtml(url)
            .then(html => cleanPageContent(html))
            .then(html => {
                initThread(html)
                    .then(threadId => {
                        setThreadId(threadId);
                        onThreadCreated(threadId);
                    })
                    .then(_ => {
                        onContentAnalyzed();
                        setUrlInputLoading(false);
                    })
                onContentReceived(html);
                return html;
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