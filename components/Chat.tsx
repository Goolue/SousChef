import { Bubble, GiftedChat, IMessage, User } from "react-native-gifted-chat";
import { useCallback, useEffect, useImperativeHandle, useState } from "react";
import React from "react";
import { Button } from "react-native-paper";
import { tts } from "@/hooks/audioHandler";
import Colors from "@/constants/Colors";
import OpenAiRealtimeHandler from "@/hooks/openAiRealtimeHandler";
import { FullRecipeInfo, initChatConnection, sendChatMessage } from "@/hooks/recipeAnalyzer";
import { add } from "cheerio/lib/api/traversing";
import { text } from "cheerio/lib/api/manipulation";

const user: User = {
    _id: 0,
    name: 'You'
}

export interface ChatMessage {
    text: string
    user: User
}

export interface ChatProps {
    disableComposer: boolean,
    onSend: (message: string) => void,
    playSound: boolean,
    fullRecipeInfo: FullRecipeInfo,
}

const toIMessage = (msg: ChatMessage): IMessage => {
    return {
        _id: Math.random().toString(),
        text: msg.text,
        createdAt: new Date(),
        user: msg.user,
        system: false,
        sent: true,
        received: true,
    }
};


export type ChatRefCallbacks = {
    sendMessage: (message: ChatMessage) => void;
    startMessage: (text: string) => void;
    addMessageDelta: (delta: string) => void;
    finishMessage: () => void;
};

const Chat = React.forwardRef(({ disableComposer, onSend, playSound, fullRecipeInfo }: ChatProps,
    ref: React.Ref<ChatRefCallbacks>) => {
    const [messages, setMessages] = useState<IMessage[]>([])
    const [loading, setLoading] = useState(false)

    let currentMessage: IMessage | null = null;

    const appendMessage = useCallback((messages: IMessage[] = []) => {
        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messages),
        );
    }, [])

    // deprecated
    const addAnswer = (msg: ChatMessage) => {
        setLoading(false);
        appendMessage([toIMessage(msg)]);

        if (playSound) {
            console.log('Playing sound')
            tts(msg.text);
        }
        else {
            console.log('Not playing sound')
        }
    }

    const addQuestion = (messages: IMessage[]) => {
        appendMessage(messages);
        setLoading(true);
        sendChatMessage(messages[0].text);
    }

    const onTextReceived = (text: string) => {
        if (currentMessage) {
            addAnswerDelta(text);
            return;
        }

        startAnswer(text);
    };

    const startAnswer = (text: string) => {
        console.log(`Starting answer: ${text}`);
        const message: IMessage = {
            _id: Math.random().toString(),
            text,
            createdAt: new Date(),
            user: {
                _id: 1,
                name: 'Chef'
            },
            system: false,
            sent: false,
            received: false,
        };
        currentMessage = message;
        setLoading(false);
        appendMessage([message]);
    }

    const addAnswerDelta = (delta: string) => {
        console.log(`adding delta: ${delta}`)
        if (!currentMessage) {
            console.error('No current message')
            return;
        }

        const updatedMessage = {
            ...currentMessage,
            text: currentMessage.text + delta,
        };
        currentMessage = updatedMessage;

        // Update the messages state
        setMessages(previousMessages =>
            previousMessages.map(msg =>
                msg._id === updatedMessage._id ? updatedMessage : msg
            )
        );
    };

    const onTextEnded = (text?: string) => {
        console.log(`finishing answer: ${text}`)

        if (!currentMessage) {
            console.error('No current message')
            return;
        }

        const updatedMessage = {
            ...currentMessage,
            sent: true,
            received: true,
        };

        // Update the messages state
        setMessages(previousMessages =>
            previousMessages.map(msg =>
                msg._id === updatedMessage._id ? updatedMessage : msg
            )
        );
        if (playSound) {
            console.log('Playing sound')
            tts(currentMessage.text);
        }
        else {
            console.log('Not playing sound')
        }

        currentMessage = null;
    };

    useEffect(() => {
        initChatConnection(fullRecipeInfo, onTextReceived, onTextEnded);
    }, []);

    useImperativeHandle(ref, () => ({
        sendMessage: addAnswer,
        startMessage: onTextReceived,
        addMessageDelta: addAnswerDelta,
        finishMessage: onTextEnded,
    }));



    const renderBubble = (props: any) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        borderWidth: 2,
                        backgroundColor: Colors.background,
                    },
                    left: {
                        borderWidth: 2,
                        backgroundColor: Colors.surfaceVariant,
                    },
                }}
            />
        );
    }

    return (
        <GiftedChat
            messages={messages}
            isTyping={loading}
            user={user}
            onSend={messages => addQuestion(messages)}
            placeholder="Ask the chef a question..."
            disableComposer={disableComposer}
            showUserAvatar={false}
            alwaysShowSend={false}
            renderBubble={renderBubble}
            // renderComposer={props => <TextInput onChangeText={(text: string) => props.text = text} theme={DefaultTheme} mode="outlined" style={{
            //     width: '50%'
            // }}/>}

            // TODO test
            renderSend={props => <Button onTouchEnd={() => {
                const { text, onSend } = props;
                if (text && onSend) {
                    console.log(`send: ${text}`)
                    onSend({ text: text, _id: 1 }, true)
                }
            }}>Send</Button>}
        />
    )
});

export default Chat;
