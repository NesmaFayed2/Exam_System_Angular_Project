export type ExamTrack = 'DotNet' | 'MEARN' | 'PYTHON';
export interface Choice {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  choices: Choice[];
  correctAnswer: string;
  score: number;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: number;
  track: ExamTrack; // Added track field
  questions: Question[];
}
