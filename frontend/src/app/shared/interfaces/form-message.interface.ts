export enum MessageType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}
export interface FormMessage {
    type:MessageType,
    message:string
}