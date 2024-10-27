import { OpenAI } from 'openai';
import { ChatModel } from 'openai/resources/chat';

const assistantId = process.env.EXPO_PUBLIC_ASSISTANT_ID?.trim() as string;
export const apiKey = process.env.EXPO_PUBLIC_OPENAI_KEY;
const models: { completion: Record<string, ChatModel> } = {
    completion: {
         'gpt-4o': 'gpt-4o'
    },
}

// TODO remove dangerouslyAllowBrowser
 const client = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true })
 

export default {
    constants: {
        assistantId,
        apiKey,
    },
    client,
    models
}