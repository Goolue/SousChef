import { GiftedChat, IMessage, User } from "react-native-gifted-chat";
import { useCallback, useImperativeHandle, useState } from "react";
import React from "react";
import { TextInput } from "react-native-paper";

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
    disableComposer: boolean,
    onSend: (message: string) => void
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

// const CustomInput = (props: ComposerProps) => {
//     return (
//         <TextInput {...props} />
//     )
// };

const Chat = React.forwardRef(({ isTyping, disableComposer, onSend }: ChatProps, ref: React.Ref<{ sendMessage: (message: ChatMessage) => void }>) => {
    const [messages, setMessages] = useState<IMessage[]>([])

    const appendMessage = useCallback((messages: IMessage[] = []) => {
        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messages),
        )
    }, [])

    const sendMessage = (msg: ChatMessage) => {
        appendMessage([toIMessage(msg)]);
        onSend(msg.text);
    }

    useImperativeHandle(ref, () => ({
        sendMessage,
    }));

    return (
        <GiftedChat
            messages={messages}
            isTyping={isTyping}
            user={user}
            onSend={messages => {
                appendMessage(messages);
                onSend(messages[0].text)
            }}
            placeholder="Ask the chef a question..."
            disableComposer={disableComposer}
            showUserAvatar={false}
            alwaysShowSend={false}
            // renderComposer={props => <CustomInput {...props} />}
        />
    )
});

export default Chat;