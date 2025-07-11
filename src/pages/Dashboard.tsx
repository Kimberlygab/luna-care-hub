import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  TrendingUp,
  UserPlus,
  FileText,
  CalendarPlus
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data for charts
const adherenceData = [
  { day: 'Seg', percentage: 85 },
  { day: 'Ter', percentage: 92 },
  { day: 'Qua', percentage: 78 },
  { day: 'Qui', percentage: 88 },
  { day: 'Sex', percentage: 95 },
  { day: 'Sáb', percentage: 82 },
  { day: 'Dom', percentage: 90 },
];

const engagementData = [
  { name: 'Maria Silva', score: 95 },
  { name: 'João Santos', score: 88 },
  { name: 'Ana Costa', score: 82 },
  { name: 'Pedro Lima', score: 78 },
  { name: 'Carla Mendes', score: 75 },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activePatientsToday: 0,
    pendingMessages: 0,
    todayAppointments: 0,
    totalPatients: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Get total patients
        const { count: totalPatients } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Get today's appointments
        const today = new Date().toISOString().split('T')[0];
        const { count: todayAppointments } = await supabase
          .from('appointments')
          .select('*, patients!inner(*)', { count: 'exact', head: true })
          .eq('patients.user_id', user.id)
          .gte('datetime', `${today}T00:00:00`)
          .lt('datetime', `${today}T23:59:59`);

        // Get pending interactions (mock for now)
        const { count: pendingMessages } = await supabase
          .from('interactions')
          .select('*, patients!inner(*)', { count: 'exact', head: true })
          .eq('patients.user_id', user.id)
          .eq('direction', 'in')
          .gte('timestamp', `${today}T00:00:00`);

        setStats({
          activePatientsToday: Math.floor((totalPatients || 0) * 0.3), // Mock: 30% active
          pendingMessages: pendingMessages || 0,
          todayAppointments: todayAppointments || 0,
          totalPatients: totalPatients || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  const getUserName = () => {
    return user?.user_metadata?.name?.split(' ')[0] || 'Nutricionista';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">
          Hoje a {getUserName()} cuidou de {stats.activePatientsToday} pacientes para você! 🌟
        </h1>
        <p className="text-primary-foreground/90">
          Continue acompanhando o progresso dos seus pacientes e mantendo uma nutrição saudável.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos Hoje</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePatientsToday}</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação à semana passada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Pendentes</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingMessages}</div>
            <p className="text-xs text-muted-foreground">
              Responda para manter o engajamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Próxima às 14:00
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Adesão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              +5% este mês
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adherence Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Adesão Semanal</CardTitle>
            <CardDescription>
              Percentual de pacientes que seguiram o plano alimentar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                percentage: {
                  label: "Adesão %",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={adherenceData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Engagement Ranking */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes Mais Engajados</CardTitle>
            <CardDescription>
              Ranking baseado na interação e adesão ao tratamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                score: {
                  label: "Score",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Novo Paciente
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarPlus className="h-4 w-4" />
              Agendar Consulta
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Gerar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;