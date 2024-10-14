import { Ollama } from '@langchain/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
	RunnablePassthrough,
	RunnableSequence,
} from '@langchain/core/runnables';
import { initializeVectorStore, retriever } from './utils/retriever.ts';

const llm = new Ollama({
	baseUrl: 'http://localhost:11434',
	model: 'llama3.1:8b-instruct-q5_K_M',
});

const standaloneQuestionTemplate =
	'Given a question, convert it to a standalone question. question: {question} standalone question:';
const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
	standaloneQuestionTemplate,
);

const answerTemplate =
	`You are a helpful and enthusiastic support bot who can answer a given question from wiki.js database based on the context provided. Try to find the answer in the context. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email hello@test.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
context: {context}
question: {question}
answer: `;

const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

const standaloneQuestionChain = standaloneQuestionPrompt
	.pipe(llm)
	.pipe(new StringOutputParser());

const retrieverChain = RunnableSequence.from([
	(prevResult) => prevResult.standalone_question,
	retriever,
]);

const answerChain = answerPrompt
	.pipe(llm)
	.pipe(new StringOutputParser());

const chain = RunnableSequence.from([
	{
		standalone_question: standaloneQuestionChain,
		original_input: new RunnablePassthrough(),
	},
	{
		context: retrieverChain,
		question: ({ original_input }) => original_input.question,
	},
	answerChain,
]);

await initializeVectorStore();

const response = await chain.invoke({
	question: 'Who is point of contact from devops team?',
});

console.log('Response from wikibot: \n', response);
