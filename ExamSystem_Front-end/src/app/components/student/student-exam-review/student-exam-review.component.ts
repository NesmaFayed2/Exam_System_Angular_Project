import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentExamService } from '../../../services/exam.service';

@Component({
  selector: 'app-student-exam-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-exam-review.component.html',
  styleUrls: ['./student-exam-review.component.css'],
})
export class StudentExamReviewComponent implements OnInit {
  examId!: string;
  result: any = null;
  isLoading = false;
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
    this.loadResult();
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
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error;
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/student/results']);
  }
}
