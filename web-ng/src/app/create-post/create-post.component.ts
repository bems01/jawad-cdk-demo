import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Post } from '../models/post';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
  ],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.scss',
})
export class CreatePostComponent {
  postFormGroup: FormGroup;
  posts: Post[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.postFormGroup = this.formBuilder.group({
      postTitle: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
      ]),
      postBody: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.postFormGroup.valid) {
      this.http
        .post<Post>(`${environment.apiUrl}api/post`, this.postFormGroup.value)
        .subscribe(
          (response) => {
            this.router.navigate(['/'], {});
          },
          (error) => {
            console.error('error creating post');
          }
        );
    }
  }
}
