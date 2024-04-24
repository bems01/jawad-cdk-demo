import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'create-post',
    loadComponent: () =>
      import('./create-post/create-post.component').then(
        (m) => m.CreatePostComponent
      ),
  },
];
