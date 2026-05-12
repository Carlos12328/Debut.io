export type EntityId = string;

export interface User {
  id: EntityId;
  name: string;
  email: string;
}

export interface Event {
  id: EntityId;
  title: string;
  date: string;
  budget: number;
}

export interface Supplier {
  id: EntityId;
  name: string;
  serviceType: string;
  contactEmail: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'overdue';

export interface Payment {
  id: EntityId;
  eventId: EntityId;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
}

export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: EntityId;
  title: string;
  status: TaskStatus;
  dueDate: string;
}

export interface Appointment {
  id: EntityId;
  title: string;
  startAt: string;
  endAt: string;
}

export interface ChangeLog {
  id: EntityId;
  entity: string;
  entityId: EntityId;
  changedAt: string;
  summary: string;
}
