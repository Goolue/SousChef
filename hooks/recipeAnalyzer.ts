import OpenAiUtils from '../constants/OpenaiConstants';
import { TextContentBlock } from 'openai/resources/beta/threads/messages';
import { measureDuration } from './utils/durationUtils';
import OpenAI from 'openai';

const client = OpenAiUtils.client;

export async function cleanPageContent(pageContent: string): Promise<FullRecipeInfo> {
    return measureDuration('cleanHtml', async () => {

        const systemPrompt = `You are an HTML and web design expert.
        When prompted with the content of an web page, you will remove anything that isn't the actual content of the page, the page's body, 
        such as links, ads, headers, footers, disclaimers, copy rights, etc. You will only leave the actual content of the page.
        
        You will provide your answer in json format. It will include the cleaned content of the page parsed into these fields:
        - title
        - intro
        - prepAndCookTime - an object with the fields workTime, totalTime, difficulty
        - ingredients - an array of strings
        - steps - an array of strings. These are the steps to make the recipe.
        - comments - an array of strings. These are comments from the author, such as "It is better to do it in a chill room". Not comments from users or reviews. Summarize them into points, no more then 10 points.

        Your response will contain the json object only, no other information, no starting or ending quote marks. The 1st char of the response should be '{' and the last '}'.
        `
        const userPrompt = `This is the content of my web page, remove any boilerplate from it, leaving just the actual content of the article.${pageContent}`

        console.log('cleaning page content')
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
        console.log(`cleaned page content: ${clean}`);
        const parsedRecipeInfo: FullRecipeInfo = JSON.parse(clean);
        
        return parsedRecipeInfo;
    });
}

export async function initThread(recipe: FullRecipeInfo): Promise<string> {
    return measureDuration('initThread', async () => {

        console.log('creating thread')
        const recipeString = JSON.stringify(recipe);
        const thread = await client.beta.threads.create({
            messages: [
                {
                    role: 'user',
                    content: `This is my receipt: ${recipeString}. Analyze it for me.`
                }
            ]
        });

        console.log(`created thread: ${thread.id}`)
        return thread.id;
    });
}

export async function askQuestion(question: string, threadId: string): Promise<string> {
    return measureDuration('askQuestion', async () => {
        console.log(`sending question message: ${question}`)
        await client.beta.threads.messages.create(threadId, { role: "user", content: question });

        console.log('running assistant')
        let run = await client.beta.threads.runs.createAndPoll(
            threadId, { assistant_id: OpenAiUtils.constants.assistantId }
        );

        return await waitForRun(run);
    });
}

async function waitForRun(run: OpenAI.Beta.Threads.Runs.Run): Promise<string> {
    return measureDuration('waitForRun', async () => {
        console.log(`waiting for run ${run.id}`);
        while (true) {
            if (run.status === 'completed') {
                const messages = await client.beta.threads.messages.list(
                    run.thread_id
                );
                const textMessage = messages.data?.filter(message => message.content[0]?.type === 'text')[0];

                const answer = (textMessage?.content[0] as TextContentBlock).text.value;

                console.log(`run ${run.id} completed with answer: ${answer}`);
                return answer;
            } else {
                console.log(`status: ${run.status}, error: ${run.last_error}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    });
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

