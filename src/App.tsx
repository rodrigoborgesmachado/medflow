import { Route, Routes } from 'react-router';
import { AppLayout } from './components/AppLayout/AppLayout';
import { RequireDirectory } from './components/RequireDirectory/RequireDirectory';
import { HomePage } from './features/home/pages/HomePage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { PatientsPage } from './features/pacientes/pages/PatientsPage';
import { PatientDetailsPage } from './features/pacientes/pages/PatientDetailsPage';
import { AttendancesPage } from './features/atendimentos/pages/AttendancesPage';
import { ReportsPage } from './features/relatorios/pages/ReportsPage';
import AboutPage from './pages/AboutPage/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage/PrivacyPolicyPage';
import ContactPage from './pages/ContactPage/ContactPage';

export function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />

            <Route element={<RequireDirectory />}>
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/pacientes" element={<PatientsPage />} />
                    <Route path="/pacientes/:id" element={<PatientDetailsPage />} />
                    <Route path="/atendimentos" element={<AttendancesPage />} />
                    <Route path="/relatorios" element={<ReportsPage />} />
                    <Route path="/relatorios/:reportId" element={<ReportsPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                </Route>
            </Route>
        </Routes>
    );
}
