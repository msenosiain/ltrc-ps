import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../auth.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ltrc-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    pass: new FormControl('', [Validators.required]),
  });

  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const { email, pass } = this.loginForm.value;
      this.authService.login(email!, pass!).subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          this.router.navigateByUrl(returnUrl ?? '/dashboard');
        },
        error: (err) => {
          this.isLoading = false;
          if (
            err.status === 403 &&
            err.error?.code === 'ACCOUNT_PENDING_ACTIVATION'
          ) {
            this.router.navigate(['/auth/activate'], {
              queryParams: { email },
            });
            return;
          }
          this.errorMessage = 'Credenciales inválidas o error de conexión';
          console.error(err);
        },
      });
    }
  }

  loginWithGoogle() {
    this.isLoading = true;
    this.authService.loginWithGoogle();
  }
}
