import { Component } from '@angular/core';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-client-layout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.css',
})
export class ClientLayout {

}
