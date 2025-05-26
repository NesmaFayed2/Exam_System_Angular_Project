// src/app/models/exam-result.model.ts
export interface ExamResult {
  id: string; // Unique ID for the result entry (e.g., result ID from DB)
  studentName: string;
  examTitle: string;
  totalScore: number;
  submittedAt: Date; // Date when the exam was submitted
}
