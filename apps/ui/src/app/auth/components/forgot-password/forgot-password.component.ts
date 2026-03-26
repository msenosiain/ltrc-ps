import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'ltrc-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  emailControl = new FormControl('', [Validators.required, Validators.email]);
  isLoading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.emailControl.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.forgotPassword(this.emailControl.value!).subscribe({
      next: () => {
        this.snackBar.open('Si el email está registrado, recibirás un enlace en unos minutos.', 'OK', { duration: 6000 });
        this.router.navigate(['/login']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Error al enviar el email. Intentá de nuevo.';
      },
    });
  }
}
