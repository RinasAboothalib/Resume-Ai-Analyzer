import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ResumeUploaderProps {
  onAnalyze: (text: string, targetRole: string) => void;
  isLoading: boolean;
}

export function ResumeUploader({ onAnalyze, isLoading }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const extractText = useCallback(async (pdfFile: File): Promise<string> => {
    // Use pdf.js from CDN
    const pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/+esm" as any);
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs";
    
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text;
  }, []);

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!file) return;
    try {
      const text = await extractText(file);
      if (text.trim().length < 50) {
        toast.error("Could not extract enough text from the PDF. Try a different file.");
        return;
      }
      onAnalyze(text, targetRole);
    } catch {
      toast.error("Failed to read PDF. Make sure it's a text-based PDF.");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
          dragOver
            ? "border-accent bg-accent/5 scale-[1.02]"
            : file
            ? "border-accent/50 bg-accent/5"
            : "border-border hover:border-accent/40 hover:bg-muted/50"
        }`}
        onClick={() => !file && document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-accent" />
            <div className="text-left">
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="ml-4 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground mb-1">Drop your resume here</p>
            <p className="text-sm text-muted-foreground">or click to browse · PDF only · Max 10MB</p>
          </>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Target Job Role (optional)</label>
        <Input
          placeholder="e.g. Senior Frontend Engineer, Data Scientist..."
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="bg-card"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!file || isLoading}
        className="w-full h-12 text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isLoading ? "Analyzing..." : "Analyze Resume"}
      </Button>
    </div>
  );
}
