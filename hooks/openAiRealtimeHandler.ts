import { apiKey } from "@/constants/OpenaiConstants";

const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview";

export type RealtimeResponse = {
    text: string;
}

export type InitWebsocketParams = {
    conversationInitPrompts: {
        systemPrompt?: string;
        userPrompt?: string;
    }
    onResponseTextReceived?: (response: string) => void;
    onResponseTextDone?: (text?: string) => void;
}

class OpenAiRealtimeHandler {
    private ws: WebSocket | null = null;

    constructor(private initParams: InitWebsocketParams) {}

    private isWsNotOpen() {
        return !this.ws || this.ws.readyState !== WebSocket.OPEN;
    }

    private async handleOpen() {
        if (this.isWsNotOpen()) {
            console.error("WebSocket connection is not open");
            return;
        }

        const { conversationInitPrompts } = this.initParams;
        console.log(`WS connection is opened, sending conversation init prompts: ${JSON.stringify(conversationInitPrompts)}`);

        if (conversationInitPrompts.systemPrompt) {
            const createConversationEvent = {
                type: "conversation.item.create",
                item: {
                    type: "message",
                    role: "assistant",
                    content: [
                        {
                            type: "text",
                            text: conversationInitPrompts.systemPrompt
                        }
                    ]
                }
            };
            this.ws?.send(JSON.stringify(createConversationEvent));
        }
        if (conversationInitPrompts.userPrompt) {
            const createConversationEvent = {
                type: "conversation.item.create",
                item: {
                    type: "message",
                    role: "user",
                    content: [
                        {
                            type: "input_text",
                            text: conversationInitPrompts.userPrompt
                        }
                    ]
                }
            };
            this.ws?.send(JSON.stringify(createConversationEvent));
        }
    }

    private createResponse() {
        const createResponseEvent = {
            type: "response.create",
            response: {
                modalities: ["text"],
                instructions: "Please assist the user.",
            }
        };
        this.ws?.send(JSON.stringify(createResponseEvent));
    }

    private async handleMessage(event: MessageEvent): Promise<void> {
        if (this.isWsNotOpen()) {
            console.error("WebSocket connection is not open");
            return;
        }

        const { onResponseTextReceived, onResponseTextDone } = this.initParams;
        const message = JSON.parse(event.data);
        console.log(`Received message of type: ${JSON.stringify(message.type)}`);

        switch (message.type) {
            case "error":
                console.error(`Received error message: ${message}. Closing WebSocket connection.`);
                this.ws?.close();
                console.log("WebSocket connection closed");
                break;
            case "response.text.delta":
                console.log(`Received DELTA: ${message.delta}`);
                onResponseTextReceived?.(message.delta);
                break;
            case "response.text.done":
                console.log(`Received response text done: ${message.text}`);
                onResponseTextDone?.(message.text);
                break;
        }
    }

    public initWebsocket() {
        console.log("Initializing websocket");

        if (this.isWsNotOpen()) {
            console.log("WebSocket connection is already open, closing it");
            this.ws?.close();
        }

        console.log(`Connecting to websocket at: ${url}, with params: ${JSON.stringify(this.initParams)}`);
        // @ts-ignore: Ignore TypeScript errors for WebSocket initialization
        this.ws = new WebSocket(url, [], {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': 'realtime=v1'
            }
        });

        console.log("Setting up websocket event handlers");

        this.ws.onopen = () => this.handleOpen();
        this.ws.onmessage = (event) => this.handleMessage(event);
        this.ws.onerror = (error) => console.error("WebSocket error: ", error);
        this.ws.onclose = () => console.log("WebSocket connection closed");
    }

    public sendMessage(message: string, getResponse: boolean = true) {
        if (this.isWsNotOpen()) {
            console.error("WebSocket connection is not open");
            return;
        }

        console.log(`Sending message: ${message}`);
        const createConversationEvent = {
            type: "conversation.item.create",
            item: {
                type: "message",
                role: "user",
                content: [
                    {
                        type: "input_text",
                        text: message
                    }
                ]
            }
        };
        this.ws?.send(JSON.stringify(createConversationEvent));

        if (getResponse) {
            this.createResponse();
        }
    }

    public closeWebsocket() {
        if (this.isWsNotOpen()) {
            console.error("WebSocket connection is not open");
            return;
        }

        console.log("Closing websocket connection");
        this.ws?.close();
    }
}

export default OpenAiRealtimeHandler;
