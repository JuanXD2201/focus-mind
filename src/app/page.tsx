import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Headphones, Gamepad2, BookHeart, Quote } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
            <span className="font-bold hidden sm:inline-block">Focus Mind</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeToggle />
            <Button asChild variant="ghost">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative py-20 md:py-32 lg:py-40 overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background -z-10"></div>
           <div className="container grid gap-8 md:grid-cols-2 items-center">
                <div className="space-y-4 text-center md:text-left">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none font-headline">
                      Encuentra tu Foco, Cultiva tu Calma
                    </h1>
                    <p className="max-w-[600px] mx-auto md:mx-0 text-muted-foreground md:text-xl">
                      Focus Mind es tu santuario personal para la claridad mental y el bienestar.
                      Descubre herramientas y actividades diseñadas para reducir el estrés, mejorar la concentración y fomentar una mentalidad positiva.
                    </p>
                    <div className="mt-6">
                      <Button asChild size="lg" className="shadow-lg shadow-primary/20 hover:shadow-xl transition-shadow">
                        <Link href="/register">Únete a nuestra comunidad</Link>
                      </Button>
                    </div>
                </div>
                 <div className="flex justify-center order-first md:order-last">
                    <Image 
                        src="https://picsum.photos/600/400"
                        width={600}
                        height={400}
                        alt="Persona meditando en un ambiente tranquilo"
                        data-ai-hint="calm lake"
                        className="rounded-xl shadow-2xl w-full max-w-md md:max-w-full"
                        priority
                    />
                </div>
          </div>
        </section>
        
        <section className="py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Un Espacio Lleno de Posibilidades</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                Explora una variedad de herramientas interactivas para tu bienestar mental y emocional.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                       <Headphones className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-xl">Meditación Guiada</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Crea meditaciones personalizadas con IA o relájate con sonidos de la naturaleza.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                 <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                       <Gamepad2 className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-xl">Juegos Relajantes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Desafía tu mente con juegos de memoria, puzzles y actividades creativas.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                 <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                       <BookHeart className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-xl">Diario y Reflexión</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Cultiva la gratitud y organiza tus pensamientos con nuestro diario personal.
                  </p>
                </CardContent>
              </Card>
            </div>
             <div className="text-center mt-12">
                 <Button asChild variant="outline">
                    <Link href="/activities">Explora todas las actividades</Link>
                 </Button>
            </div>
          </div>
        </section>

         <section className="py-12 md:py-24 lg:py-32">
          <div className="container">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Lo que nuestra comunidad dice</h2>
                 <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                    Historias de calma y claridad de personas como tú.
                </p>
            </div>
             <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                 <Card className="flex flex-col hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 flex-grow">
                        <Quote className="w-8 h-8 text-primary mb-4" />
                        <p className="text-muted-foreground mb-4">&ldquo;Focus Mind se ha convertido en mi pequeño oasis digital. Los ejercicios de respiración me ayudan a centrarme antes de empezar el día.&rdquo;</p>
                    </CardContent>
                    <CardHeader className="pt-0">
                         <div className="flex items-center gap-3">
                            <Image src="https://picsum.photos/100/100" width={40} height={40} className="rounded-full" alt="Foto de Ana" data-ai-hint="woman portrait" />
                             <div>
                                <CardTitle className="text-base">Ana G.</CardTitle>
                                <p className="text-sm text-muted-foreground">Diseñadora Gráfica</p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
                <Card className="flex flex-col hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 flex-grow">
                        <Quote className="w-8 h-8 text-primary mb-4" />
                        <p className="text-muted-foreground mb-4">&ldquo;Me encanta el generador de cuentos. Es una forma creativa y relajante de desconectar por la noche. Una herramienta maravillosa y sin costo.&rdquo;</p>
                    </CardContent>
                     <CardHeader className="pt-0">
                        <div className="flex items-center gap-3">
                            <Image src="https://picsum.photos/101/101" width={40} height={40} className="rounded-full" alt="Foto de Carlos" data-ai-hint="man portrait"/>
                             <div>
                                <CardTitle className="text-base">Carlos M.</CardTitle>
                                <p className="text-sm text-muted-foreground">Estudiante</p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
                 <Card className="flex flex-col hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 flex-grow">
                        <Quote className="w-8 h-8 text-primary mb-4" />
                        <p className="text-muted-foreground mb-4">&ldquo;El rastreador de hábitos es simple pero muy efectivo. Me ha ayudado a ser más consistente con mis rutinas de bienestar. ¡Gracias por crear esto!&rdquo;</p>
                    </CardContent>
                     <CardHeader className="pt-0">
                        <div className="flex items-center gap-3">
                            <Image src="https://picsum.photos/102/102" width={40} height={40} className="rounded-full" alt="Foto de Sofía" data-ai-hint="woman smiling"/>
                             <div>
                                <CardTitle className="text-base">Sofía L.</CardTitle>
                                <p className="text-sm text-muted-foreground">Profesora</p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-secondary/50">
        <div className="container py-8 text-center">
           <div className="mb-4">
                <Logo />
           </div>
           <p className="max-w-md mx-auto text-muted-foreground">
             Focus Mind es un proyecto sin fines de lucro dedicado a ofrecer herramientas accesibles para el bienestar mental.
           </p>
           <p className="mt-6 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Focus Mind. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
