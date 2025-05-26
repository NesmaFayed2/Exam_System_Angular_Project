// src/app/services/result.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'; // 'of' is used for creating an observable from mock data
// import { HttpClient } from '@angular/common/http'; // Uncomment if using HttpClient
import { ExamResult } from '../models/exam-result.model';

@Injectable({
  providedIn: 'root',
})
export class ResultService {
  private mockResults: ExamResult[] = [
    {
      id: 'res001',
      studentName: 'Alice Johnson',
      examTitle: 'Introduction to Programming',
      totalScore: 85,
      submittedAt: new Date('2024-03-10T10:00:00Z'), // Use ISO 8601 format for dates
    },
    {
      id: 'res002',
      studentName: 'Bob Smith',
      examTitle: 'Data Structures Exam',
      totalScore: 72,
      submittedAt: new Date('2024-03-12T14:30:00Z'),
    },
    {
      id: 'res003',
      studentName: 'Alice Johnson',
      examTitle: 'Data Structures Exam',
      totalScore: 91,
      submittedAt: new Date('2024-03-12T15:15:00Z'),
    },
    {
      id: 'res004',
      studentName: 'Charlie Brown',
      examTitle: 'Introduction to Programming',
      totalScore: 68,
      submittedAt: new Date('2024-03-10T11:00:00Z'),
    },
    {
      id: 'res005',
      studentName: 'Bob Smith',
      examTitle: 'Web Development Basics',
      totalScore: 79,
      submittedAt: new Date('2024-03-15T09:00:00Z'),
    },
    {
      id: 'res006',
      studentName: 'David Lee',
      examTitle: 'Database Management',
      totalScore: 95,
      submittedAt: new Date('2024-03-18T16:00:00Z'),
    },
    {
      id: 'res007',
      studentName: 'Eve Davis',
      examTitle: 'Database Management',
      totalScore: 88,
      submittedAt: new Date('2024-03-18T17:20:00Z'),
    },
  ];

  getAllExamResults(): Observable<ExamResult[]> {
    // Simulate API call with a delay
    return of(this.mockResults); // In a real app: return this.http.get<ExamResult[]>('/api/exam-results');
  }
}
