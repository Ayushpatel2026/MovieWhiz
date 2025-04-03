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
		inputs.forEach(async input => {
			if (input.type === 'text'){
				const response = await this.experts.find(expert => expert.name === 'LLM Expert')!.analyze(input);

				this.expertResponses.push(response);
			}

			if (input.type === 'audio'){
				const response = await this.experts.find(expert => expert.name === 'Soundtrack Expert')!.analyze(input);

				this.expertResponses.push(response);
			}

			if (input.type === 'form'){
				const response = await this.experts.find(expert => expert.name === 'Database Expert')!.analyze(input);

				this.expertResponses.push(response);
			}
		});

		return this.expertResponses;
	}
}