import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Toaster as ShadcnToaster } from './components/ui/toaster';

import Dashboard from "./pages/Dashboard";
import TicketEnquiry from "./pages/TicketEnquiry";
import ClientDetails from "./pages/ClientDetails";
import VideoCallSolution from "./pages/VideoCallSolution";
import Quotation from "./pages/Quotation";
import FollowUp from "./pages/FollowUp";
import SiteVisitPlan from "./pages/SiteVisitPlan";
import TADA from "./pages/TADA";
import SiteVisit from "./pages/SiteVisitBySinior";
import EngineerApproval from "./pages/SiteVisitOTPVerification";
import Invoice from "./pages/Invoice";
import AccountVerification from "./pages/AccountVerification";
import Warehouse from "./pages/Warehouse2";
import Calibration from "./pages/Calibration";
import NotFound from "./pages/not-found";
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SiteVisitByAccountant from './pages/SiteVisitByAccountant';
import Warehouse1 from './pages/Warehouse1';
import AccountablityApproval from './pages/AccountablityApproval';
import CalibrationCertificate from './pages/CalibrationCertificate';
import Conformation from './pages/Conformation';
import Cancle from './pages/Cancle';
import SiteVisitDetail from './pages/SiteVisitDetail';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <ShadcnToaster />
      {/* <Layout> */}
        <Routes>

          <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tickets" element={<TicketEnquiry />} />
          <Route path="/clients" element={<ClientDetails />} />
          <Route path="/videocall" element={<VideoCallSolution />} />
          <Route path="/quotation" element={<Quotation />} />
          <Route path="/followup" element={<FollowUp />} />
          <Route path="/siteplan" element={<SiteVisitPlan />} />
          <Route path="/warehouse1" element={<Warehouse1 />} />
          <Route path="/tada" element={<TADA />} />
          <Route path="/sitevisit" element={<SiteVisit />} />
          <Route path="/sitevisitbyaccount" element={<SiteVisitByAccountant />} />
          <Route path="/approval" element={<EngineerApproval />} />
          <Route path="/site_visit_detail" element={<SiteVisitDetail />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/account" element={<AccountVerification />} />
          <Route path="/warehouse2" element={<Warehouse />} />
          <Route path="/calibration" element={<Calibration />} />

          <Route path="/accountabilityApprovals" element={<AccountablityApproval />} />
          <Route path="/calibrationCertificate" element={<CalibrationCertificate />} />
          <Route path="/conformation" element={<Conformation />} />
          <Route path="/cancel" element={<Cancle />} />

          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      {/* </Layout> */}
    </Router>
  );
}

export default App;
