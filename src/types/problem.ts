export type Problem = {
  id: string;
  topic: string;
  difficulty: string;
  questionText: string;
  correctAnswer: string;
  possibleAnswers?: string[];
  type: string;
  passage?: string;
};
