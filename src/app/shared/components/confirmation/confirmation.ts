import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";


@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./confirmation.html",
  styleUrl: "./confirmation.css",
})
export class Confirmation {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed? This action cannot be undone.';
  @Input() confirmText = 'Delete';
  @Input() cancelText = 'Cancel';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}