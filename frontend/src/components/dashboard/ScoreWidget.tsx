import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ScoreWidgetProps {
  score: number;
  onViewHistory: () => void;
}

export const ScoreWidget = ({ score, onViewHistory }: ScoreWidgetProps) => {
  const scorePercentage = (score / 1000) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (scorePercentage / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-success';
    if (score >= 600) return 'text-warning';
    return 'text-error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 800) return 'Excelente';
    if (score >= 600) return 'Bom';
    return 'Regular';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-body-2">Seu Score de Crédito</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={getScoreColor(score)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-h3 font-bold ${getScoreColor(score)}`}>
                {score}
              </span>
              <span className="text-body-4 text-muted-foreground">
                {getScoreLabel(score)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-body-3 text-muted-foreground">
            Seu score está acima da média nacional
          </p>
          <div className="flex items-center justify-center gap-1 text-success">
            <TrendingUp className="h-4 w-4" />
            <span className="text-body-4">+12 pontos este mês</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={onViewHistory}>
            Ver histórico de crédito
          </Button>
          <Button variant="link" className="w-full text-body-4">
            Como melhorar meu score?
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
