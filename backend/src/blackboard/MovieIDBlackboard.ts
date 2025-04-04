import { Expert, ExpertResponse } from '../experts/Expert';
import { Input } from '../types/types';

export class MovieIDBlackboard {

	public experts : Expert[];
	public expertResponses : ExpertResponse[] = [];
  
	constructor() {
		this.experts = [];
  }

	subscribe(expert: Expert) {
		this.experts.push(expert);
	}

	async notifyExperts(inputs: Input[]) : Promise<ExpertResponse[]> {
		const promises: Promise<ExpertResponse>[] = inputs.map(async input => {
			if (input.type === 'text') {
			  const expert = this.experts.find(exp => exp.name === 'LLM Expert');
			  return expert ? await expert.analyze(input) : Promise.resolve({ expertName: 'LLM Expert', movies: [], confidence: 0 });
			}
		
			if (input.type === 'audio') {
			  const expert = this.experts.find(exp => exp.name === 'Soundtrack Expert');
			  return expert ? await expert.analyze(input) : Promise.resolve({ expertName: 'Soundtrack Expert', movies: [], confidence: 0 });
			}
		
			if (input.type === 'form') {
			  const expert = this.experts.find(exp => exp.name === 'Database Expert');
			  const response = expert ? await expert.analyze(input) : { expertName: 'Database Expert', movies: [], confidence: 0 };
			  console.log("Response from Database Expert:", response);
			  return response;
			}
		
			return Promise.resolve({ expertName: 'Unknown Expert', movies: [], confidence: 0 }); // Handle unknown input types
		  });
		
		  this.expertResponses = await Promise.all(promises);
		  return this.expertResponses;
	}
}