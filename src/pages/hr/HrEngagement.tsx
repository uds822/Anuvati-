import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useHrRole } from "@/hooks/useHrRole";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, BarChart3, MessageSquare, Star, ThumbsUp, Users } from "lucide-react";

interface Survey {
  id: string;
  title: string;
  description: string | null;
  survey_type: string;
  is_anonymous: boolean;
  is_active: boolean;
  questions: any[];
  created_at: string;
  closes_at: string | null;
}

interface SurveyResponse {
  id: string;
  survey_id: string;
  answers: Record<string, any>;
  satisfaction_score: number | null;
  submitted_at: string;
  hr_surveys?: { title: string };
}

const HrEngagement = () => {
  const { user } = useAuth();
  const { isHrAdmin } = useHrRole();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [respondOpen, setRespondOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [satisfactionScore, setSatisfactionScore] = useState("3");

  // Create survey form
  const [form, setForm] = useState({
    title: "", description: "", survey_type: "pulse", is_anonymous: true,
    questions: [{ id: "q1", text: "", type: "rating" }],
  });

  const fetchData = async () => {
    setLoading(true);
    const [{ data: s }, { data: r }] = await Promise.all([
      supabase.from("hr_surveys").select("*").order("created_at", { ascending: false }),
      supabase.from("hr_survey_responses").select("*, hr_surveys(title)").order("submitted_at", { ascending: false }),
    ]);
    setSurveys((s || []) as any);
    setResponses((r || []) as any);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateSurvey = async () => {
    const { error } = await supabase.from("hr_surveys").insert({
      title: form.title,
      description: form.description || null,
      survey_type: form.survey_type,
      is_anonymous: form.is_anonymous,
      questions: form.questions.filter(q => q.text.trim()),
      created_by: user?.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Survey created");
    setCreateOpen(false);
    setForm({ title: "", description: "", survey_type: "pulse", is_anonymous: true, questions: [{ id: "q1", text: "", type: "rating" }] });
    fetchData();
  };

  const handleSubmitResponse = async () => {
    if (!selectedSurvey) return;
    const { error } = await supabase.from("hr_survey_responses").insert({
      survey_id: selectedSurvey.id,
      respondent_id: selectedSurvey.is_anonymous ? null : user?.id,
      answers,
      satisfaction_score: Number(satisfactionScore),
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Response submitted");
    setRespondOpen(false);
    setAnswers({});
    setSatisfactionScore("3");
    fetchData();
  };

  const addQuestion = () => {
    setForm({
      ...form,
      questions: [...form.questions, { id: `q${form.questions.length + 1}`, text: "", type: "rating" }],
    });
  };

  const updateQuestion = (idx: number, text: string) => {
    const qs = [...form.questions];
    qs[idx] = { ...qs[idx], text };
    setForm({ ...form, questions: qs });
  };

  // Stats
  const avgSatisfaction = responses.length > 0
    ? (responses.reduce((s, r) => s + (r.satisfaction_score || 0), 0) / responses.length).toFixed(1)
    : "0";
  const activeSurveys = surveys.filter(s => s.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Engagement</h1>
          <p className="text-muted-foreground">Pulse surveys, feedback, and satisfaction tracking</p>
        </div>
        {isHrAdmin() && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Create Survey</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Survey</DialogTitle></DialogHeader>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                <Input placeholder="Survey Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <Select value={form.survey_type} onValueChange={v => setForm({ ...form, survey_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pulse">Pulse Survey</SelectItem>
                    <SelectItem value="engagement">Engagement Survey</SelectItem>
                    <SelectItem value="feedback">Anonymous Feedback</SelectItem>
                    <SelectItem value="satisfaction">Satisfaction Survey</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm({ ...form, is_anonymous: e.target.checked })} />
                  <span className="text-sm">Anonymous responses</span>
                </div>
                <div className="space-y-2">
                  <Label>Questions</Label>
                  {form.questions.map((q, i) => (
                    <Input key={i} placeholder={`Question ${i + 1}`} value={q.text} onChange={e => updateQuestion(i, e.target.value)} />
                  ))}
                  <Button variant="outline" size="sm" onClick={addQuestion}>+ Add Question</Button>
                </div>
                <Button onClick={handleCreateSurvey} disabled={!form.title || !form.questions.some(q => q.text.trim())} className="w-full">Create Survey</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><BarChart3 className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{surveys.length}</p><p className="text-xs text-muted-foreground">Total Surveys</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><MessageSquare className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{activeSurveys}</p><p className="text-xs text-muted-foreground">Active Surveys</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Users className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{responses.length}</p><p className="text-xs text-muted-foreground">Total Responses</p></div></CardContent></Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Star className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{avgSatisfaction}/5</p>
              <p className="text-xs text-muted-foreground">Avg Satisfaction</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="surveys">
        <TabsList>
          <TabsTrigger value="surveys">Active Surveys</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="surveys">
          <div className="grid gap-4 md:grid-cols-2">
            {loading ? (
              <p className="text-muted-foreground py-8 col-span-2 text-center">Loading...</p>
            ) : surveys.filter(s => s.is_active).length === 0 ? (
              <p className="text-muted-foreground py-8 col-span-2 text-center">No active surveys</p>
            ) : surveys.filter(s => s.is_active).map(s => (
              <Card key={s.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{s.title}</CardTitle>
                    <Badge variant="outline">{s.survey_type}</Badge>
                  </div>
                  <CardDescription>{s.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {(s.questions as any[]).length} questions • {s.is_anonymous ? "Anonymous" : "Named"}
                    </span>
                    <Button size="sm" onClick={() => { setSelectedSurvey(s); setRespondOpen(true); }}>
                      <ThumbsUp className="h-3 w-3 mr-1" />Respond
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results">
          {isHrAdmin() ? (
            <div className="space-y-4">
              {surveys.map(survey => {
                const surveyResponses = responses.filter(r => r.survey_id === survey.id);
                const avgScore = surveyResponses.length > 0
                  ? (surveyResponses.reduce((s, r) => s + (r.satisfaction_score || 0), 0) / surveyResponses.length)
                  : 0;
                return (
                  <Card key={survey.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{survey.title}</CardTitle>
                      <CardDescription>{surveyResponses.length} responses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Avg satisfaction:</span>
                        <Progress value={avgScore * 20} className="flex-1 h-3" />
                        <span className="font-bold">{avgScore.toFixed(1)}/5</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Only HR administrators can view aggregated results</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Respond Dialog */}
      <Dialog open={respondOpen} onOpenChange={setRespondOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedSurvey?.title}</DialogTitle></DialogHeader>
          {selectedSurvey && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {selectedSurvey.is_anonymous && (
                <Badge variant="secondary">🔒 Your response is anonymous</Badge>
              )}
              {(selectedSurvey.questions as any[]).map((q: any, i: number) => (
                <div key={i} className="space-y-2">
                  <Label>{q.text}</Label>
                  <RadioGroup value={answers[q.id] || ""} onValueChange={v => setAnswers({ ...answers, [q.id]: v })}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className="flex items-center gap-2">
                        <RadioGroupItem value={String(n)} id={`${q.id}-${n}`} />
                        <Label htmlFor={`${q.id}-${n}`}>{n} — {["Poor", "Fair", "Good", "Very Good", "Excellent"][n - 1]}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              <div className="space-y-2">
                <Label>Overall Satisfaction (1-5)</Label>
                <Select value={satisfactionScore} onValueChange={setSatisfactionScore}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n} — {["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"][n - 1]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmitResponse} className="w-full">Submit Response</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HrEngagement;
