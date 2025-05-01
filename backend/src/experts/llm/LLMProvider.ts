
/*
	This interface defines the behaviour of a Language Model Provider.
	It can be easily implemented to add support for different LLM providers.
*/
export interface LLMProvider {

  generate(prompt: string): Promise<string>;
	
}