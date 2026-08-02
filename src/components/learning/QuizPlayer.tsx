"use client";

import { useState } from "react";
import { scoreQuizLocally } from "@/lib/content/catalog";

type Answer = { id: string; answerText: string };
type Question = {
  id: string;
  prompt: string;
  answers: Answer[];
};

type QuizPlayerProps = {
  slug: string;
  title: string;
  questions: Question[];
};

type ScorePayload = {
  score: number;
  total: number;
  results: {
    questionId: string;
    isCorrect: boolean;
    explanation: string | null;
    correctAnswerText: string | null;
    chosenAnswerText: string | null;
  }[];
};

export function QuizPlayer({ slug, title, questions }: QuizPlayerProps) {
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ScorePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const scored = scoreQuizLocally(
      slug,
      questions.map((question) => ({
        questionId: question.id,
        answerId: choices[question.id],
      })),
    );
    if (!scored) {
      setError("Could not score this quiz.");
      return;
    }
    setResult(scored);
  }

  return (
    <form className="quiz-player" onSubmit={onSubmit}>
      <h1>{title}</h1>
      <p className="section-lead">
        Choose an answer for each question. Correct answers are checked only after
        you submit.
      </p>
      {questions.map((question, index) => (
        <fieldset key={question.id} className="quiz-player__question">
          <legend>
            {index + 1}. {question.prompt}
          </legend>
          <div className="quiz-player__options">
            {question.answers.map((answer) => (
              <label key={answer.id} className="quiz-player__option">
                <input
                  type="radio"
                  name={question.id}
                  value={answer.id}
                  required
                  checked={choices[question.id] === answer.id}
                  onChange={() =>
                    setChoices((current) => ({
                      ...current,
                      [question.id]: answer.id,
                    }))
                  }
                />
                <span>{answer.answerText}</span>
              </label>
            ))}
          </div>
          {result ? (
            <p
              className={
                result.results.find((item) => item.questionId === question.id)
                  ?.isCorrect
                  ? "quiz-feedback quiz-feedback--ok"
                  : "quiz-feedback quiz-feedback--bad"
              }
              role="status"
            >
              {result.results.find((item) => item.questionId === question.id)
                ?.isCorrect
                ? "Correct. "
                : "Not quite. "}
              {
                result.results.find((item) => item.questionId === question.id)
                  ?.explanation
              }
            </p>
          ) : null}
        </fieldset>
      ))}
      {error ? <p className="form-error">{error}</p> : null}
      {result ? (
        <p className="quiz-player__score" role="status">
          Score: {result.score} / {result.total}
        </p>
      ) : (
        <button type="submit" className="btn btn--primary btn--lg">
          Check answers
        </button>
      )}
    </form>
  );
}
