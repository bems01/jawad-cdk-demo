import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Post } from '../models/post';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  posts: Post[] = [];

  constructor(private http: HttpClient) {
    this.http
      .get<Post[]>(`${environment.apiUrl}api/post`)
      .subscribe((posts) => {
        this.posts = posts;
      });
  }
}
