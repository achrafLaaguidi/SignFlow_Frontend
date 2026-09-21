// src/app/modules/client/client.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ClientLayout } from './layouts/client-layout/client-layout';
import { DocumentList } from './pages/document-list/document-list';
import { DocumentSignature } from './pages/document-signature/document-signature';
import { UserManagement } from './pages/user-management/user-management';

const routes: Routes = [
  {
    path: '',
    component: ClientLayout,
    children: [
      { path: 'documents', component: DocumentList },
      { path: 'documents/:id/sign', component: DocumentSignature },
      { path: 'users', component: UserManagement },
      { path: '', redirectTo: 'documents', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [
    ClientLayout,
    DocumentList,
    DocumentSignature,
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class ClientModule { }