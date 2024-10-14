import { RedisVectorStore } from '@langchain/redis';
import { VectorStoreRetriever } from '@langchain/core/vectorstores';
import { embeddings } from '../embeddings/ollama_embeddings.ts';
import { createClient } from 'redis';

import { getRawElasticsearchDocuments } from '../raw_document_utils/elasticsearch_raw_documents.ts';

const redisClient = createClient({
	url: 'redis://localhost:6379',
});

await redisClient.connect();

const vectorStore = new RedisVectorStore(embeddings, {
	redisClient: redisClient,
	indexName: 'wiki_vectors',
});

const retriever: VectorStoreRetriever = vectorStore.asRetriever();

async function initializeVectorStore(): Promise<void> {
	const docs = await getRawElasticsearchDocuments();
	console.log('docs:', docs);
	await vectorStore.addDocuments(docs);
}

export { initializeVectorStore, retriever };
