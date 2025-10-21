'use client';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { Problem } from '@/types/problem';

export function ProblemCard({ problem }: { problem: Problem & {id: string} }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!userAnswer) {
      toast({
        variant: 'destructive',
        title: 'Please provide an answer',
      });
      return;
    }
    const correct =
      userAnswer.toLowerCase().trim() === problem.correctAnswer.toLowerCase().trim();
    setIsCorrect(correct);
    setSubmitted(true);
  };

  const handleTryAgain = () => {
    setUserAnswer('');
    setSubmitted(false);
    setIsCorrect(null);
  };
  
  const problemType = problem.problemType;

  const renderAnswerInput = () => {
    switch (problemType) {
      case 'multiple-choice':
        return (
          <RadioGroup
            onValueChange={setUserAnswer}
            value={userAnswer}
            disabled={submitted}
          >
            {problem.possibleAnswers?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${problem.id}-${index}`} />
                <Label htmlFor={`${problem.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'fill-in-the-blank':
      default:
        return (
          <Input
            placeholder="Your answer"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={submitted}
          />
        );
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg">{problem.questionText}</CardTitle>
          <Badge variant="outline" className="whitespace-nowrap capitalize">
            {problem.topic}
          </Badge>
        </div>
        {problem.passage && (
          <CardDescription className="font-code mt-2 rounded-md bg-muted p-3 pt-2 text-foreground">
            {problem.passage}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">{renderAnswerInput()}</CardContent>
      <CardFooter className="flex-col items-stretch border-t px-6 py-4">
        {!submitted ? (
          <Button onClick={handleSubmit} className="w-full">
            Submit
          </Button>
        ) : (
          <div className="w-full space-y-4">
            {isCorrect ? (
              <div className="flex items-center gap-2 rounded-md border border-accent/30 bg-accent/20 p-3 text-accent-foreground">
                <CheckCircle className="h-5 w-5 text-accent" />
                <p className="font-semibold">Correct! Well done.</p>
              </div>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Incorrect</AlertTitle>
                <AlertDescription>
                  The correct answer is: <strong>{problem.correctAnswer}</strong>
                </AlertDescription>
              </Alert>
            )}
            <Button onClick={handleTryAgain} variant="secondary" className="w-full">
              Try Another
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
