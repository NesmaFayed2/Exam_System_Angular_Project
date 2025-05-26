import { ExamResult } from './../../../models/exam-result.model';
import { ResultService } from './../../../services/result.service';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-student-table',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './student-table.component.html',
  styleUrls: ['./student-table.component.css'],
})
export class StudentTableComponent implements OnInit, OnDestroy {
  results: ExamResult[] = []; // Array to hold the fetched exam results
  isLoading: boolean = true; // Flag to show/hide loading spinner
  errorMessage: string | null = null; // To display any error messages
  private resultsSubscription: Subscription | undefined; // To manage observable subscriptions

  constructor(private resultService: ResultService) {}

  ngOnInit(): void {
    this.loadStudentResults(); // Call the method to load data when the component initializes
  }

  ngOnDestroy(): void {
    // Unsubscribe from the observable to prevent memory leaks when the component is destroyed
    if (this.resultsSubscription) {
      this.resultsSubscription.unsubscribe();
    }
  }

  loadStudentResults(): void {
    this.isLoading = true; // Set loading to true before fetching
    this.errorMessage = null; // Clear any previous error messages

    this.resultsSubscription = this.resultService
      .getAllExamResults()
      .subscribe({
        next: (data: ExamResult[]) => {
          this.results = data; // Assign fetched data to the results array
          this.isLoading = false; // Set loading to false once data is received
        },
        error: (err) => {
          console.error('Error loading exam results:', err);
          this.errorMessage =
            'Failed to load student results. Please try again.'; // Display user-friendly error
          this.isLoading = false; // Stop loading even if there's an error
        },
      });
  }
}
