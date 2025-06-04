// src/app/models/exam-result.model.ts
export interface ExamResult {
  id: string;
  studentName: string;
  examTitle: string;
  totalScore: number;
  submittedAt: Date;
  studentEmail?: string;
  maxMarks?: number;
  percentage?: number;
  status?: string;
}
