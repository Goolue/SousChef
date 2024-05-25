import { OpenAI } from 'openai';
import { TextContentBlock } from 'openai/resources/beta/threads/messages';
import { measureDuration } from './utils/durationUtils';

// TODO remove dangerouslyAllowBrowser
const client = new OpenAI({apiKey: `${process.env.OPENAI_KEY}`, dangerouslyAllowBrowser: true})
const assistantId = process.env.ASSISTANT_ID;

export async function initThread(): Promise<string> {
    return measureDuration('initThread', async () => {
        const thread = await client.beta.threads.create();

        console.log(`created thread: ${thread.id}`)
        return thread.id;
    });
}

export async function cleanPageContent(pageContent: string): Promise<string> {
    return measureDuration('cleanHtml', async () => {

        const systemPrompt = `You are an HTML and web design expert.
        When prompted with the content of an web page, you will remove anything that isn't the actual content of the page, the page's body, 
        such as links, ads, headers, footers, disclaimers, copy rights, etc. You will only leave the actual content of the page.`
        const userPrompt = `This is the content of my web page, remove any boilerplate from it, leaving just the actual content of the article: ${pageContent}`

        console.log('cleaning page content')
        const response = await client.chat.completions.create({
            stream: false,
            model: 'gpt-4o',
            n: 1,
            temperature: 1,
            messages: [
                { 'role': 'system', content: systemPrompt },
                { 'role': 'user', content: userPrompt }
            ]
        });

        const clean = response.choices[0].message.content as string;

        console.log(`original page content: ${pageContent}`);
        console.log(`cleaned page content: ${clean}`);
        return clean;
    });
}

export async function initAssistant(recipe: string, threadId: string): Promise<string> {
    return measureDuration('initAssistant', async () => {

        console.log('sending recipe message')
        await client.beta.threads.messages.create(
            threadId,
            {
                role: "user",
                content: `This is my receipt: ${recipe}. When you're done reading it just reply "OK"`
            }
        );

        console.log('running assistant')
        let run = await client.beta.threads.runs.createAndPoll(
            threadId, { assistant_id: assistantId }
        );

        return await waitForRun(run);
    });
}

export async function askQuestion(question: string, threadId: string): Promise<string> {
    return measureDuration('askQuestion', async () => {
        console.log('sending question message')
        await client.beta.threads.messages.create(threadId, { role: "user", content: question });

        console.log('running assistant')
        let run = await client.beta.threads.runs.createAndPoll(
            threadId, { assistant_id: assistantId }
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

