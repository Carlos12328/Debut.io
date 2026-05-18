import {
  EntityId,
  Evento,
  Pagamento,
  Tarefa,
  StatusTarefa,
  Compromisso,
} from '../models';

export interface EventService {
  validateBudget(event: Evento): boolean;
}

export interface PaymentService {
  validatePayment(payment: Pagamento): boolean;
}

export interface TaskService {
  updateStatus(task: Tarefa, status: StatusTarefa): Tarefa;
}

export interface AppointmentService {
  reschedule(appointment: Compromisso, startAt: string, endAt: string): Compromisso;
}

export interface NotificationService {
  notify(eventId: EntityId, message: string): void;
}
