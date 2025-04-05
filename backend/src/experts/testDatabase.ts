import { DatabaseExpert } from './DatabaseExpert';
import { MovieIDBlackboard } from '../blackboard/MovieIDBlackboard';
import { FormInput } from '../types/types';

const testInput: FormInput = {
  type: 'form',
  data: {
    setting: 'Greece'
  },
};

const blackboard = new MovieIDBlackboard();
const expert = new DatabaseExpert(blackboard);

async function runTest() {
  console.log('Running test...');
  
  try {
    const result = await expert.analyze(testInput);
    console.log('Result:', result);

    if (result.movies.length > 0) {
      console.log('Movies found:', result.movies);
    }
  } catch (error) {
    console.error('Error during analysis:', error);
  }
}

runTest();