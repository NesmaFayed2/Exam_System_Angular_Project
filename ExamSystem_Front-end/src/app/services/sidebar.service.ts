import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarVisible = new BehaviorSubject<boolean>(true);
  sidebarVisible$ = this.sidebarVisible.asObservable();

  hide() {
    this.sidebarVisible.next(false);
  }

  show() {
    this.sidebarVisible.next(true);
  }

  toggle() {
    this.sidebarVisible.next(!this.sidebarVisible.getValue());
  }
}
