import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle, Circle, Upload, User, GraduationCap, Briefcase,
  Heart, CreditCard, FileText, AlertCircle, Loader2,
} from "lucide-react";
import { toast } from "sonner";

const requiredDocuments = [
  { key: "aadhaar", label: "Aadhaar Card", type: "id_proof" },
  { key: "pan", label: "PAN Card", type: "id_proof" },
  { key: "resume", label: "Resume / CV", type: "resume" },
  { key: "degree", label: "Degree Certificate(s)", type: "certificate" },
];

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const HrOnboarding = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState("personal");

  // Document uploads tracking
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  // Personal details form
  const [personalForm, setPersonalForm] = useState({
    phone: "", date_of_birth: "", gender: "", address: "", city: "", state: "", country: "India",
  });

  // Emergency contact
  const [emergencyForm, setEmergencyForm] = useState({
    contact_name: "", relationship: "", phone: "", address: "",
  });

  // Bank details
  const [bankForm, setBankForm] = useState({
    account_holder_name: "", bank_name: "", account_number: "", ifsc_code: "", branch_name: "",
  });

  // Medical info
  const [medicalForm, setMedicalForm] = useState({
    blood_group: "", allergies: "", medical_conditions: "",
  });

  // Education records
  const [educationList, setEducationList] = useState<any[]>([{ degree: "", institution: "", field_of_study: "", year_of_passing: "", grade_or_percentage: "" }]);

  // Previous employment
  const [employmentList, setEmploymentList] = useState<any[]>([{ company_name: "", designation: "", from_date: "", to_date: "", reason_for_leaving: "" }]);

  useEffect(() => {
    if (!user) return;
    const fetchEmployee = async () => {
      const { data: emp } = await supabase
        .from("hr_employees")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!emp) { setLoading(false); return; }
      setEmployee(emp);

      // Pre-fill personal details
      setPersonalForm({
        phone: emp.phone || "", date_of_birth: emp.date_of_birth || "",
        gender: emp.gender || "", address: emp.address || "",
        city: emp.city || "", state: emp.state || "", country: emp.country || "India",
      });

      // Fetch existing documents to check what's uploaded
      const { data: docs } = await supabase
        .from("hr_employee_documents")
        .select("document_type, title")
        .eq("employee_id", emp.id);

      const docMap: Record<string, boolean> = {};
      (docs || []).forEach((d: any) => {
        requiredDocuments.forEach(rd => {
          if (d.title?.toLowerCase().includes(rd.key) || d.document_type === rd.type) {
            docMap[rd.key] = true;
          }
        });
      });
      setUploadedDocs(docMap);

      // Fetch existing data
      const [bankRes, emergencyRes, medicalRes, eduRes, empRes] = await Promise.all([
        supabase.from("hr_employee_bank_details").select("*").eq("employee_id", emp.id).maybeSingle(),
        supabase.from("hr_employee_emergency_contacts").select("*").eq("employee_id", emp.id).limit(1),
        supabase.from("hr_employee_medical").select("*").eq("employee_id", emp.id).maybeSingle(),
        supabase.from("hr_employee_education").select("*").eq("employee_id", emp.id),
        supabase.from("hr_employee_previous_employment").select("*").eq("employee_id", emp.id),
      ]);

      if (bankRes.data) setBankForm(bankRes.data as any);
      if (emergencyRes.data?.[0]) setEmergencyForm(emergencyRes.data[0] as any);
      if (medicalRes.data) setMedicalForm(medicalRes.data as any);
      if (eduRes.data?.length) setEducationList(eduRes.data);
      if (empRes.data?.length) setEmploymentList(empRes.data);

      setLoading(false);
    };
    fetchEmployee();
  }, [user]);

  const uploadDocument = async (docKey: string, file: File) => {
    if (!employee) return;
    setUploading(docKey);
    const filePath = `${employee.id}/onboarding/${docKey}_${Date.now()}_${file.name}`;

    const { error: storageError } = await supabase.storage.from("hr-documents").upload(filePath, file);
    if (storageError) { toast.error(storageError.message); setUploading(null); return; }

    const docInfo = requiredDocuments.find(d => d.key === docKey)!;
    const { error } = await supabase.from("hr_employee_documents").insert({
      employee_id: employee.id,
      title: `${docInfo.label} - ${file.name}`,
      document_type: docInfo.type,
      file_path: filePath,
      file_size: file.size,
      uploaded_by: user?.id,
    });

    if (error) { toast.error(error.message); setUploading(null); return; }

    setUploadedDocs(prev => ({ ...prev, [docKey]: true }));
    setUploading(null);
    toast.success(`${docInfo.label} uploaded successfully`);
  };

  const savePersonalDetails = async () => {
    if (!employee) return;
    setSaving(true);
    const { error } = await supabase.from("hr_employees").update({
      phone: personalForm.phone || null,
      date_of_birth: personalForm.date_of_birth || null,
      gender: personalForm.gender || null,
      address: personalForm.address || null,
      city: personalForm.city || null,
      state: personalForm.state || null,
      country: personalForm.country || null,
    }).eq("id", employee.id);

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Personal details saved");
  };

  const saveEmergencyContact = async () => {
    if (!employee || !emergencyForm.contact_name) return;
    setSaving(true);
    const { error } = await supabase.from("hr_employee_emergency_contacts").upsert({
      employee_id: employee.id,
      contact_name: emergencyForm.contact_name,
      relationship: emergencyForm.relationship || null,
      phone: emergencyForm.phone,
      address: emergencyForm.address || null,
    }, { onConflict: "employee_id" }).select();

    // If upsert fails due to no unique constraint, try insert
    if (error) {
      await supabase.from("hr_employee_emergency_contacts").insert({
        employee_id: employee.id,
        contact_name: emergencyForm.contact_name,
        relationship: emergencyForm.relationship || null,
        phone: emergencyForm.phone,
        address: emergencyForm.address || null,
      });
    }
    setSaving(false);
    toast.success("Emergency contact saved");
  };

  const saveBankDetails = async () => {
    if (!employee) return;
    setSaving(true);
    const { error } = await supabase.from("hr_employee_bank_details").upsert({
      employee_id: employee.id,
      account_holder_name: bankForm.account_holder_name || null,
      bank_name: bankForm.bank_name || null,
      account_number: bankForm.account_number || null,
      ifsc_code: bankForm.ifsc_code || null,
      branch_name: bankForm.branch_name || null,
    }, { onConflict: "employee_id" });

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Bank details saved");
  };

  const saveMedicalInfo = async () => {
    if (!employee) return;
    setSaving(true);
    const { error } = await supabase.from("hr_employee_medical").upsert({
      employee_id: employee.id,
      blood_group: medicalForm.blood_group || null,
      allergies: medicalForm.allergies || null,
      medical_conditions: medicalForm.medical_conditions || null,
    }, { onConflict: "employee_id" });

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Medical info saved");
  };

  const saveEducation = async () => {
    if (!employee) return;
    setSaving(true);
    // Delete existing and re-insert
    await supabase.from("hr_employee_education").delete().eq("employee_id", employee.id);
    const records = educationList.filter(e => e.degree && e.institution).map(e => ({
      employee_id: employee.id,
      degree: e.degree,
      institution: e.institution,
      field_of_study: e.field_of_study || null,
      year_of_passing: e.year_of_passing ? parseInt(e.year_of_passing) : null,
      grade_or_percentage: e.grade_or_percentage || null,
    }));
    if (records.length) {
      const { error } = await supabase.from("hr_employee_education").insert(records);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    setSaving(false);
    toast.success("Education details saved");
  };

  const savePreviousEmployment = async () => {
    if (!employee) return;
    setSaving(true);
    await supabase.from("hr_employee_previous_employment").delete().eq("employee_id", employee.id);
    const records = employmentList.filter(e => e.company_name).map(e => ({
      employee_id: employee.id,
      company_name: e.company_name,
      designation: e.designation || null,
      from_date: e.from_date || null,
      to_date: e.to_date || null,
      reason_for_leaving: e.reason_for_leaving || null,
    }));
    if (records.length) {
      const { error } = await supabase.from("hr_employee_previous_employment").insert(records);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    setSaving(false);
    toast.success("Employment history saved");
  };

  const submitOnboarding = async () => {
    if (!employee) return;
    const allDocsUploaded = requiredDocuments.every(d => uploadedDocs[d.key]);
    if (!allDocsUploaded) {
      toast.error("Please upload all required documents before submitting");
      return;
    }
    const { error } = await supabase.from("hr_employees").update({
      onboarding_status: "documents_submitted",
      lifecycle_stage: "pending_verification",
    }).eq("id", employee.id);

    if (error) { toast.error(error.message); return; }
    setEmployee({ ...employee, onboarding_status: "documents_submitted" });
    toast.success("Onboarding documents submitted for review!");
  };

  // Calculate progress
  const totalSteps = requiredDocuments.length + 5; // docs + personal + emergency + bank + medical + education
  const completedSteps = Object.keys(uploadedDocs).length +
    (personalForm.phone ? 1 : 0) +
    (emergencyForm.contact_name ? 1 : 0) +
    (bankForm.account_number ? 1 : 0) +
    (medicalForm.blood_group ? 1 : 0) +
    (educationList[0]?.degree ? 1 : 0);
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  if (!employee) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <AlertCircle className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-xl font-bold">No Employee Record Found</h2>
      <p className="text-muted-foreground">Your account is not linked to an employee profile yet.</p>
    </div>
  );

  if (employee.onboarding_status === "approved") return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <CheckCircle className="h-16 w-16 text-green-500" />
      <h2 className="text-xl font-bold text-foreground">Onboarding Complete!</h2>
      <p className="text-muted-foreground">Your onboarding has been approved. Welcome to the team!</p>
    </div>
  );

  if (employee.onboarding_status === "documents_submitted") return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="h-16 w-16 text-primary animate-spin" />
      <h2 className="text-xl font-bold text-foreground">Under Review</h2>
      <p className="text-muted-foreground">Your documents are being reviewed by the HR team. You'll be notified once approved.</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {employee.full_name}!</h1>
        <p className="text-muted-foreground">Complete your onboarding by filling in the details and uploading required documents.</p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Onboarding Progress</span>
            <span className="text-sm text-muted-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>

      <Tabs value={activeStep} onValueChange={setActiveStep}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="personal" className="gap-1"><User className="h-3 w-3" />Personal</TabsTrigger>
          <TabsTrigger value="documents" className="gap-1"><FileText className="h-3 w-3" />Documents</TabsTrigger>
          <TabsTrigger value="education" className="gap-1"><GraduationCap className="h-3 w-3" />Education</TabsTrigger>
          <TabsTrigger value="employment" className="gap-1"><Briefcase className="h-3 w-3" />Past Employment</TabsTrigger>
          <TabsTrigger value="bank" className="gap-1"><CreditCard className="h-3 w-3" />Bank Details</TabsTrigger>
          <TabsTrigger value="emergency" className="gap-1"><Heart className="h-3 w-3" />Emergency & Medical</TabsTrigger>
        </TabsList>

        {/* Personal Details */}
        <TabsContent value="personal">
          <Card>
            <CardHeader><CardTitle>Personal Details</CardTitle><CardDescription>Update your personal information</CardDescription></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Phone *</Label><Input value={personalForm.phone} onChange={e => setPersonalForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" /></div>
                <div><Label>Date of Birth</Label><Input type="date" value={personalForm.date_of_birth} onChange={e => setPersonalForm(p => ({ ...p, date_of_birth: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Gender</Label>
                  <Select value={personalForm.gender} onValueChange={v => setPersonalForm(p => ({ ...p, gender: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Country</Label><Input value={personalForm.country} onChange={e => setPersonalForm(p => ({ ...p, country: e.target.value }))} /></div>
              </div>
              <div><Label>Address</Label><Textarea value={personalForm.address} onChange={e => setPersonalForm(p => ({ ...p, address: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>City</Label><Input value={personalForm.city} onChange={e => setPersonalForm(p => ({ ...p, city: e.target.value }))} /></div>
                <div><Label>State</Label><Input value={personalForm.state} onChange={e => setPersonalForm(p => ({ ...p, state: e.target.value }))} /></div>
              </div>
              <Button onClick={savePersonalDetails} disabled={saving}>{saving ? "Saving..." : "Save Personal Details"}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Required Documents */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>Upload all mandatory documents. Accepted formats: PDF, JPG, PNG (max 10MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requiredDocuments.map(doc => (
                <div key={doc.key} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                  {uploadedDocs[doc.key] ? (
                    <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{doc.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {uploadedDocs[doc.key] ? "✓ Uploaded" : "Pending upload"}
                    </p>
                  </div>
                  {!uploadedDocs[doc.key] && (
                    <div>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="w-auto"
                        disabled={uploading === doc.key}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) uploadDocument(doc.key, file);
                        }}
                      />
                    </div>
                  )}
                  {uploading === doc.key && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education */}
        <TabsContent value="education">
          <Card>
            <CardHeader><CardTitle>Education Details</CardTitle><CardDescription>Add your educational qualifications</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              {educationList.map((edu, i) => (
                <div key={i} className="grid gap-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm text-foreground">Qualification {i + 1}</p>
                    {i > 0 && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setEducationList(l => l.filter((_, idx) => idx !== i))}>Remove</Button>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Degree *</Label><Input value={edu.degree} onChange={e => { const l = [...educationList]; l[i] = { ...l[i], degree: e.target.value }; setEducationList(l); }} placeholder="e.g. B.Tech, MBA" /></div>
                    <div><Label>Institution *</Label><Input value={edu.institution} onChange={e => { const l = [...educationList]; l[i] = { ...l[i], institution: e.target.value }; setEducationList(l); }} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label>Field of Study</Label><Input value={edu.field_of_study} onChange={e => { const l = [...educationList]; l[i] = { ...l[i], field_of_study: e.target.value }; setEducationList(l); }} /></div>
                    <div><Label>Year of Passing</Label><Input type="number" value={edu.year_of_passing} onChange={e => { const l = [...educationList]; l[i] = { ...l[i], year_of_passing: e.target.value }; setEducationList(l); }} /></div>
                    <div><Label>Grade / %</Label><Input value={edu.grade_or_percentage} onChange={e => { const l = [...educationList]; l[i] = { ...l[i], grade_or_percentage: e.target.value }; setEducationList(l); }} /></div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => setEducationList(l => [...l, { degree: "", institution: "", field_of_study: "", year_of_passing: "", grade_or_percentage: "" }])}>+ Add More</Button>
              <Button onClick={saveEducation} disabled={saving} className="ml-4">{saving ? "Saving..." : "Save Education"}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Previous Employment */}
        <TabsContent value="employment">
          <Card>
            <CardHeader><CardTitle>Previous Employment</CardTitle><CardDescription>Add your work experience</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              {employmentList.map((emp, i) => (
                <div key={i} className="grid gap-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm text-foreground">Experience {i + 1}</p>
                    {i > 0 && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setEmploymentList(l => l.filter((_, idx) => idx !== i))}>Remove</Button>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Company Name *</Label><Input value={emp.company_name} onChange={e => { const l = [...employmentList]; l[i] = { ...l[i], company_name: e.target.value }; setEmploymentList(l); }} /></div>
                    <div><Label>Designation</Label><Input value={emp.designation} onChange={e => { const l = [...employmentList]; l[i] = { ...l[i], designation: e.target.value }; setEmploymentList(l); }} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label>From</Label><Input type="date" value={emp.from_date} onChange={e => { const l = [...employmentList]; l[i] = { ...l[i], from_date: e.target.value }; setEmploymentList(l); }} /></div>
                    <div><Label>To</Label><Input type="date" value={emp.to_date} onChange={e => { const l = [...employmentList]; l[i] = { ...l[i], to_date: e.target.value }; setEmploymentList(l); }} /></div>
                    <div><Label>Reason for Leaving</Label><Input value={emp.reason_for_leaving} onChange={e => { const l = [...employmentList]; l[i] = { ...l[i], reason_for_leaving: e.target.value }; setEmploymentList(l); }} /></div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={() => setEmploymentList(l => [...l, { company_name: "", designation: "", from_date: "", to_date: "", reason_for_leaving: "" }])}>+ Add More</Button>
              <Button onClick={savePreviousEmployment} disabled={saving} className="ml-4">{saving ? "Saving..." : "Save Employment"}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank Details */}
        <TabsContent value="bank">
          <Card>
            <CardHeader><CardTitle>Bank Account Details</CardTitle><CardDescription>For salary processing</CardDescription></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Account Holder Name</Label><Input value={bankForm.account_holder_name} onChange={e => setBankForm(p => ({ ...p, account_holder_name: e.target.value }))} /></div>
                <div><Label>Bank Name</Label><Input value={bankForm.bank_name} onChange={e => setBankForm(p => ({ ...p, bank_name: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Account Number</Label><Input value={bankForm.account_number} onChange={e => setBankForm(p => ({ ...p, account_number: e.target.value }))} /></div>
                <div><Label>IFSC Code</Label><Input value={bankForm.ifsc_code} onChange={e => setBankForm(p => ({ ...p, ifsc_code: e.target.value }))} /></div>
                <div><Label>Branch Name</Label><Input value={bankForm.branch_name} onChange={e => setBankForm(p => ({ ...p, branch_name: e.target.value }))} /></div>
              </div>
              <Button onClick={saveBankDetails} disabled={saving}>{saving ? "Saving..." : "Save Bank Details"}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency & Medical */}
        <TabsContent value="emergency">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Contact Name *</Label><Input value={emergencyForm.contact_name} onChange={e => setEmergencyForm(p => ({ ...p, contact_name: e.target.value }))} /></div>
                  <div><Label>Relationship</Label><Input value={emergencyForm.relationship} onChange={e => setEmergencyForm(p => ({ ...p, relationship: e.target.value }))} placeholder="e.g. Father, Spouse" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Phone *</Label><Input value={emergencyForm.phone} onChange={e => setEmergencyForm(p => ({ ...p, phone: e.target.value }))} /></div>
                  <div><Label>Address</Label><Input value={emergencyForm.address} onChange={e => setEmergencyForm(p => ({ ...p, address: e.target.value }))} /></div>
                </div>
                <Button onClick={saveEmergencyContact} disabled={saving}>{saving ? "Saving..." : "Save Emergency Contact"}</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Medical Information</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Blood Group</Label>
                    <Select value={medicalForm.blood_group} onValueChange={v => setMedicalForm(p => ({ ...p, blood_group: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Allergies</Label><Textarea value={medicalForm.allergies} onChange={e => setMedicalForm(p => ({ ...p, allergies: e.target.value }))} placeholder="Any known allergies" /></div>
                <div><Label>Medical Conditions</Label><Textarea value={medicalForm.medical_conditions} onChange={e => setMedicalForm(p => ({ ...p, medical_conditions: e.target.value }))} placeholder="Any ongoing medical conditions" /></div>
                <Button onClick={saveMedicalInfo} disabled={saving}>{saving ? "Saving..." : "Save Medical Info"}</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Submit Button */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-foreground">Ready to Submit?</p>
              <p className="text-sm text-muted-foreground">
                {requiredDocuments.every(d => uploadedDocs[d.key])
                  ? "All required documents uploaded. You can submit for review."
                  : `Upload remaining documents: ${requiredDocuments.filter(d => !uploadedDocs[d.key]).map(d => d.label).join(", ")}`
                }
              </p>
            </div>
            <Button
              onClick={submitOnboarding}
              disabled={!requiredDocuments.every(d => uploadedDocs[d.key])}
              size="lg"
            >
              Submit for Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HrOnboarding;
