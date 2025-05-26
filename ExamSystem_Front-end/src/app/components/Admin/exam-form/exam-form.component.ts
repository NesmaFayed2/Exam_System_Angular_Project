import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Import Router
import { ExamService } from './../../../services/exam.service';
import { Exam, ExamTrack } from './../../../models/exam';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-exam-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './exam-form.component.html',
  styleUrls: ['./exam-form.component.css'],
})
export class ExamFormComponent implements OnInit, OnDestroy {
  availableTracks: ExamTrack[] = ['DotNet', 'MEARN', 'PYTHON'];
  exam: Exam = {
    id: 0,
    title: '',
    description: '',
    startDate: '', // Initialize new fields
    endDate: '',
    track: 'DotNet', // Initialize new fields
    duration: 60,
    questions: [], // Initialize with an empty questions array
  };
  isEditMode: boolean = false;
  private routeSubscription: Subscription | undefined;
  private examSaveSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Inject Router
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const examId = Number(params.get('id'));
      if (examId && !isNaN(examId) && examId > 0) {
        this.isEditMode = true;
        this.examService.getById(examId).subscribe({
          next: (examData) => {
            if (examData) {
              this.exam = JSON.parse(JSON.stringify(examData));
              this.exam.track = this.exam.track || 'DotNet';
              if (this.exam.startDate) {
                this.exam.startDate = new Date(this.exam.startDate)
                  .toISOString()
                  .split('T')[0];
              }
              if (this.exam.endDate) {
                this.exam.endDate = new Date(this.exam.endDate)
                  .toISOString()
                  .split('T')[0];
              }
            } else {
              console.warn(`Exam with ID ${examId} not found. Redirecting.`);
              this.router.navigate(['/admin/examlist']);
            }
          },
          error: (err) => {
            console.error('Error fetching exam for edit:', err);
            this.router.navigate(['/admin/examlist']);
          },
        });
      }
    });
  }

  saveExam(): void {
    this.examSaveSubscription = this.examService.save(this.exam).subscribe({
      next: (savedExam) => {
        console.log('Exam saved/updated successfully:', savedExam);
        if (!this.isEditMode) {
          // If a new exam was added, navigate to the questions page for it
          this.router.navigate(['/admin/exam-questions', savedExam.id]);
        } else {
          // If edited, go back to the exam list or view details
          this.router.navigate(['/admin/examlist']);
        }
      },
      error: (err) => {
        console.error('Error saving exam:', err);
        // Handle error, show message to user
      },
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.examSaveSubscription?.unsubscribe();
  }
}
