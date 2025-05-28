import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentExamService } from '../../../services/exam.service';

@Component({
  selector: 'app-student-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-results.component.html',
  styleUrls: ['./student-results.component.css'],
})
export class StudentResultsComponent implements OnInit {
  results: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private studentExamService: StudentExamService) {}

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.studentExamService.getAllResults().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.results = response.data.results;
          this.isLoading = false;
        } else {
          this.errorMessage = 'Failed to load results.';
          this.isLoading = false;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error;
        this.isLoading = false;
      },
    });
  }
  trackByResult(index: number, result: any): string {
    return result._id;
  }

  getResultClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 50) return 'good';
    return 'poor';
  }
}
