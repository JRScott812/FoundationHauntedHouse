export interface Group {
  number: number;
  name: string;
  size: number;
  phone: string | null;
  notifyByText: boolean;
  registrationTime: number;
  cancelled?: boolean;
  cancellationTime?: number;
  entryTime?: number;
}

export type NewGroupInput = Pick<Group, "name" | "size" | "phone" | "notifyByText">;

export interface QueueState {
  queue: Group[];
  queueHistory: Group[];
  nextRegistrationNumber: number;
}
