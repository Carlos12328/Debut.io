import {
  Appointment,
  Event,
  Payment,
  Task,
  TaskStatus,
} from '../models';

export interface EventService {
  validateBudget(event: Event): boolean;
}

export interface PaymentService {
  validatePayment(payment: Payment): boolean;
}

export interface TaskService {
  updateStatus(task: Task, status: TaskStatus): Task;
}

export interface AppointmentService {
  reschedule(appointment: Appointment, startAt: string, endAt: string): Appointment;
}

export interface NotificationService {
  notify(eventId: string, message: string): void;
}
