import {ChatCompletionRequest, Message, ModelType} from "../types/types";

export const sendChatMessage = async (
    messages: Message[],
    onChunk: (chunk: string) => void,
    model: ModelType = "llama3.2",
    files?: File[]
) => {
  try {
    const formData = new FormData();

    // Add files if present
    files?.forEach(file => {
      formData.append('files', file);
    });

    // Add request data
    const requestData: ChatCompletionRequest = {
      messages,
      stream: true,
      model,
    };
    formData.append('request', JSON.stringify(requestData));
    const response = await fetch('http://localhost:8000/personal_chatbot/v1/chat/completions', {
      method: 'POST',
      body: formData,
    });
    // const response = await fetch('http://localhost:8000/personal_chatbot/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(chatCompletionRequest),
    // });

    if (!response.ok) throw new Error('Network response was not ok');

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Split on newlines and handle leftover
      const newlineIndex = buffer.lastIndexOf('\n');
      if (newlineIndex === -1) continue;

      const lines = buffer.slice(0, newlineIndex).split('\n');
      buffer = buffer.slice(newlineIndex + 1);

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const jsonData = JSON.parse(line.trim());
          if (jsonData?.content) {
            onChunk(jsonData.content);
          }
        } catch (e) {
          console.error('Parse error for line:', line);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
