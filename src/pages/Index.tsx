import { useState } from "react";
import { ResumeUploader } from "@/components/ResumeUploader";
import { AnalysisResults, AnalysisData } from "@/components/AnalysisResults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileSearch } from "lucide-react";

const Index = () => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (resumeText: string, targetRole: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-resume", {
        body: { resumeText, targetRole },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAnalysis(data);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-16 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
            <FileSearch className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl text-foreground mb-3">Resume Analyzer</h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Upload your resume and get instant AI-powered feedback, skill analysis, and a professional score.
          </p>
        </div>

        {/* Content */}
        {analysis ? (
          <AnalysisResults data={analysis} onReset={() => setAnalysis(null)} />
        ) : (
          <ResumeUploader onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default Index;
