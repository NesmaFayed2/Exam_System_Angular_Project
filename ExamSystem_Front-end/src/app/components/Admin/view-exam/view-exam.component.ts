import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { ExamService } from './../../../services/exam.service'; // Adjust path
import { Exam, Question } from './../../../models/exam';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-exam',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe], // Add RouterLink for back button, DatePipe for formatting
  templateUrl: './view-exam.component.html',
  styleUrls: ['./view-exam.component.css'],
})
export class ViewExamComponent implements OnInit, OnDestroy {
  exam: Exam | undefined; // This will hold the fetched exam details
  private examId: number | null = null;
  private examSubscription: Subscription | undefined;
  public String = String;
  constructor(
    private route: ActivatedRoute,
    private router: Router, // Inject Router for navigation
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.examId = Number(params.get('id'));

      if (this.examId && !isNaN(this.examId) && this.examId > 0) {
        this.examSubscription = this.examService
          .getById(this.examId)
          .subscribe({
            next: (fetchedExam: Exam | undefined) => {
              if (fetchedExam) {
                this.exam = fetchedExam;
                console.log('Exam details loaded:', this.exam);
              } else {
                console.warn(`Exam with ID ${this.examId} not found.`);

                this.router.navigate(['/admin/examlist']);
              }
            },
            error: (err) => {
              console.error('Error fetching exam details:', err);

              this.router.navigate(['/admin/examlist']);
            },
          });
      } else {
        console.error('No valid exam ID provided in route.');
        this.router.navigate(['/admin/examlist']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/examlist']);
  }

  ngOnDestroy(): void {
    if (this.examSubscription) {
      this.examSubscription.unsubscribe();
    }
  }
}
