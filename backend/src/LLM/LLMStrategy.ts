import { TextInput, ExpertResponse } from '../types/types';

export interface LMMStrategy {
    query(prompt: string): Promise<ExpertResponse>;
}