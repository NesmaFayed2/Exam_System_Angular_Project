import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminExamService } from '../../../services/admin-exam.service'; // Updated import
import { Subscription } from 'rxjs';
import { LoadComponent } from '../../../shared/load/load.component';

@Component({
  selector: 'app-exam-form',
  standalone: true,
  imports: [LoadComponent, CommonModule, FormsModule, RouterLink],
  templateUrl: './exam-form.component.html',
  styleUrls: ['./exam-form.component.css'],
})
export class ExamFormComponent implements OnInit, OnDestroy {
  availableTracks: string[] = ['mern', 'dotnet', 'python']; // Updated to match backend

  exam: any = {
    _id: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    track: 'mern',
    duration: 60,
    total_marks: 100,
    passing_marks: 50,
  };

  isEditMode: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  private routeSubscription: Subscription | undefined;
  private examSaveSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminExamService: AdminExamService // Updated service
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const examId = params.get('id'); // Now string, not number
      if (examId) {
        this.isEditMode = true;
        this.loadExam(examId);
      }
    });
  }

  private formatDateForDateTimeLocalInput(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are 0-indexed
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  loadExam(examId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminExamService.getExamById(examId).subscribe({
      next: (examData) => {
        if (examData) {
          // Map backend data to form format
          this.exam = {
            _id: examData._id,
            title: examData.title,
            description: examData.description,
            startDate: examData.start_date
              ? this.formatDateForDateTimeLocalInput(
                  new Date(examData.start_date)
                )
              : '',
            endDate: examData.end_date
              ? this.formatDateForDateTimeLocalInput(
                  new Date(examData.end_date)
                )
              : '',

            track: examData.major?.name || 'mern',
            duration: examData.duration,
            total_marks: examData.total_marks,
            passing_marks: examData.passing_marks,
          };
          console.log('Exam loaded for editing:', this.exam);
        } else {
          console.warn(`Exam with ID ${examId} not found. Redirecting.`);
          this.router.navigate(['/admin/examlist']);
        }
      },
      error: (err) => {
        console.error('Error fetching exam for edit:', err);
        this.errorMessage = err;
        this.router.navigate(['/admin/examlist']);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  saveExam(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Map form data to backend format
    const examData = {
      title: this.exam.title,
      description: this.exam.description,
      start_date: this.exam.startDate
        ? new Date(this.exam.startDate).toISOString()
        : null,
      end_date: this.exam.endDate
        ? new Date(this.exam.endDate).toISOString()
        : null,
      major: this.exam.track, // Backend expects major name
      duration: this.exam.duration,
      total_marks: this.exam.total_marks,
      passing_marks: this.exam.passing_marks,
    };

    const saveOperation = this.isEditMode
      ? this.adminExamService.updateExam(this.exam._id, examData)
      : this.adminExamService.createExam(examData);

    this.examSaveSubscription = saveOperation.subscribe({
      next: (response) => {
        console.log('Exam saved/updated successfully:', response);
        const savedExam = response.data?.exam || response;

        if (!this.isEditMode) {
          this.router.navigate(['/admin/exam-questions', savedExam._id]);
        } else {
          this.router.navigate(['/admin/examlist']);
        }
      },
      error: (err) => {
        console.error('Error saving exam:', err);
        this.errorMessage = err;
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
  goBack(): void {
    this.router.navigate(['/admin/examlist']);
  }
  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.examSaveSubscription?.unsubscribe();
  }
}
