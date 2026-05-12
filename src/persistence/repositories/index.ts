import { Appointment, Event, Payment, Supplier, Task, User } from '../../domain/models';

export interface Repository<T> {
  getById(id: string): Promise<T | null>;
  list(): Promise<T[]>;
  create(data: T): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}

export interface UserRepository extends Repository<User> {}
export interface EventRepository extends Repository<Event> {}
export interface SupplierRepository extends Repository<Supplier> {}
export interface PaymentRepository extends Repository<Payment> {}
export interface TaskRepository extends Repository<Task> {}
export interface AppointmentRepository extends Repository<Appointment> {}
