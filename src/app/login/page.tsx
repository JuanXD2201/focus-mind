
"use client";

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const formSchema = z.object({
  email: z.string().email({ message: 'Dirección de correo electrónico no válida.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      // La redirección ahora es manejada por el AuthContext, 
      // pero mantenemos el estado de `isSubmitting` hasta que la navegación ocurra.
      // No es necesario cambiar isSubmitting a false aquí, ya que la página cambiará.
    } catch (error) {
      // Si el login falla, el toast de error se muestra desde el contexto
      // y volvemos a habilitar el botón.
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-md sm:max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Link href="/" aria-label="Home">
                <Logo />
            </Link>
          </div>
          <CardTitle className="text-2xl font-headline">Bienvenido de Nuevo</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="nombre@ejemplo.com" {...field} disabled={isSubmitting}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-sm">
          <p className="w-full text-center text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
