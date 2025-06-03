import { Routes } from '@angular/router';
import { ExamFormComponent } from './components/Admin/exam-form/exam-form.component';
import { ExamListComponent } from './components/Admin/exam-list/exam.component';
import { AccountComponent } from './components/account/account.component';
import { LoginComponent } from './components/account/login/login.component';
import { RegisterComponent } from './components/account/register/register.component';
import { StudentDashboardComponent } from './components/student/student-dashboard/student-dashboard.component';
import { StudentResultsComponent } from './components/student/student-results/student-results.component';
import { TakeExamComponent } from './components/student/take-exam/take-exam.component';
import { ProfileComponent } from './components/student/profile/profile.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { AdminLayoutComponent } from './layout/admin-component/admin-layout/admin-layout.component';
import { ViewExamComponent } from './components/Admin/view-exam/view-exam.component';
import { ExamQuestionManagerComponent } from './components/Admin/exam-question-manager/exam-question-manager.component';
import { StudentTableComponent } from './components/Admin/student-table/student-table.component';
import { StudentExamReviewComponent } from './components/student/student-exam-review/student-exam-review.component';
import { AuthGuard } from './auth.guard';
import { NotFoundComponent } from './shared/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'account',
    component: AccountComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
  { path: '', redirectTo: 'account', pathMatch: 'full' },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'examlist', pathMatch: 'full' },
      { path: 'examlist', component: ExamListComponent },
      { path: 'add-exam', component: ExamFormComponent },
      { path: 'edit-exam/:id', component: ExamFormComponent },
      { path: 'view-exam/:id', component: ViewExamComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'exam-questions/:id', component: ExamQuestionManagerComponent },
      { path: 'results', component: StudentTableComponent },
      {
        path: 'exam-results/:examId',
        component: StudentTableComponent,
      },
    ],
  },
  {
    path: 'student',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'exam/:id', component: TakeExamComponent },
      { path: 'results', component: StudentResultsComponent },
      {
        path: 'results/:examId',
        component: StudentExamReviewComponent,
      },
      { path: 'profile', component: ProfileComponent },
    ],
  },
  { path: '**', component: NotFoundComponent },
];
