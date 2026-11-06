"use client";

import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { survey } from '@/lib/data';

export function SurveyCard() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Respuesta Enviada",
            description: "Gracias por compartir tus sentimientos con nosotros.",
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Check-in Diario</CardTitle>
                <CardDescription>Un momento para reflexionar.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <p className="font-medium">{survey.question}</p>
                    <RadioGroup defaultValue={survey.options[2]} className="space-y-2">
                        {survey.options.map((option) => (
                             <div key={option} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`r-${option}`} />
                                <Label htmlFor={`r-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                    <Button type="submit" className="w-full">Enviar</Button>
                </form>
            </CardContent>
        </Card>
    );
}
