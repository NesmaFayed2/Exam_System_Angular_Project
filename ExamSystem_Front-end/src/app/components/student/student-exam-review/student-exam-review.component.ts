import { LoadComponent } from './../../../shared/load/load.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentExamService } from '../../../services/exam.service';

@Component({
  selector: 'app-student-exam-review',
  standalone: true,
  imports: [LoadComponent,CommonModule],
  templateUrl: './student-exam-review.component.html',
  styleUrls: ['./student-exam-review.component.css'],
})
export class StudentExamReviewComponent implements OnInit {
  examId!: string;
  result: any = null;
  isLoading = false;
  progress = 0;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentExamService: StudentExamService
  ) {}

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('examId')!;
    if (!this.examId) {
      this.router.navigate(['/student/results']);
      return;
    }
    this.simulateProgress();
    this.loadResult();
  }

  simulateProgress(): void {
    const interval = setInterval(() => {
      if (this.progress < 90) this.progress += 10;
    }, 200);
    setTimeout(() => clearInterval(interval), 2000);
  }

  loadResult(): void {
    this.isLoading = true;
    this.studentExamService.getExamResult(this.examId).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.result = response.data.result;
        } else {
          this.errorMessage = 'Failed to load exam result.';
        }
        this.progress = 100;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'An error occurred.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/student/results']);
  }
}
