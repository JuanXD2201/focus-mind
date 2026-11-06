import { useToast } from "@/hooks/use-toast";

// Este hook intermedio evita que el AuthContext, que se ejecuta en el servidor,
// dependa directamente de 'use-toast', que es un client component.
export function useAuthToast() {
  const { toast } = useToast();

  const showSuccessToast = (title: string, description: string) => {
    toast({ title, description });
  };

  const showErrorToast = (title: string, description: string) => {
    toast({
      variant: "destructive",
      title,
      description,
    });
  };

  return { showSuccessToast, showErrorToast };
}
