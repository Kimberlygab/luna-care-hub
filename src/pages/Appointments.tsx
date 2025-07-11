import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarPlus, Clock, User } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Appointment = Tables<'appointments'> & {
  patients: Tables<'patients'> | null;
};

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            patients (*)
          `)
          .eq('patients.user_id', user.id)
          .order('datetime', { ascending: true });

        if (error) throw error;
        setAppointments(data || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return { date: 'Data não definida', time: '--:--' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(appointment => {
      if (!appointment.datetime) return false;
      const appointmentDate = new Date(appointment.datetime).toISOString().split('T')[0];
      return appointmentDate === dateStr;
    });
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  const getTodayAppointments = () => {
    const today = new Date();
    return getAppointmentsForDate(today);
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter(appointment => appointment.datetime && new Date(appointment.datetime) > now)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Agendamento</h1>
          <p className="text-muted-foreground">
            Gerencie suas consultas e compromissos
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <CalendarPlus className="h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
              
              <div className="flex-1">
                <h3 className="font-semibold mb-4">
                  Consultas para {selectedDate.toLocaleDateString('pt-BR')}
                </h3>
                
                {selectedDateAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Nenhuma consulta agendada para este dia.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateAppointments.map((appointment) => {
                      const { time } = formatDateTime(appointment.datetime);
                      return (
                        <div
                          key={appointment.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                        >
                          <Clock className="h-4 w-4 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium">
                              {appointment.patients?.name || 'Paciente não identificado'}
                            </p>
                            <p className="text-sm text-muted-foreground">{time}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar with stats and upcoming */}
        <div className="space-y-6">
          {/* Today's appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              {getTodayAppointments().length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma consulta hoje.
                </p>
              ) : (
                <div className="space-y-2">
                  {getTodayAppointments().map((appointment) => {
                    const { time } = formatDateTime(appointment.datetime);
                    return (
                      <div key={appointment.id} className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3 text-primary" />
                        <span className="font-medium">{time}</span>
                        <span className="text-muted-foreground">
                          {appointment.patients?.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximas Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              {getUpcomingAppointments().length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma consulta agendada.
                </p>
              ) : (
                <div className="space-y-3">
                  {getUpcomingAppointments().map((appointment) => {
                    const { date, time } = formatDateTime(appointment.datetime);
                    return (
                      <div key={appointment.id} className="border-l-2 border-primary pl-3">
                        <p className="font-medium text-sm">
                          {appointment.patients?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {date} às {time}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de consultas</span>
                <span className="font-semibold">{appointments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hoje</span>
                <span className="font-semibold">{getTodayAppointments().length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Próximas</span>
                <span className="font-semibold">{getUpcomingAppointments().length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Appointments;