import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentExamReviewComponent } from './student-exam-review.component';

describe('StudentExamReviewComponent', () => {
  let component: StudentExamReviewComponent;
  let fixture: ComponentFixture<StudentExamReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentExamReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentExamReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
