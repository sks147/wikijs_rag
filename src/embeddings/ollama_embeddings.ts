import { OllamaEmbeddings } from '@langchain/ollama';

const embeddings: OllamaEmbeddings = new OllamaEmbeddings({
	baseUrl: 'http://localhost:11434', // Default Ollama API URL
	model: 'llama3.1:8b-instruct-q5_K_M',
});

export { embeddings };
