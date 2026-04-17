import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import OurWork from "./pages/OurWork";
import OurStory from "./pages/OurStory";
import OurTeam from "./pages/OurTeam";
import AdvisoryBoard from "./pages/AdvisoryBoard";
import Programs from "./pages/Programs";
import Impact from "./pages/Impact";
import Partners from "./pages/Partners";
import PartnerWithUs from "./pages/PartnerWithUs";
import GetInvolved from "./pages/GetInvolved";
import Governance from "./pages/Governance";
import Legal from "./pages/Legal";
import Policies from "./pages/Policies";
import Events from "./pages/Events";
import Campaigns from "./pages/Campaigns";
import KnowledgeHub from "./pages/KnowledgeHub";
import Donate from "./pages/Donate";
import Transparency from "./pages/Transparency";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import SectorDetail from "./pages/SectorDetail";
import SocialDays from "./pages/SocialDays";
import Careers from "./pages/Careers";
import CandidateOnboarding from "./pages/CandidateOnboarding";
import NotFound from "./pages/NotFound";
import CrmLogin from "./pages/crm/CrmLogin";
import CrmLayout from "./components/crm/CrmLayout";
import CrmOverview from "./pages/crm/CrmOverview";
import CrmSchools from "./pages/crm/CrmSchools";
import CrmFacilitators from "./pages/crm/CrmFacilitators";
import CrmSessions from "./pages/crm/CrmSessions";
import CrmAttendance from "./pages/crm/CrmAttendance";
import CrmGallery from "./pages/crm/CrmGallery";
import CrmIssues from "./pages/crm/CrmIssues";
import CrmPayments from "./pages/crm/CrmPayments";
import CrmReports from "./pages/crm/CrmReports";
import CrmFunder from "./pages/crm/CrmFunder";
import CrmTeachers from "./pages/crm/CrmTeachers";
import CrmStudents from "./pages/crm/CrmStudents";
import HrLayout from "./components/hr/HrLayout";
import HrDashboard from "./pages/hr/HrDashboard";
import HrEmployees from "./pages/hr/HrEmployees";
import HrDepartments from "./pages/hr/HrDepartments";
import HrProjects from "./pages/hr/HrProjects";
import HrTasks from "./pages/hr/HrTasks";
import HrAttendance from "./pages/hr/HrAttendance";
import HrLeave from "./pages/hr/HrLeave";
import HrPayroll from "./pages/hr/HrPayroll";
import HrRecruitment from "./pages/hr/HrRecruitment";
import HrVolunteers from "./pages/hr/HrVolunteers";
import HrTraining from "./pages/hr/HrTraining";
import HrPerformance from "./pages/hr/HrPerformance";
import HrAssets from "./pages/hr/HrAssets";
import HrCompliance from "./pages/hr/HrCompliance";
import HrReports from "./pages/hr/HrReports";
import HrPolicies from "./pages/hr/HrPolicies";
import HrGrievances from "./pages/hr/HrGrievances";
import HrSettings from "./pages/hr/HrSettings";
import HrMyProfile from "./pages/hr/HrMyProfile";
import HrLifecycle from "./pages/hr/HrLifecycle";
import HrOffboarding from "./pages/hr/HrOffboarding";
import HrCsr from "./pages/hr/HrCsr";
import HrSkills from "./pages/hr/HrSkills";
import HrVolunteerImpact from "./pages/hr/HrVolunteerImpact";
import HrEngagement from "./pages/hr/HrEngagement";
import HrNotifications from "./pages/hr/HrNotifications";
import HrOnboarding from "./pages/hr/HrOnboarding";
import HrApplications from "./pages/hr/HrApplications";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/our-work" element={<OurWork />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/our-team" element={<OurTeam />} />
            <Route path="/advisory-board" element={<AdvisoryBoard />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/partner" element={<PartnerWithUs />} />
            <Route path="/get-involved" element={<GetInvolved />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/events" element={<Events />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/knowledge" element={<KnowledgeHub />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/sector/:slug" element={<SectorDetail />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/onboarding" element={<CandidateOnboarding />} />
            <Route path="/social-days" element={<SocialDays />} />
            {/* CRM Routes */}
            <Route path="/wash-program/login" element={<CrmLogin />} />
            <Route path="/wash-program/dashboard" element={<CrmLayout><CrmOverview /></CrmLayout>} />
            <Route path="/wash-program/dashboard/schools" element={<CrmLayout><CrmSchools /></CrmLayout>} />
            <Route path="/wash-program/dashboard/facilitators" element={<CrmLayout><CrmFacilitators /></CrmLayout>} />
            <Route path="/wash-program/dashboard/sessions" element={<CrmLayout><CrmSessions /></CrmLayout>} />
            <Route path="/wash-program/dashboard/attendance" element={<CrmLayout><CrmAttendance /></CrmLayout>} />
            <Route path="/wash-program/dashboard/gallery" element={<CrmLayout><CrmGallery /></CrmLayout>} />
            <Route path="/wash-program/dashboard/issues" element={<CrmLayout><CrmIssues /></CrmLayout>} />
            <Route path="/wash-program/dashboard/payments" element={<CrmLayout><CrmPayments /></CrmLayout>} />
            <Route path="/wash-program/dashboard/reports" element={<CrmLayout><CrmReports /></CrmLayout>} />
            <Route path="/wash-program/dashboard/funder" element={<CrmLayout><CrmFunder /></CrmLayout>} />
            <Route path="/wash-program/dashboard/teachers" element={<CrmLayout><CrmTeachers /></CrmLayout>} />
            <Route path="/wash-program/dashboard/students" element={<CrmLayout><CrmStudents /></CrmLayout>} />
            {/* HR Routes */}
            <Route path="/hr" element={<HrLayout><HrDashboard /></HrLayout>} />
            <Route path="/hr/employees" element={<HrLayout><HrEmployees /></HrLayout>} />
            <Route path="/hr/departments" element={<HrLayout><HrDepartments /></HrLayout>} />
            <Route path="/hr/recruitment" element={<HrLayout><HrRecruitment /></HrLayout>} />
            <Route path="/hr/attendance" element={<HrLayout><HrAttendance /></HrLayout>} />
            <Route path="/hr/leave" element={<HrLayout><HrLeave /></HrLayout>} />
            <Route path="/hr/payroll" element={<HrLayout><HrPayroll /></HrLayout>} />
            <Route path="/hr/projects" element={<HrLayout><HrProjects /></HrLayout>} />
            <Route path="/hr/tasks" element={<HrLayout><HrTasks /></HrLayout>} />
            <Route path="/hr/volunteers" element={<HrLayout><HrVolunteers /></HrLayout>} />
            <Route path="/hr/training" element={<HrLayout><HrTraining /></HrLayout>} />
            <Route path="/hr/performance" element={<HrLayout><HrPerformance /></HrLayout>} />
            <Route path="/hr/assets" element={<HrLayout><HrAssets /></HrLayout>} />
            <Route path="/hr/compliance" element={<HrLayout><HrCompliance /></HrLayout>} />
            <Route path="/hr/reports" element={<HrLayout><HrReports /></HrLayout>} />
            <Route path="/hr/policies" element={<HrLayout><HrPolicies /></HrLayout>} />
            <Route path="/hr/grievances" element={<HrLayout><HrGrievances /></HrLayout>} />
            <Route path="/hr/settings" element={<HrLayout><HrSettings /></HrLayout>} />
            <Route path="/hr/my-profile" element={<HrLayout><HrMyProfile /></HrLayout>} />
            <Route path="/hr/lifecycle" element={<HrLayout><HrLifecycle /></HrLayout>} />
            <Route path="/hr/offboarding" element={<HrLayout><HrOffboarding /></HrLayout>} />
            <Route path="/hr/csr" element={<HrLayout><HrCsr /></HrLayout>} />
            <Route path="/hr/skills" element={<HrLayout><HrSkills /></HrLayout>} />
            <Route path="/hr/volunteer-impact" element={<HrLayout><HrVolunteerImpact /></HrLayout>} />
            <Route path="/hr/engagement" element={<HrLayout><HrEngagement /></HrLayout>} />
            <Route path="/hr/notifications" element={<HrLayout><HrNotifications /></HrLayout>} />
            <Route path="/hr/onboarding" element={<HrLayout><HrOnboarding /></HrLayout>} />
            <Route path="/hr/applications" element={<HrLayout><HrApplications /></HrLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
