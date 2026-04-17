// Document generation utilities — generates HTML and triggers print/save as PDF

interface IDCardData {
  name: string;
  email: string;
  phone: string;
  role: string;
  submissionId: string;
  approvedDate: string;
  location: string;
}

interface AppointmentLetterData {
  name: string;
  email: string;
  role: string;
  approvedDate: string;
  submissionId: string;
}

interface CertificateData {
  name: string;
  role: string;
  completedDate: string;
  submissionId: string;
}

// HR-filled offer letter — richer than auto-generated appointment letter
export interface OfferLetterData {
  name: string;
  email: string;
  role: string;
  startDate: string;
  endDate: string;
  stipend: string;           // "Unpaid" or e.g. "₹5,000/month"
  reportingManager: string;
  department: string;
  responsibilities: string;
  additionalNotes: string;
  submissionId: string;
  issuedDate: string;        // Date HR confirmed
}

// HR-filled certificate — includes service dates + achievements
export interface CertificateWithDetailsData {
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  achievements: string;
  specialRecognition: string;
  submissionId: string;
  issuedDate: string;
}

const openPrintWindow = (html: string, title: string) => {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const generateIDCard = (data: IDCardData) => {
  const html = `<!DOCTYPE html>
<html><head><title>ANUVATI ID Card - ${data.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; }
  .card { width: 380px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
  .card-header { background: linear-gradient(135deg, #1a5632, #2d8a4e); padding: 20px 24px; color: white; text-align: center; }
  .card-header h1 { font-size: 20px; font-weight: 700; letter-spacing: 2px; }
  .card-header p { font-size: 10px; letter-spacing: 1px; margin-top: 4px; opacity: 0.85; }
  .card-body { padding: 24px; }
  .role-badge { display: inline-block; background: #e8f5e9; color: #1a5632; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
  .name { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; }
  .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
  .info-row:last-child { border: none; }
  .info-label { font-size: 11px; color: #888; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-value { font-size: 12px; color: #333; font-weight: 500; }
  .card-footer { background: #f8f8f8; padding: 12px 24px; text-align: center; }
  .card-footer p { font-size: 9px; color: #999; }
  .id-number { font-family: monospace; font-size: 10px; color: #aaa; margin-top: 8px; }
  @media print { body { background: white; } .card { box-shadow: none; } }
</style>
</head><body>
<div class="card">
  <div class="card-header">
    <h1>ANUVATI</h1>
    <p>FOUNDATION FOR SUSTAINABLE DEVELOPMENT</p>
  </div>
  <div class="card-body">
    <div class="role-badge">${data.role}</div>
    <div class="name">${data.name}</div>
    <div class="info-row"><span class="info-label">Email</span><span class="info-value">${data.email}</span></div>
    ${data.phone ? `<div class="info-row"><span class="info-label">Phone</span><span class="info-value">${data.phone}</span></div>` : ""}
    ${data.location ? `<div class="info-row"><span class="info-label">Location</span><span class="info-value">${data.location}</span></div>` : ""}
    <div class="info-row"><span class="info-label">Valid From</span><span class="info-value">${formatDate(data.approvedDate)}</span></div>
    <div class="id-number">ID: ANV-${data.submissionId.substring(0, 8).toUpperCase()}</div>
  </div>
  <div class="card-footer">
    <p>This card is the property of ANUVATI Foundation. If found, please return to contact@anuvati.org</p>
  </div>
</div>
</body></html>`;
  openPrintWindow(html, `ANUVATI_ID_${data.name}`);
};

export const generateAppointmentLetter = (data: AppointmentLetterData) => {
  const html = `<!DOCTYPE html>
<html><head><title>Appointment Letter - ${data.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: white; }
  .page { max-width: 800px; margin: 0 auto; padding: 60px; }
  .letterhead { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1a5632; padding-bottom: 20px; margin-bottom: 40px; }
  .org-name { font-family: 'Playfair Display', serif; font-size: 28px; color: #1a5632; font-weight: 700; }
  .org-sub { font-size: 10px; color: #666; letter-spacing: 1px; margin-top: 4px; }
  .org-contact { text-align: right; font-size: 10px; color: #888; line-height: 1.8; }
  .date { font-size: 12px; color: #666; margin-bottom: 24px; }
  .ref { font-size: 11px; color: #999; margin-bottom: 32px; font-family: monospace; }
  .subject { font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 24px; text-decoration: underline; text-underline-offset: 4px; }
  .greeting { font-size: 13px; color: #333; margin-bottom: 16px; }
  .body-text { font-size: 13px; color: #444; line-height: 1.8; margin-bottom: 16px; }
  .highlight { background: #e8f5e9; padding: 16px 20px; border-left: 4px solid #1a5632; border-radius: 4px; margin: 24px 0; }
  .highlight p { font-size: 13px; color: #1a5632; font-weight: 500; }
  .closing { margin-top: 40px; }
  .signature { margin-top: 48px; }
  .sig-line { width: 200px; border-top: 1px solid #333; padding-top: 8px; }
  .sig-name { font-size: 13px; font-weight: 600; color: #1a1a1a; }
  .sig-title { font-size: 11px; color: #888; }
  .footer { margin-top: 60px; padding-top: 16px; border-top: 1px solid #eee; font-size: 9px; color: #bbb; text-align: center; }
  @media print { .page { padding: 40px; } }
</style>
</head><body>
<div class="page">
  <div class="letterhead">
    <div>
      <div class="org-name">ANUVATI</div>
      <div class="org-sub">FOUNDATION FOR SUSTAINABLE DEVELOPMENT</div>
    </div>
    <div class="org-contact">
      contact@anuvati.org<br/>
      www.anuvati.org<br/>
      Lucknow, Uttar Pradesh, India
    </div>
  </div>

  <div class="date">Date: ${formatDate(data.approvedDate)}</div>
  <div class="ref">Ref: ANV/${data.role.toUpperCase().replace(/\s/g, "")}/${data.submissionId.substring(0, 8).toUpperCase()}</div>

  <div class="subject">Subject: Appointment as ${data.role}</div>

  <div class="greeting">Dear ${data.name},</div>

  <div class="body-text">
    We are pleased to inform you that your application for the position of <strong>${data.role}</strong> at ANUVATI Foundation has been reviewed and approved. On behalf of the entire team, we welcome you to the ANUVATI family.
  </div>

  <div class="highlight">
    <p>You have been appointed as <strong>${data.role}</strong> at ANUVATI Foundation, effective ${formatDate(data.approvedDate)}.</p>
  </div>

  <div class="body-text">
    As a ${data.role.toLowerCase()}, you will be working closely with our team on community development, sustainability, and youth empowerment programs. We trust that your skills and dedication will contribute significantly to our mission of fostering sustainable change.
  </div>

  <div class="body-text">
    Please feel free to reach out to us at <strong>contact@anuvati.org</strong> for any queries regarding your role, onboarding process, or responsibilities.
  </div>

  <div class="body-text">
    We look forward to a meaningful and impactful collaboration with you.
  </div>

  <div class="closing">
    <div class="body-text">Warm regards,</div>
    <div class="signature">
      <div class="sig-line">
        <div class="sig-name">ANUVATI Foundation</div>
        <div class="sig-title">Team Coordination Office</div>
        <div class="sig-title">Lucknow, Uttar Pradesh</div>
      </div>
    </div>
  </div>

  <div class="footer">
    This is a computer-generated letter and does not require a physical signature. &bull; ANUVATI Foundation &bull; Ref: ANV/${data.submissionId.substring(0, 8).toUpperCase()}
  </div>
</div>
</body></html>`;
  openPrintWindow(html, `ANUVATI_Appointment_${data.name}`);
};

export const generateCertificate = (data: CertificateData) => {
  const html = `<!DOCTYPE html>
<html><head><title>Certificate - ${data.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
  .cert { width: 900px; background: white; padding: 60px; position: relative; overflow: hidden; }
  .cert::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, #1a5632, #2d8a4e, #4caf50, #2d8a4e, #1a5632); }
  .cert::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, #1a5632, #2d8a4e, #4caf50, #2d8a4e, #1a5632); }
  .border-inner { border: 2px solid #1a5632; padding: 48px; position: relative; }
  .corner { position: absolute; width: 24px; height: 24px; border-color: #1a5632; }
  .corner-tl { top: -2px; left: -2px; border-top: 3px solid #1a5632; border-left: 3px solid #1a5632; }
  .corner-tr { top: -2px; right: -2px; border-top: 3px solid #1a5632; border-right: 3px solid #1a5632; }
  .corner-bl { bottom: -2px; left: -2px; border-bottom: 3px solid #1a5632; border-left: 3px solid #1a5632; }
  .corner-br { bottom: -2px; right: -2px; border-bottom: 3px solid #1a5632; border-right: 3px solid #1a5632; }
  .header { text-align: center; margin-bottom: 32px; }
  .org { font-family: 'Playfair Display', serif; font-size: 32px; color: #1a5632; font-weight: 700; letter-spacing: 4px; }
  .org-sub { font-size: 10px; color: #888; letter-spacing: 3px; margin-top: 4px; }
  .divider { width: 80px; height: 2px; background: #1a5632; margin: 24px auto; }
  .title { font-family: 'Playfair Display', serif; font-size: 28px; color: #333; text-align: center; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 8px; }
  .subtitle { font-size: 11px; color: #999; text-align: center; letter-spacing: 2px; margin-bottom: 32px; text-transform: uppercase; }
  .presented { font-size: 12px; color: #888; text-align: center; margin-bottom: 8px; }
  .recipient { font-family: 'Playfair Display', serif; font-size: 36px; color: #1a5632; text-align: center; margin-bottom: 24px; }
  .description { font-size: 13px; color: #555; text-align: center; line-height: 1.8; max-width: 600px; margin: 0 auto 32px; }
  .role-badge { display: inline-block; background: #e8f5e9; color: #1a5632; padding: 6px 20px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 32px; }
  .role-container { text-align: center; }
  .date-section { text-align: center; font-size: 11px; color: #888; margin-bottom: 32px; }
  .signatures { display: flex; justify-content: space-between; margin-top: 48px; }
  .sig-block { text-align: center; flex: 1; }
  .sig-handwriting { font-family: 'Playfair Display', serif; font-style: italic; font-size: 18px; color: #333; margin-bottom: 4px; }
  .sig-line-cert { width: 140px; border-top: 1px solid #ccc; padding-top: 8px; margin: 0 auto; }
  .sig-name-cert { font-size: 11px; font-weight: 600; color: #333; }
  .sig-title-cert { font-size: 10px; color: #999; }
  .cert-id { text-align: center; margin-top: 24px; font-size: 9px; color: #ccc; font-family: monospace; }
  @media print { body { background: white; } .cert { box-shadow: none; width: 100%; } }
</style>
</head><body>
<div class="cert">
  <div class="border-inner">
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <div class="header">
      <div class="org">ANUVATI</div>
      <div class="org-sub">FOUNDATION FOR SUSTAINABLE DEVELOPMENT</div>
    </div>

    <div class="divider"></div>

    <div class="title">Certificate</div>
    <div class="subtitle">of Completion</div>

    <div class="presented">This is to certify that</div>
    <div class="recipient">${data.name}</div>

    <div class="description">
      has successfully completed their tenure as <strong>${data.role}</strong> at ANUVATI Foundation, 
      demonstrating exceptional commitment to community development, sustainability, and youth empowerment.
    </div>

    <div class="role-container">
      <div class="role-badge">${data.role}</div>
    </div>

    <div class="date-section">
      Completed on: ${formatDate(data.completedDate)}
    </div>

    <div class="signatures">
      <div class="sig-block">
        <div class="sig-handwriting">Priya Sharma</div>
        <div class="sig-line-cert">
          <div class="sig-name-cert">Volunteer Coordinator</div>
          <div class="sig-title-cert">ANUVATI Foundation</div>
        </div>
      </div>
      <div class="sig-block">
        <div class="sig-handwriting">Rajesh Verma</div>
        <div class="sig-line-cert">
          <div class="sig-name-cert">HR Administrator</div>
          <div class="sig-title-cert">ANUVATI Foundation</div>
        </div>
      </div>
      <div class="sig-block">
        <div class="sig-handwriting">Dr. Anjali Gupta</div>
        <div class="sig-line-cert">
          <div class="sig-name-cert">Director</div>
          <div class="sig-title-cert">ANUVATI Foundation</div>
        </div>
      </div>
    </div>

    <div class="cert-id">Certificate ID: ANV-CERT-${data.submissionId.substring(0, 8).toUpperCase()}</div>
  </div>
</div>
</body></html>`;
  openPrintWindow(html, `ANUVATI_Certificate_${data.name}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW: HR-filled Offer Letter
// generateOfferLetterHTML  → returns the HTML string (used for in-dialog preview)
// generateOfferLetter      → opens a print window (used for download button)
// ─────────────────────────────────────────────────────────────────────────────

export const generateOfferLetterHTML = (data: OfferLetterData): string => `<!DOCTYPE html>
<html><head><title>Offer Letter - ${data.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: white; color: #333; }
  .page { max-width: 800px; margin: 0 auto; padding: 60px; }
  .letterhead { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1a5632; padding-bottom: 20px; margin-bottom: 36px; }
  .org-name { font-family: 'Playfair Display', serif; font-size: 28px; color: #1a5632; font-weight: 700; }
  .org-sub { font-size: 10px; color: #666; letter-spacing: 1px; margin-top: 4px; }
  .org-contact { text-align: right; font-size: 10px; color: #888; line-height: 1.8; }
  .meta { font-size: 12px; color: #666; margin-bottom: 6px; }
  .ref { font-size: 11px; color: #999; margin-bottom: 28px; font-family: monospace; }
  .subject { font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 22px; text-decoration: underline; text-underline-offset: 4px; }
  .greeting { font-size: 13px; margin-bottom: 14px; }
  .body-text { font-size: 13px; line-height: 1.85; margin-bottom: 14px; color: #444; }
  .highlight { background: #e8f5e9; padding: 16px 20px; border-left: 4px solid #1a5632; border-radius: 4px; margin: 20px 0; }
  .highlight p { font-size: 13px; color: #1a5632; font-weight: 500; margin-bottom: 6px; }
  .highlight p:last-child { margin-bottom: 0; }
  table.details { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
  table.details td { padding: 7px 10px; border: 1px solid #e0e0e0; }
  table.details td:first-child { font-weight: 600; color: #555; width: 38%; background: #f9f9f9; }
  .section-title { font-size: 12px; font-weight: 700; color: #1a5632; text-transform: uppercase; letter-spacing: 0.5px; margin: 20px 0 8px; }
  .responsibilities { font-size: 12px; line-height: 1.8; color: #444; white-space: pre-wrap; }
  .closing { margin-top: 36px; font-size: 13px; }
  .signature { margin-top: 48px; }
  .sig-line { width: 200px; border-top: 1px solid #333; padding-top: 8px; }
  .sig-name { font-size: 13px; font-weight: 600; color: #1a1a1a; }
  .sig-title { font-size: 11px; color: #888; }
  .footer { margin-top: 48px; padding-top: 14px; border-top: 1px solid #eee; font-size: 9px; color: #bbb; text-align: center; }
  @media print { .page { padding: 40px; } }
</style>
</head><body>
<div class="page">
  <div class="letterhead">
    <div>
      <div class="org-name">ANUVATI</div>
      <div class="org-sub">FOUNDATION FOR SUSTAINABLE DEVELOPMENT</div>
    </div>
    <div class="org-contact">contact@anuvati.org<br/>www.anuvati.org<br/>Lucknow, Uttar Pradesh, India</div>
  </div>

  <div class="meta">Date: ${formatDate(data.issuedDate)}</div>
  <div class="ref">Ref: ANV/OL/${data.role.toUpperCase().replace(/\s/g, "")}/${data.submissionId.substring(0, 8).toUpperCase()}</div>

  <div class="subject">Subject: Offer Letter — ${data.role} at ANUVATI Foundation</div>
  <div class="greeting">Dear ${data.name},</div>

  <div class="body-text">
    We are delighted to offer you the position of <strong>${data.role}</strong> at ANUVATI Foundation for Sustainable Development.
    After reviewing your application, we are confident that your skills and enthusiasm will be a valuable contribution to our mission.
  </div>

  <div class="highlight">
    <p><strong>Position:</strong> ${data.role}</p>
    <p><strong>Department / Team:</strong> ${data.department}</p>
    <p><strong>Reporting To:</strong> ${data.reportingManager}</p>
    <p><strong>Engagement Period:</strong> ${formatDate(data.startDate)} — ${data.endDate ? formatDate(data.endDate) : "Open-ended"}</p>
    <p><strong>Stipend / Honorarium:</strong> ${data.stipend || "Unpaid / Voluntary"}</p>
  </div>

  <div class="section-title">Key Responsibilities</div>
  <div class="responsibilities">${data.responsibilities}</div>

  ${data.additionalNotes ? `<div class="section-title">Additional Terms & Conditions</div><div class="responsibilities">${data.additionalNotes}</div>` : ""}

  <div class="body-text" style="margin-top:20px">
    By accepting this offer, you agree to abide by the policies and code of conduct of ANUVATI Foundation.
    Please confirm your acceptance by responding to <strong>contact@anuvati.org</strong> within 7 days.
  </div>

  <div class="body-text">We look forward to welcoming you to the ANUVATI family!</div>

  <div class="closing">
    Warm regards,
    <div class="signature">
      <div class="sig-line">
        <div class="sig-name">ANUVATI Foundation</div>
        <div class="sig-title">HR &amp; Team Coordination Office</div>
        <div class="sig-title">Lucknow, Uttar Pradesh</div>
      </div>
    </div>
  </div>

  <div class="footer">
    This offer letter was generated on ${formatDate(data.issuedDate)} and is valid subject to verification. &bull;
    ANUVATI Foundation &bull; Ref: ANV/OL/${data.submissionId.substring(0, 8).toUpperCase()}
  </div>
</div>
</body></html>`;

export const generateOfferLetter = (data: OfferLetterData) => {
  openPrintWindow(generateOfferLetterHTML(data), `ANUVATI_OfferLetter_${data.name}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW: HR-filled Certificate
// generateCertificateWithDetailsHTML → returns HTML string (preview)
// generateCertificateFromData        → opens print window (download)
// ─────────────────────────────────────────────────────────────────────────────

export const generateCertificateWithDetailsHTML = (data: CertificateWithDetailsData): string => `<!DOCTYPE html>
<html><head><title>Certificate - ${data.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
  .cert { width: 900px; background: white; padding: 60px; position: relative; overflow: hidden; }
  .cert::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, #1a5632, #2d8a4e, #4caf50, #2d8a4e, #1a5632); }
  .cert::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, #1a5632, #2d8a4e, #4caf50, #2d8a4e, #1a5632); }
  .border-inner { border: 2px solid #1a5632; padding: 48px; position: relative; }
  .corner { position: absolute; width: 24px; height: 24px; }
  .corner-tl { top: -2px; left: -2px; border-top: 3px solid #1a5632; border-left: 3px solid #1a5632; }
  .corner-tr { top: -2px; right: -2px; border-top: 3px solid #1a5632; border-right: 3px solid #1a5632; }
  .corner-bl { bottom: -2px; left: -2px; border-bottom: 3px solid #1a5632; border-left: 3px solid #1a5632; }
  .corner-br { bottom: -2px; right: -2px; border-bottom: 3px solid #1a5632; border-right: 3px solid #1a5632; }
  .org { font-family: 'Playfair Display', serif; font-size: 32px; color: #1a5632; font-weight: 700; letter-spacing: 4px; text-align: center; }
  .org-sub { font-size: 10px; color: #888; letter-spacing: 3px; margin-top: 4px; text-align: center; }
  .divider { width: 80px; height: 2px; background: #1a5632; margin: 22px auto; }
  .title { font-family: 'Playfair Display', serif; font-size: 28px; color: #333; text-align: center; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 6px; }
  .subtitle { font-size: 11px; color: #999; text-align: center; letter-spacing: 2px; margin-bottom: 28px; text-transform: uppercase; }
  .presented { font-size: 12px; color: #888; text-align: center; margin-bottom: 8px; }
  .recipient { font-family: 'Playfair Display', serif; font-size: 36px; color: #1a5632; text-align: center; margin-bottom: 20px; }
  .description { font-size: 13px; color: #555; text-align: center; line-height: 1.85; max-width: 640px; margin: 0 auto 20px; }
  .role-badge { display: inline-block; background: #e8f5e9; color: #1a5632; padding: 6px 20px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
  .role-container { text-align: center; margin-bottom: 20px; }
  .service-period { text-align: center; font-size: 12px; color: #666; margin-bottom: 10px; }
  ${data.achievements ? `.achievements { font-size: 12px; color: #555; text-align: center; font-style: italic; max-width: 600px; margin: 0 auto 24px; line-height: 1.7; }` : ""}
  ${data.specialRecognition ? `.recognition { text-align: center; font-size: 12px; font-weight: 600; color: #1a5632; margin-bottom: 24px; }` : ""}
  .signatures { display: flex; justify-content: space-between; margin-top: 44px; }
  .sig-block { text-align: center; flex: 1; }
  .sig-handwriting { font-family: 'Playfair Display', serif; font-style: italic; font-size: 18px; color: #333; margin-bottom: 4px; }
  .sig-line-cert { width: 140px; border-top: 1px solid #ccc; padding-top: 8px; margin: 0 auto; }
  .sig-name-cert { font-size: 11px; font-weight: 600; color: #333; }
  .sig-title-cert { font-size: 10px; color: #999; }
  .cert-id { text-align: center; margin-top: 20px; font-size: 9px; color: #ccc; font-family: monospace; }
  @media print { body { background: white; } .cert { box-shadow: none; width: 100%; } }
</style>
</head><body>
<div class="cert">
  <div class="border-inner">
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <div class="org">ANUVATI</div>
    <div class="org-sub">FOUNDATION FOR SUSTAINABLE DEVELOPMENT</div>
    <div class="divider"></div>

    <div class="title">Certificate</div>
    <div class="subtitle">of Completion &amp; Appreciation</div>

    <div class="presented">This is to certify that</div>
    <div class="recipient">${data.name}</div>

    <div class="description">
      has successfully completed their tenure as <strong>${data.role}</strong> at ANUVATI Foundation,
      demonstrating exceptional commitment to community development, sustainability, and youth empowerment.
    </div>

    <div class="role-container">
      <div class="role-badge">${data.role}</div>
    </div>

    <div class="service-period">
      Service Period: ${formatDate(data.startDate)} — ${formatDate(data.endDate)}
    </div>

    ${data.achievements ? `<div class="achievements">"${data.achievements}"</div>` : ""}
    ${data.specialRecognition ? `<div class="recognition">&#9733; ${data.specialRecognition} &#9733;</div>` : ""}

    <div class="signatures">
      <div class="sig-block">
        <div class="sig-handwriting">Priya Sharma</div>
        <div class="sig-line-cert">
          <div class="sig-name-cert">Volunteer Coordinator</div>
          <div class="sig-title-cert">ANUVATI Foundation</div>
        </div>
      </div>
      <div class="sig-block">
        <div class="sig-handwriting">Rajesh Verma</div>
        <div class="sig-line-cert">
          <div class="sig-name-cert">HR Administrator</div>
          <div class="sig-title-cert">ANUVATI Foundation</div>
        </div>
      </div>
      <div class="sig-block">
        <div class="sig-handwriting">Dr. Anjali Gupta</div>
        <div class="sig-line-cert">
          <div class="sig-name-cert">Director</div>
          <div class="sig-title-cert">ANUVATI Foundation</div>
        </div>
      </div>
    </div>

    <div class="cert-id">
      Certificate ID: ANV-CERT-${data.submissionId.substring(0, 8).toUpperCase()} &bull; Issued: ${formatDate(data.issuedDate)}
    </div>
  </div>
</div>
</body></html>`;

export const generateCertificateFromData = (data: CertificateWithDetailsData) => {
  openPrintWindow(generateCertificateWithDetailsHTML(data), `ANUVATI_Certificate_${data.name}`);
};
