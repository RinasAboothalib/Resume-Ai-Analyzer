import { useState } from "react";
import { ResumeUploader } from "@/components/ResumeUploader";
import { AnalysisResults, AnalysisData } from "@/components/AnalysisResults";
import { toast } from "sonner";
import { FileSearch } from "lucide-react";

const Index = () => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (resumeText: string, targetRole: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://tijawxoqskcllxuyppnu.supabase.co/functions/v1/analyze-resume",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeText,
            targetRole,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to call Supabase function");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error analyzing resume");
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
          <h1 className="text-4xl md:text-5xl text-foreground mb-3">ResumeAi</h1>
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
