import { Client } from '@elastic/elasticsearch';
import type { Document } from '@langchain/core/documents';
const client = new Client({
	node: 'http://localhost:9200',
});

// interface ElasticsearchDocument {
// 	_id: string;
// 	_source: {
// 		content: string;
// 		title: string;
// 	}
// }

const getAllElasticsearchDocuments = async () => {
	const indexExists = await client.indices.exists({ index: 'wiki' });
	if (!indexExists) {
		throw new Error('Index does not exist');
	}

	const response = await client.search({ index: 'wiki' });
	console.log('getAllElasticsearchDocuments | response:', response);
	return response.hits.hits;
};

export const getRawElasticsearchDocuments = async (): Promise<Document[]> => {
	const elasticsearchDocuments = await getAllElasticsearchDocuments();
	const docs: Document[] = elasticsearchDocuments.map((hit) => ({
		pageContent: hit._source.content,
		metadata: { id: hit._id, title: hit._source.title },
		id: hit._id,
	}));
	return docs;
};
