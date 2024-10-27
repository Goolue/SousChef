import { Bubble, GiftedChat, IMessage, User } from "react-native-gifted-chat";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import { Button } from "react-native-paper";
import { tts } from "@/hooks/audioHandler";
import Colors from "@/constants/Colors";
import { FullRecipeInfo, initChatConnection, sendChatMessage } from "@/hooks/recipeAnalyzer";

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
    playSound: boolean,
    fullRecipeInfo: FullRecipeInfo,
}

const Chat: React.FC<ChatProps> = ({ disableComposer, playSound, fullRecipeInfo }: ChatProps) => {
    const [messages, setMessages] = useState<IMessage[]>([])
    const [loading, setLoading] = useState(false)

    let currentMessage: IMessage | null = null;

    const appendMessage = useCallback((messages: IMessage[] = []) => {
        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messages),
        );
    }, [])

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
            renderSend={props =>
                 <Button onTouchEnd={() => {
                const { text, onSend } = props;
                if (text && onSend) {
                    onSend({ text: text, _id: 1 }, true)
                }
            }}>Send</Button>}
        />
    )
};

export default Chat;
