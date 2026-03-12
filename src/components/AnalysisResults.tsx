import { ScoreGauge } from "./ScoreGauge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Lightbulb, Target, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Skill {
  name: string;
  category: "technical" | "soft" | "domain";
}

interface MissingSkill {
  name: string;
  importance: "critical" | "recommended" | "nice-to-have";
}

export interface AnalysisData {
  score: number;
  summary: string;
  identifiedSkills: Skill[];
  missingSkills: MissingSkill[];
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

interface AnalysisResultsProps {
  data: AnalysisData;
  onReset: () => void;
}

const importanceColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  recommended: "bg-accent/10 text-accent-foreground border-accent/20",
  "nice-to-have": "bg-muted text-muted-foreground border-border",
};

const categoryColors: Record<string, string> = {
  technical: "bg-primary/10 text-primary border-primary/20",
  soft: "bg-accent/10 text-accent-foreground border-accent/20",
  domain: "bg-success/10 text-success border-success/20",
};

export function AnalysisResults({ data, onReset }: AnalysisResultsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Button variant="ghost" onClick={onReset} className="gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Analyze another resume
      </Button>

      {/* Score + Summary */}
      <Card className="p-8 flex flex-col md:flex-row items-center gap-8">
        <ScoreGauge score={data.score} />
        <div className="flex-1">
          <h2 className="text-2xl mb-2 text-foreground">Resume Analysis</h2>
          <p className="text-muted-foreground leading-relaxed">{data.summary}</p>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Identified Skills */}
        <Card className="p-6">
          <h3 className="text-lg mb-4 flex items-center gap-2 text-foreground">
            <Target className="h-5 w-5 text-accent" /> Identified Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.identifiedSkills.map((skill, i) => (
              <Badge key={i} variant="outline" className={categoryColors[skill.category]}>
                {skill.name}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Missing Skills */}
        <Card className="p-6">
          <h3 className="text-lg mb-4 flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-5 w-5 text-accent" /> Missing Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.missingSkills.map((skill, i) => (
              <Badge key={i} variant="outline" className={importanceColors[skill.importance]}>
                {skill.name}
                <span className="ml-1 opacity-60 text-xs">({skill.importance})</span>
              </Badge>
            ))}
          </div>
        </Card>

        {/* Strengths */}
        <Card className="p-6">
          <h3 className="text-lg mb-4 flex items-center gap-2 text-foreground">
            <CheckCircle className="h-5 w-5 text-success" /> Strengths
          </h3>
          <ul className="space-y-2">
            {data.strengths.map((s, i) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-success mt-0.5">✓</span> {s}
              </li>
            ))}
          </ul>
        </Card>

        {/* Weaknesses */}
        <Card className="p-6">
          <h3 className="text-lg mb-4 flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-5 w-5 text-destructive" /> Weaknesses
          </h3>
          <ul className="space-y-2">
            {data.weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-destructive mt-0.5">✗</span> {w}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Suggestions */}
      <Card className="p-6">
        <h3 className="text-lg mb-4 flex items-center gap-2 text-foreground">
          <Lightbulb className="h-5 w-5 text-accent" /> Improvement Suggestions
        </h3>
        <ol className="space-y-3">
          {data.suggestions.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-muted-foreground">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-semibold">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
