import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentExamService } from '../../../services/exam.service';
import { ExamCardComponent } from '../exam-card/exam-card.component';
import { StudentExam } from '../../../models/exam';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, ExamCardComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements OnInit {
  exams: StudentExam[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private studentExamService: StudentExamService) {}

  ngOnInit(): void {
    this.loadAvailableExams();
  }

  loadAvailableExams(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentExamService.getAvailableExams().subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response.status === 'success') {
          this.isLoading = false;

          this.exams = response.data.exams
            .filter((exam: any) => !exam.is_taken)
            .map((exam: any) => ({
              id: exam._id,
              title: exam.title,
              description: exam.description,
              duration: exam.duration,
              total_marks: exam.total_marks,
              major: exam.major,
              status: exam.status || 'upcoming',
              can_take: exam.can_take || false,
              is_taken: exam.is_taken || false,
              startDate: exam.start_date,
              endDate: exam.end_date,
              questions: exam.total_marks || 0,
              questions_count: exam.questions_count || 0,
            }));
        } else {
          this.errorMessage = 'Failed to load exams';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading exams:', error);
        this.errorMessage = error;
        this.exams = [];
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  onRetry(): void {
    this.loadAvailableExams();
  }
}
