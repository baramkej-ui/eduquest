export type ProblemType =
  | 'multiple-choice'
  | 'fill-in-the-blank'
  | 'passage-comprehension'
  | 'audio-comprehension'
  | 'short-answer'
  | 'essay';


export type Problem = {
  id: string;
  topic: string; // e.g., 'reading', 'listening', 'grammar', 'vocabulary'
  difficulty: 'easy' | 'medium' | 'hard';
  questionText: string;
  problemType: ProblemType;
  correctAnswer: string;
  possibleAnswers?: string[];
  passage?: string; // For reading comprehension
  audioUrl?: string; // For listening problems
};
