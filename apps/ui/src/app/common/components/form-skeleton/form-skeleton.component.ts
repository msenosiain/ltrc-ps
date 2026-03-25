import { Component, Input } from '@angular/core';

@Component({
  selector: 'ltrc-form-skeleton',
  standalone: true,
  templateUrl: './form-skeleton.component.html',
  styleUrl: './form-skeleton.component.scss',
})
export class FormSkeletonComponent {
  @Input() rows = 6;

  get rowArray(): number[] {
    return Array.from({ length: this.rows });
  }
}
