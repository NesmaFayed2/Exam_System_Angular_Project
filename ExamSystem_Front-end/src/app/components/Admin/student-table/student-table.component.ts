import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ResultService } from '../../../services/result.service';
import { ExamResult } from '../../../models/exam-result.model';

@Component({
  selector: 'app-student-table',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './student-table.component.html',
  styleUrls: ['./student-table.component.css'],
})
export class StudentTableComponent implements OnInit, OnDestroy {
  results: ExamResult[] = []; // Results for the specific exam
  isLoading: boolean = true;
  errorMessage: string | null = null;
  examTitle: string = '';
  examId: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private resultService: ResultService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get examId from route parameters
    this.subscription.add(
      this.route.paramMap.subscribe((params) => {
        this.examId = params.get('examId');
        if (this.examId) {
          this.loadExamResults();
        } else {
          this.errorMessage = 'No exam ID provided';
          this.isLoading = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadExamResults(): void {
    if (!this.examId) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.subscription.add(
      this.resultService.getResultsForSpecificExam(this.examId).subscribe({
        next: (results: ExamResult[]) => {
          this.results = results;
          // Set exam title from the first result (all results are for the same exam)
          this.examTitle =
            results.length > 0 ? results[0].examTitle : 'Exam Results';
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading exam results:', error);
          this.errorMessage =
            error.message || 'Failed to load exam results. Please try again.';
          this.isLoading = false;
          this.results = [];
        },
      })
    );
  }

  goBack(): void {
    this.router.navigate(['/admin/examlist']);
  }

  refreshResults(): void {
    this.loadExamResults();
  }

  getPassedCount(): number {
    return this.results.filter(
      (result) =>
        result.status === 'Passed' ||
        (result.percentage && result.percentage >= 50)
    ).length;
  }

  getFailedCount(): number {
    return this.results.filter(
      (result) =>
        result.status === 'Failed' ||
        (result.percentage && result.percentage < 50)
    ).length;
  }

  getAverageScore(): number {
    if (this.results.length === 0) return 0;
    const total = this.results.reduce(
      (sum, result) => sum + (result.percentage || 0),
      0
    );
    return Math.round(total / this.results.length);
  }

  trackByResultId(index: number, result: ExamResult): string {
    return result.id;
  }
}
