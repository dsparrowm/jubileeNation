import { toast } from "sonner";

export function showActionToast(message: string, description?: string) {
  toast.success(message, { description });
}

export function showErrorToast(message: string) {
  toast.error(message);
}
