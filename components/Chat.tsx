import { GiftedChat, IMessage, User } from "react-native-gifted-chat";
import { useCallback, useImperativeHandle, useState } from "react";
import React from "react";

const user: User = {
    _id: 0,
    name: 'You'
}

export interface ChatMessage {
    text: string
    user: User
}

export interface ChatProps {
    isTyping: boolean,
    disableComposer: boolean
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

const Chat = React.forwardRef(({ isTyping, disableComposer } : ChatProps, ref: React.Ref<{ sendMessage: (message: ChatMessage) => void }>) => {
    const [messages, setMessages] = useState<IMessage[]>([])

    const onSend = useCallback((messages: IMessage[] = []) => {
        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messages),
        )
    }, [])

    const sendMessage = (msg: ChatMessage) => {
        onSend([toIMessage(msg)]);
    }

    useImperativeHandle(ref, () => ({
        sendMessage,
    }));

    return (
        <GiftedChat
            messages={messages}
            isTyping={isTyping}
            user={user}
            onSend={messages => onSend(messages)}
            placeholder="Ask the chef a question..."
            disableComposer={disableComposer}
            showUserAvatar={false}
            isKeyboardInternallyHandled={true}
        />
    )
});

export default Chat;