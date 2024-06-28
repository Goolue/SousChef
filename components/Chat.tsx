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
    const [loading, setLoading] = useState(false)

    const appendMessage = useCallback((messages: IMessage[] = []) => {
        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messages),
        )
    }, [])

    const addAnswer = (msg: ChatMessage) => {
        setLoading(false);
        appendMessage([toIMessage(msg)]);
    }

    const addQuestion = (messages: IMessage[]) => {
        appendMessage(messages);
        setLoading(true);
        onSend(messages[0].text)
    }

    useImperativeHandle(ref, () => ({
        sendMessage: addAnswer,
    }));

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
        // renderComposer={props => <CustomInput {...props} />}
        />
    )
});

export default Chat;