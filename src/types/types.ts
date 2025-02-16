export interface Message {
  role: 'user' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
    messages: Message[];
    stream: boolean;
    model: ModelType;
}

export interface ChatCompletionResponse {
    id: string;
    content: string;
    created: number;
    model: string;
    usage?: object
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    timestamp: Date;
}

export type ModelType = "llama3.2" | "gpt-4o-mini" | "gpt-4o";

export const AVAILABLE_MODELS: ModelType[] = ["llama3.2", "gpt-4o-mini", "gpt-4o"];