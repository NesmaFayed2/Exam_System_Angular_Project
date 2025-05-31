import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';  // عدل المسار حسب مشروعك

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {

    const user = this.authService.getUserData();

    if (user && user.role === 'admin') {
      return true;  // يسمح بالدخول
    } else {
      // لو مش admin، يحول المستخدم لصفحة غير مصرح له أو صفحة أخرى
      this.router.navigate(['/account/login']);
      return false;
    }
  }
}
