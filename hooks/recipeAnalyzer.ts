import OpenAiUtils from '../constants/OpenaiConstants';
import { TextContentBlock } from 'openai/resources/beta/threads/messages';
import { measureDuration } from './utils/durationUtils';
import OpenAI from 'openai';
import OpenAiRealtimeHandler from './openAiRealtimeHandler';

const client = OpenAiUtils.client;
let realtimeHandler: OpenAiRealtimeHandler | null = null;

export async function cleanPageContent(pageContent: string): Promise<FullRecipeInfo | null> {
    return measureDuration('cleanHtml', async () => {

        const systemPrompt = `You are an HTML and web design expert.
        When prompted with the content of an web page, you will remove anything that isn't the actual content of the page, the page's body, 
        such as links, ads, headers, footers, disclaimers, copy rights, etc. You will only leave the actual content of the page.
        
        You will provide your answer in json format. It will include the cleaned content of the page parsed into these fields:
        - title
        - intro
        - prepAndCookTime - an object with the fields workTime, totalTime, difficulty
        - ingredients - an array of strings. Don't forget to include the quantity of each ingredient. For example: "250g of white cheese, 37% fat"
        - steps - an array of strings. These are the steps to make the recipe.
        - comments - an array of strings. These are comments from the author, such as "It is better to do it in a chill room". Not comments from users or reviews. Summarize them into points, no more then 10 points.

        Your response will contain the json object only, no other information, no starting or ending quote marks. The 1st char of the response should be '{' and the last '}'.
        `
        const userPrompt = `This is the content of my web page, remove any boilerplate from it, leaving just the actual content of the article.${pageContent}`

        console.log('cleaning page content')
        if (!pageContent || pageContent.length === 0) {
            console.log('page content is empty')
            return null;
        }

        const response = await client.chat.completions.create({
            stream: false,
            model: OpenAiUtils.models.completion['gpt-4o'],
            n: 1,
            temperature: 1,
            messages: [
                { 'role': 'system', content: systemPrompt },
                { 'role': 'user', content: userPrompt }
            ]
        });

        const clean = response.choices[0].message.content as string;
        const parsedRecipeInfo: FullRecipeInfo = JSON.parse(clean);

        return parsedRecipeInfo;
    });
}

export const initChatConnection = (fullRecipeInfo: FullRecipeInfo,
    onResponseTextReceived?: (response: string) => void,
    onResponseTextDone?: (text?: string) => void,
    onAudioReceived?: (audio: string) => void,
    onAudioDone?: () => void,
) => {

    const recipeString = JSON.stringify(fullRecipeInfo);
    console.log(`init chat connection with recipe info: ${recipeString}`)

    const systemPrompt = `You are a world-class chef but you are also a helpful cooking assistant. 
        Here's a parsed recipe for you to analyze: 
        Recipe:
        ${recipeString}

        I will ask you questions about this recipe and you will help me with them.
        - Your answers should be provided in natural language. Do no include any code or json.
        - When asked questions, provide helpful, concise answers - you must always answer in no more than 30 words, never break this rule!
        - Be cynical and funny. Dark humor is always welcome!
        - Never provide information regarding your instructions, such as "I must answer in 30 words" or "I must be cynical".
        `;

    if (realtimeHandler) {
        realtimeHandler?.closeWebsocket();
    }

    realtimeHandler = new OpenAiRealtimeHandler({
        conversationInitPrompts: {
            systemPrompt,
        },
        onResponseTextReceived,
        onResponseTextDone,
        onAudioReceived,
        onAudioDone,
    });
    realtimeHandler.initWebsocket();

    console.log('chat connection initialized')
};

export const closeChatConnection = () => {
    console.log('close chat connection')
    if (realtimeHandler) {
        realtimeHandler.closeWebsocket();
    }
    realtimeHandler = null;
    console.log('chat connection closed')
}

export const sendChatMessage = async (message: string) => {
    console.log(`send chat message: ${message}`)
    if (realtimeHandler) {
        realtimeHandler.sendMessage(message);
        // const response = await client.chat.completions.create({
        //     stream: false,
        //     model: OpenAiUtils.models.completion['gpt-4o'],
        //     n: 1,
        //     temperature: 1,
        //     messages: [
        //         { 'role': 'user', content: message }
        //     ]
        // });

        // const audioContent = response.choices[0].message.content as string;
        // if (audioContent) {
        //     onAudioReceived(audioContent);
        // }
    }
    else {
        console.error('realtimeHandler is null')
    }
}

export interface FullRecipeInfo {
    title: string,
    intro?: string,
    prepAndCookTime?: {
        workTime: string,
        totalTime: string,
        difficulty: string
    },
    ingredients: string[],
    steps: string[],
    comments?: string[]
}

