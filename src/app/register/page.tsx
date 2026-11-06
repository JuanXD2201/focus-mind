
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
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'Dirección de correo electrónico no válida.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

export default function RegisterPage() {
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await register(values.name, values.email, values.password, 'user');
      // Las cuentas nuevas siempre son 'user'; los roles elevados los asigna un admin (ver firestore.rules).
       // La redirección se maneja en el contexto de autenticación
    } catch (error) {
       // El toast de error se maneja en el contexto de autenticación
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
          <CardTitle className="text-2xl font-headline">Crear una Cuenta</CardTitle>
          <CardDescription>Comienza tu viaje hacia la productividad serena hoy.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="nombre@ejemplo.com" {...field} />
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creando Cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-sm">
          <p className="w-full text-center text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
