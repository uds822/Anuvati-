import Layout from "@/components/layout/Layout";
import { Shield, FileText, AlertTriangle, Download, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const policies = [
  {
    name: "Safeguarding Policy (PSEAH)",
    status: "adopted",
    summary: "Zero tolerance for sexual exploitation, abuse and harassment. Covers all ANUVATI personnel, partners, and operations — field, office, and digital.",
    details: [
      "Survivor-centered response and case management within 24 hours",
      "Safe recruitment with identity verification, reference and background checks",
      "Mandatory training and Code of Conduct signing for all personnel",
      "Partnership due diligence and safeguarding clauses in all agreements",
      "Two-adult rule, safe photography consent, and community-facing conduct standards",
      "Confidential reporting channels with non-retaliation protections",
    ],
    appliesTo: "Board Members, Employees, Volunteers, Interns, Consultants, Vendors, Partners",
  },
  {
    name: "Child Protection Policy",
    status: "adopted",
    summary: "Ensures the safety, dignity and rights of all children (under 18) engaging with ANUVATI programs, including prevention and response to abuse, exploitation, and neglect.",
    details: [
      "Best interests of the child as the guiding principle",
      "Written risk assessment for every child-related activity",
      "Supervision ratios enforced; no isolated one-to-one interactions",
      "Child-safe complaints mechanism displayed and explained to children",
      "Informed consent for photography/media with no identifying details",
      "Mandatory reporting of suspected offences to authorities",
    ],
    appliesTo: "All personnel and associated personnel interacting with children",
  },
  {
    name: "Code of Conduct & Ethics",
    status: "adopted",
    summary: "Defines ethical and professional standards for all ANUVATI personnel — integrity, accountability, inclusion, zero tolerance for harassment.",
    details: [
      "No bribery, facilitation payments, kickbacks or improper gifts",
      "Protect confidential information and personal data",
      "Appropriate boundaries in community interactions",
      "Digital and social media conduct standards",
      "Gift, hospitality and donation recording requirements",
    ],
    appliesTo: "Board Members, Employees, Volunteers, Interns, Consultants, Vendors, Partners",
  },
  {
    name: "Anti-Harassment / POSH Policy",
    status: "adopted",
    summary: "Prevents and addresses sexual harassment and all forms of workplace harassment. Compliant with Indian POSH requirements.",
    details: [
      "Internal Complaints Committee (ICC) with defined composition and tenure",
      "Written complaint process with 7-day acknowledgment",
      "Interim relief measures (transfer, leave, no-contact directives)",
      "Inquiry with principles of natural justice and confidentiality",
      "Mandatory annual POSH training for all personnel",
    ],
    appliesTo: "All personnel across offices, field locations, and virtual/digital spaces",
  },
  {
    name: "Whistleblower Policy",
    status: "adopted",
    summary: "Enables safe reporting of suspected misconduct, fraud, corruption, safeguarding breaches, or serious policy violations.",
    details: [
      "Open to employees, interns, volunteers, vendors, partners, and beneficiaries",
      "Covers fraud, bribery, conflict of interest, harassment, data breaches, and misrepresentation",
      "Anonymous reports accepted; identity protected to extent feasible",
      "Preliminary assessment within 7 working days",
      "Non-retaliation protections enforced with disciplinary consequences",
    ],
    appliesTo: "Board Members, Employees, Volunteers, Interns, Consultants, Vendors, Partners",
  },
  {
    name: "Conflict of Interest Policy",
    status: "adopted",
    summary: "Prevents personal, financial, or other interests from improperly influencing ANUVATI's decision-making.",
    details: [
      "Annual COI declaration by Board and key staff",
      "Immediate disclosure when a conflict arises",
      "Recusal from discussion and decision-making on conflicted matters",
      "Competitive procurement or third-party benchmarking required",
      "COI Register maintained with declaration forms",
    ],
    appliesTo: "Board members, advisors, senior management, and employees in finance/procurement/hiring",
  },
  {
    name: "Anti-Fraud & Anti-Corruption Policy",
    status: "adopted",
    summary: "Zero tolerance framework to prevent, detect and respond to fraud, corruption, bribery, kickbacks, and misuse of resources.",
    details: [
      "Segregation of duties in finance and procurement",
      "Vendor due diligence and competitive procurement requirements",
      "Red flags monitoring: single-source awards, invoice splitting, ghost beneficiaries",
      "Asset register and periodic physical verification",
      "Recovery of losses; disciplinary measures; donor/authority notification when required",
    ],
    appliesTo: "Board Members, Employees, Volunteers, Interns, Consultants, Vendors, Partners",
  },
  {
    name: "Procurement Policy",
    status: "adopted",
    summary: "Ensures procurement is transparent, fair, competitive, and delivers best value for money while meeting donor and legal requirements.",
    details: [
      "Tiered procurement thresholds: micro (1 quote), small (3 quotes), large (competitive bidding/RFP)",
      "Vendor KYC, conflict of interest checks, and sanctions screening",
      "Documented scoring and evaluation for vendor selection",
      "Complete procurement file retention (quotes, evaluations, contracts, delivery notes)",
      "Sustainability and ethical sourcing considerations",
    ],
    appliesTo: "All personnel involved in procurement decisions",
  },
  {
    name: "HR / People Policy",
    status: "adopted",
    summary: "Fair, transparent, and compliant people practices covering recruitment, employment, performance, wellbeing, and separation.",
    details: [
      "Equal opportunity, merit-based recruitment with structured interviews",
      "Induction training covering Code of Conduct, Safeguarding, POSH, and Data Privacy",
      "Goal-setting aligned to program results with regular check-ins",
      "Field safety briefings, travel protocols, and mental health support pathways",
      "Disciplinary processes with principles of natural justice",
    ],
    appliesTo: "Board Members, Employees, Volunteers, Interns, Consultants",
  },
  {
    name: "Data Privacy Policy",
    status: "adopted",
    summary: "Protects personal data of beneficiaries, donors, staff and partners. Aligned with India's Digital Personal Data Protection framework.",
    details: [
      "Purpose limitation, data minimization, and transparency principles",
      "Privacy notices in simple language with consent logging",
      "Role-based access control, encryption, and secure backups",
      "Data breach response: contain within 24 hours, notify affected parties",
      "Data subject rights handling for access, correction, and consent withdrawal",
    ],
    appliesTo: "All data processing activities across ANUVATI",
  },
  {
    name: "Donor Privacy Policy",
    status: "adopted",
    summary: "Protects donor information, builds trust, and ensures responsible fundraising practices. Donor data is never sold.",
    details: [
      "Data shared only with consent or for processing donations/legal requirements",
      "Accurate donor records with communication preference management",
      "Opt-out and unsubscribe available in every communication",
      "Donation records retained for statutory and audit requirements",
    ],
    appliesTo: "All donor-facing operations and fundraising activities",
  },
  {
    name: "Grievance Redressal Policy",
    status: "adopted",
    summary: "Transparent, accessible mechanism for receiving and resolving complaints from staff, volunteers, beneficiaries, partners, and the public.",
    details: [
      "Acknowledgement within 3 working days",
      "Initial assessment within 7 working days",
      "Resolution target within 30 days (with extension for complex cases)",
      "Complaints routed to appropriate channels (Safeguarding, POSH, Fraud, Privacy)",
      "Appeal mechanism with defined appellate authority",
    ],
    appliesTo: "All stakeholders including staff, volunteers, beneficiaries, partners",
  },
  {
    name: "Volunteer Policy",
    status: "adopted",
    summary: "Defines recruitment, onboarding, roles, conduct and support for volunteers and interns — ensuring safe and effective engagement.",
    details: [
      "Application and screening with ID verification; reference checks for child-facing roles",
      "Orientation with Code of Conduct and Safeguarding commitment signing",
      "Clear do's and don'ts: no cash handling without authorization, no isolated child interactions",
      "Training, mentoring, periodic feedback, and certificates upon completion",
      "Meaningful participation with learning and development opportunities",
    ],
    appliesTo: "All volunteers and interns engaged with ANUVATI",
  },
  {
    name: "Finance & Internal Controls",
    status: "adopted",
    summary: "Framework for financial management, approval matrices, internal audit, and donor compliance.",
    details: [
      "Segregation of duties and approval hierarchies",
      "Periodic internal and external audits",
      "Budget controls and variance reporting",
      "Donor fund tracking and utilization reporting",
    ],
    appliesTo: "Finance team, management, and Board",
  },
  {
    name: "Information Security",
    status: "planned",
    summary: "Basic information security practices, device security, and incident response protocols.",
    details: [
      "Role-based access and strong password policies",
      "Device security and encryption standards",
      "Phishing awareness and safe data handling training",
      "Incident reporting and response procedures",
    ],
    appliesTo: "All ANUVATI personnel handling digital systems",
  },
];

const Policies = () => {
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  return (
    <Layout>
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="text-primary" size={28} />
            <p className="font-heading text-secondary font-semibold text-sm uppercase tracking-widest">Safeguarding & Compliance</p>
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-6">Policies & Safeguarding</h1>
          <p className="font-body text-muted-foreground text-lg max-w-3xl">
            ANUVATI maintains zero tolerance for safeguarding breaches and upholds the highest standards of ethics, protection, and accountability across all operations.
          </p>
          <div className="mt-6">
            <a href="/docs/ANUVATI_Policy_Manual.docx" download>
              <Button className="font-heading font-semibold gap-2">
                <Download size={16} />
                Download Full Policy Manual
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading font-bold text-2xl text-foreground">Policy Library</h2>
            <div className="flex items-center gap-4 text-xs font-body text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle size={14} className="text-primary" /> Adopted</span>
              <span className="flex items-center gap-1"><Clock size={14} className="text-secondary" /> Planned</span>
            </div>
          </div>
          <div className="space-y-3">
            {policies.map((p) => (
              <div
                key={p.name}
                className="bg-card rounded-lg border border-border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setExpandedPolicy(expandedPolicy === p.name ? null : p.name)}
              >
                <div className="p-5 flex items-start gap-4">
                  <FileText size={18} className="text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold text-foreground text-sm">{p.name}</h3>
                      {p.status === "adopted" ? (
                        <CheckCircle size={14} className="text-primary shrink-0" />
                      ) : (
                        <Clock size={14} className="text-secondary shrink-0" />
                      )}
                    </div>
                    <p className="font-body text-muted-foreground text-xs">{p.summary}</p>
                  </div>
                  <span className="text-muted-foreground text-xs shrink-0 mt-1">
                    {expandedPolicy === p.name ? "▲" : "▼"}
                  </span>
                </div>

                {expandedPolicy === p.name && (
                  <div className="px-5 pb-5 border-t border-border pt-4 animate-fade-in">
                    <p className="text-xs font-heading text-muted-foreground mb-3">
                      <strong className="text-foreground">Applies to:</strong> {p.appliesTo}
                    </p>
                    <ul className="space-y-1.5">
                      {p.details.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-body text-muted-foreground">
                          <span className="text-primary mt-0.5 shrink-0">•</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4">
                      <a href="/docs/ANUVATI_Policy_Manual.docx" download>
                        <Button variant="outline" size="sm" className="text-xs font-heading gap-1">
                          <Download size={12} />
                          Download Policy Manual
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report a Concern */}
      <section className="py-16 bg-section-light">
        <div className="container max-w-5xl">
          <div className="bg-card rounded-lg p-8 border border-border">
            <div className="flex items-start gap-4">
              <AlertTriangle size={24} className="text-secondary shrink-0 mt-1" />
              <div>
                <h2 className="font-heading font-bold text-xl text-foreground mb-2">Report a Concern</h2>
                <p className="font-body text-muted-foreground text-sm mb-4">
                  If you wish to report a safeguarding concern, ethical violation, fraud, harassment, or any issue related to our programs or personnel, you can reach out confidentially through any of the following channels:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="bg-accent/50 rounded-lg p-3">
                    <p className="font-heading font-semibold text-foreground text-xs mb-1">Safeguarding & Child Protection</p>
                    <a href="mailto:safeguarding@anuvati.org" className="text-primary text-xs underline">safeguarding@anuvati.org</a>
                  </div>
                  <div className="bg-accent/50 rounded-lg p-3">
                    <p className="font-heading font-semibold text-foreground text-xs mb-1">Whistleblower / Fraud</p>
                    <a href="mailto:concerns@anuvati.org" className="text-primary text-xs underline">concerns@anuvati.org</a>
                  </div>
                  <div className="bg-accent/50 rounded-lg p-3">
                    <p className="font-heading font-semibold text-foreground text-xs mb-1">POSH / Harassment</p>
                    <a href="mailto:icc@anuvati.org" className="text-primary text-xs underline">icc@anuvati.org</a>
                  </div>
                  <div className="bg-accent/50 rounded-lg p-3">
                    <p className="font-heading font-semibold text-foreground text-xs mb-1">General Grievance</p>
                    <a href="mailto:grievance@anuvati.org" className="text-primary text-xs underline">grievance@anuvati.org</a>
                  </div>
                </div>
                <p className="font-body text-muted-foreground text-xs italic">
                  All reports are treated with strict confidentiality. Anonymous reports are accepted. Retaliation against reporters is prohibited under our Whistleblower Policy. For emergencies, call 112 (India).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Policies;
