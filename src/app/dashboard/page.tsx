
"use client";

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { UserCalendar } from '@/components/user-calendar';
import { SurveyCard } from '@/components/survey-card';
import { useAuth } from '@/contexts/auth-context';
import { FocusList } from '@/components/focus-list';

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  return (
    <DashboardLayout>
        <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight font-headline">¡Bienvenido, {user?.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Este es tu espacio para concentrarte, crear y reflexionar.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1 space-y-8">
                <FocusList selectedDate={selectedDate} />
                <SurveyCard />
            </div>
            <div className="md:col-span-2">
                <UserCalendar 
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                />
            </div>
        </div>
    </DashboardLayout>
  );
}
