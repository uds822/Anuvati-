import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

const REQUIRED_DOCUMENTS = [
  { type: "resume", label: "Updated CV / Resume", description: "Latest version of your resume" },
  { type: "graduation_marksheet", label: "Graduation Marksheet", description: "Degree/diploma marksheet" },
  { type: "aadhaar_card", label: "Aadhaar Card", description: "Government-issued Aadhaar card copy" },
  { type: "pan_card", label: "PAN Card", description: "Permanent Account Number card" },
  { type: "bank_passbook", label: "Bank Passbook / Cancelled Cheque", description: "First page of passbook or cancelled cheque" },
  { type: "previous_salary_slip", label: "Previous Salary Slip", description: "Last 3 months salary slip (if applicable)" },
  { type: "experience_letter", label: "Experience / Relieving Letter", description: "From previous employer (if applicable)" },
  { type: "photo", label: "Passport Size Photo", description: "Recent passport-size photograph" },
];

interface CandidateInfo {
  id: string;
  full_name: string;
  email: string;
  onboarding_status: string;
  onboarding_token: string;
}

const CandidateOnboarding = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { path: string; name: string }>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!token) { setInvalid(true); setLoading(false); return; }
      
      const { data, error } = await supabase
        .from("hr_candidates")
        .select("id, full_name, email, onboarding_status, onboarding_token")
        .eq("onboarding_token", token)
        .maybeSingle();

      if (error || !data) {
        setInvalid(true);
      } else {
        setCandidate(data as CandidateInfo);
        if (data.onboarding_status === "documents_submitted") {
          setSubmitted(true);
        }
        // Fetch already uploaded docs
        const { data: docs } = await supabase
          .from("candidate_documents")
          .select("document_type, file_path, title")
          .eq("candidate_id", data.id);
        if (docs) {
          const map: Record<string, { path: string; name: string }> = {};
          docs.forEach((d: any) => { map[d.document_type] = { path: d.file_path, name: d.title }; });
          setUploadedDocs(map);
        }
      }
      setLoading(false);
    };
    fetchCandidate();
  }, [token]);

  const handleFileUpload = async (docType: string, file: File) => {
    if (!candidate) return;
    setUploading(docType);
    try {
      const path = `onboarding/${candidate.id}/${docType}_${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from("candidate-documents").upload(path, file);
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from("candidate-documents").getPublicUrl(path);

      // Delete old doc if exists
      if (uploadedDocs[docType]) {
        await supabase.from("candidate_documents").delete().eq("candidate_id", candidate.id).eq("document_type", docType);
      }

      const { error } = await supabase.from("candidate_documents").insert({
        candidate_id: candidate.id,
        document_type: docType,
        title: file.name,
        file_path: urlData.publicUrl,
        file_size: file.size,
      });
      if (error) throw error;

      setUploadedDocs((prev) => ({ ...prev, [docType]: { path: urlData.publicUrl, name: file.name } }));
      toast({ title: "Uploaded", description: `${file.name} uploaded successfully.` });
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const handleFinalSubmit = async () => {
    if (!candidate) return;
    const requiredTypes = ["resume", "aadhaar_card", "pan_card", "photo"];
    const missing = requiredTypes.filter((t) => !uploadedDocs[t]);
    if (missing.length > 0) {
      toast({
        title: "Missing Documents",
        description: `Please upload: ${missing.map((m) => REQUIRED_DOCUMENTS.find((d) => d.type === m)?.label).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    await supabase
      .from("hr_candidates")
      .update({ onboarding_status: "documents_submitted" })
      .eq("id", candidate.id);

    setSubmitted(true);
    toast({ title: "Documents Submitted!", description: "HR will review your documents and proceed with onboarding." });
  };

  if (loading) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-64 mx-auto" />
              <div className="h-4 bg-muted rounded w-96 mx-auto" />
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (invalid || !candidate) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container max-w-lg text-center">
            <AlertCircle className="mx-auto text-destructive mb-4" size={48} />
            <h1 className="font-heading font-bold text-2xl text-foreground mb-2">Invalid or Expired Link</h1>
            <p className="font-body text-muted-foreground">
              This onboarding link is not valid. Please contact HR at hr@anuvati.org for assistance.
            </p>
          </div>
        </section>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container max-w-lg text-center">
            <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
            <h1 className="font-heading font-bold text-2xl text-foreground mb-2">Documents Submitted!</h1>
            <p className="font-body text-muted-foreground">
              Thank you, <strong>{candidate.full_name}</strong>. Your onboarding documents have been submitted successfully. Our HR team will review and reach out with next steps.
            </p>
          </div>
        </section>
      </Layout>
    );
  }

  const uploadCount = Object.keys(uploadedDocs).length;

  return (
    <Layout>
      <section className="py-20 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <p className="font-heading text-secondary font-semibold text-xs uppercase tracking-[0.2em] mb-3">Onboarding</p>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            Welcome, {candidate.full_name}!
          </h1>
          <p className="font-body text-muted-foreground text-lg max-w-2xl">
            Congratulations on being selected! Please upload the following documents to complete your onboarding process.
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <p className="font-heading font-semibold text-foreground">
              Documents Uploaded: {uploadCount} / {REQUIRED_DOCUMENTS.length}
            </p>
            <Badge variant={uploadCount >= 4 ? "default" : "secondary"}>
              {uploadCount >= 4 ? "Ready to Submit" : "Upload Required"}
            </Badge>
          </div>

          <div className="space-y-4">
            {REQUIRED_DOCUMENTS.map((doc) => {
              const uploaded = uploadedDocs[doc.type];
              const isUploading = uploading === doc.type;
              const isRequired = ["resume", "aadhaar_card", "pan_card", "photo"].includes(doc.type);

              return (
                <Card key={doc.type} className={uploaded ? "border-green-200 bg-green-50/30" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {uploaded ? (
                            <CheckCircle size={18} className="text-green-600 shrink-0" />
                          ) : (
                            <FileText size={18} className="text-muted-foreground shrink-0" />
                          )}
                          <div>
                            <p className="font-heading font-semibold text-sm text-foreground">
                              {doc.label}
                              {isRequired && <span className="text-destructive ml-1">*</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">{doc.description}</p>
                            {uploaded && (
                              <p className="text-xs text-green-700 mt-1">✓ {uploaded.name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`file-${doc.type}`} className="cursor-pointer">
                          <div className={`px-3 py-1.5 rounded-md text-xs font-heading font-semibold border transition-colors ${
                            uploaded 
                              ? "border-green-300 text-green-700 hover:bg-green-100" 
                              : "border-primary/30 text-primary hover:bg-primary/5"
                          }`}>
                            {isUploading ? "Uploading..." : uploaded ? "Replace" : "Upload"}
                          </div>
                        </Label>
                        <Input
                          id={`file-${doc.type}`}
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="hidden"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(doc.type, file);
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground mb-4">
              Fields marked with <span className="text-destructive">*</span> are mandatory. Other documents are optional but recommended.
            </p>
            <Button
              onClick={handleFinalSubmit}
              size="lg"
              className="font-heading font-semibold gap-2"
              disabled={Object.keys(uploadedDocs).length < 4}
            >
              <Upload size={16} /> Submit All Documents
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CandidateOnboarding;
