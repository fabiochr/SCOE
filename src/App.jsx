import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import { User, FileText, BarChart3, Settings, Menu, X, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import WorkerSubmission from './components/WorkerSubmission';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import WorkerManagement from './components/WorkerManagement';
import LanguageSelector from './components/LanguageSelector';

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          
          if (error) {
            console.error("Error fetching user role:", error.message);
            setError("Failed to load user profile.");
          } else {
            setUserRole(profile.role);
          }
        } catch (err) {
          console.error("Unexpected error:", err);
          setError("An unexpected error occurred.");
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          
          if (error) {
            console.error("Error fetching user role:", error.message);
            setError("Failed to load user profile.");
          } else {
            setUserRole(profile.role);
          }
        } catch (err) {
          console.error("Unexpected error:", err);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [activeTab, setActiveTab] = useState('submission');
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [language, setLanguage] = useState('en');

  const serviceTypesData = [
    { key: 'painting', en: 'Painting', pt: 'Pintura', fr: 'Peinture', es: 'Pintura', de: 'Malerei' },
    { key: 'plumbing', en: 'Plumbing', pt: 'Encanamento', fr: 'Plomberie', es: 'Fontanería', de: 'Sanitär' },
    { key: 'electrical', en: 'Electrical', pt: 'Elétrica', fr: 'Électricité', es: 'Eléctrica', de: 'Elektrik' },
    { key: 'carpentry', en: 'Carpentry', pt: 'Carpintaria', fr: 'Menuiserie', es: 'Carpintería', de: 'Tischlerei' },
    { key: 'roofing', en: 'Roofing', pt: 'Telhado', fr: 'Toiture', es: 'Techado', de: 'Dachdeckung' },
    { key: 'flooring', en: 'Flooring', pt: 'Piso', fr: 'Revêtement de Sol', es: 'Pisos', de: 'Bodenbelag' },
    { key: 'hvac', en: 'HVAC', pt: 'HVAC', fr: 'CVC', es: 'HVAC', de: 'HLK' },
    { key: 'generalContractor', en: 'General Contractor', pt: 'Empreiteiro Geral', fr: 'Entrepreneur Général', es: 'Contratista General', de: 'Generalunternehmer' }
  ];

  const translations = {
    en: {
      appTitle: 'Construction Business Management',
      workerSubmission: 'Worker Submission',
      managementDashboard: 'Management Dashboard',
      reports: 'Reports',
      workerManagement: 'Worker Management',
      loading: 'Loading...',
      signOut: 'Sign Out',
      worker: 'Worker',
      selectWorker: 'Select Worker',
      serviceType: 'Service Type',
      selectServiceType: 'Select Service Type',
      location: 'Location',
      jobDate: 'Job Date',
      description: 'Description',
      amount: 'Amount',
      paymentMethod: 'Payment Method',
      cash: 'Cash',
      bankTransfer: 'Bank Transfer',
      check: 'Check',
      creditCard: 'Credit Card',
      otherPayment: 'Other',
      specifyOtherPayment: 'Specify other payment method',
      fillRequiredFields: 'Please fill in all required fields',
      submissionSuccess: 'Job submission successful!',
      workerSubmissionTitle: 'Worker Job Submission',
      workerSubmissionDescription: 'Submit job completion details',
      uploadImages: 'Upload Images',
      submitJob: 'Submit Job',
      ...Object.fromEntries(serviceTypesData.map(s => [s.key, s.en]))
    },
    pt: {
      appTitle: 'Gestão de Negócios de Construção',
      workerSubmission: 'Submissão de Trabalhadores',
      managementDashboard: 'Painel de Gestão',
      reports: 'Relatórios',
      workerManagement: 'Gestão de Trabalhadores',
      loading: 'Carregando...',
      signOut: 'Sair',
      worker: 'Trabalhador',
      selectWorker: 'Selecionar Trabalhador',
      serviceType: 'Tipo de Serviço',
      selectServiceType: 'Selecionar Tipo de Serviço',
      location: 'Localização',
      jobDate: 'Data do Trabalho',
      description: 'Descrição',
      amount: 'Valor',
      paymentMethod: 'Método de Pagamento',
      cash: 'Dinheiro',
      bankTransfer: 'Transferência Bancária',
      check: 'Cheque',
      creditCard: 'Cartão de Crédito',
      otherPayment: 'Outro',
      specifyOtherPayment: 'Especifique outro método',
      fillRequiredFields: 'Preencha todos os campos obrigatórios',
      submissionSuccess: 'Trabalho enviado com sucesso!',
      workerSubmissionTitle: 'Envio de Trabalho',
      workerSubmissionDescription: 'Envie detalhes de conclusão',
      uploadImages: 'Carregar Imagens',
      submitJob: 'Enviar Trabalho',
      ...Object.fromEntries(serviceTypesData.map(s => [s.key, s.pt]))
    }
  };

  useEffect(() => {
    const savedJobs = localStorage.getItem('constructionJobs');
    const savedWorkers = localStorage.getItem('constructionWorkers');
    const savedLanguage = localStorage.getItem('appLanguage');

    if (savedJobs) setJobs(JSON.parse(savedJobs));
    if (savedWorkers) {
      setWorkers(JSON.parse(savedWorkers));
    } else {
      const defaultWorkers = [
        { id: 1, name: 'John Smith', phone: '+1-555-0101', specialty: 'Painting', active: true },
        { id: 2, name: 'Mike Johnson', phone: '+1-555-0102', specialty: 'Plumbing', active: true },
        { id: 3, name: 'Sarah Davis', phone: '+1-555-0103', specialty: 'Electrical', active: true },
        { id: 4, name: 'Tom Wilson', phone: '+1-555-0104', specialty: 'General Contractor', active: true }
      ];
      setWorkers(defaultWorkers);
      localStorage.setItem('constructionWorkers', JSON.stringify(defaultWorkers));
    }
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    localStorage.setItem('constructionJobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('constructionWorkers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const addJob = (jobData) => {
    const newJob = {
      id: Date.now(),
      ...jobData,
      submissionDate: new Date().toISOString(),
      paymentStatus: 'pending'
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const updateJob = (jobId, updates) => {
    setJobs(prev => prev.map(job => job.id === jobId ? { ...job, ...updates } : job));
  };

  const deleteJob = (jobId) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const allNavigation = [
    { id: 'submission', name: translations[language].workerSubmission, icon: User, roles: ['worker', 'manager', 'admin'] },
    { id: 'dashboard', name: translations[language].managementDashboard, icon: FileText, roles: ['manager', 'admin'] },
    { id: 'reports', name: translations[language].reports, icon: BarChart3, roles: ['manager', 'admin'] },
    { id: 'workers', name: translations[language].workerManagement, icon: Settings, roles: ['manager', 'admin'] }
  ];

  const navigation = userRole ? allNavigation.filter(item => item.roles.includes(userRole)) : [];

  const renderActiveComponent = () => {
    if (!userRole) return null;

    switch (activeTab) {
      case 'submission':
        return <WorkerSubmission onSubmit={addJob} workers={workers} language={language} translations={translations} serviceTypes={serviceTypesData} />;
      case 'dashboard':
        return userRole === 'manager' || userRole === 'admin' ? <Dashboard jobs={jobs} workers={workers} onUpdateJob={updateJob} onDeleteJob={deleteJob} language={language} translations={translations} /> : null;
      case 'reports':
        return userRole === 'manager' || userRole === 'admin' ? <Reports jobs={jobs} workers={workers} language={language} translations={translations} /> : null;
      case 'workers':
        return userRole === 'manager' || userRole === 'admin' ? <WorkerManagement workers={workers} setWorkers={setWorkers} language={language} translations={translations} serviceTypes={serviceTypesData} /> : null;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{translations[language]?.loading || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth language={language} setLanguage={setLanguage} translations={translations} />;
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-md">
            <p className="font-bold">Profile Not Found</p>
            <p>Your user profile hasn't been set up yet. Please contact an administrator.</p>
          </div>
          <button
            onClick={async () => await supabase.auth.signOut()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Collapsible Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-blue-600">
          {!sidebarCollapsed && (
            <h1 className="text-lg font-bold text-white truncate">CBM</h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-white hover:bg-blue-700 p-1 rounded"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* User Info */}
        <div className={`p-4 border-b border-gray-200 ${sidebarCollapsed ? 'px-2' : ''}`}>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {(session.user.user_metadata?.full_name || session.user.email)?.charAt(0).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {session.user.user_metadata?.full_name || session.user.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? item.name : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-gray-200 p-4">
          {!sidebarCollapsed && (
            <div className="mb-3">
              <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
            </div>
          )}
          <button
            onClick={async () => await supabase.auth.signOut()}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? translations[language].signOut : ''}
          >
            <LogOut className={`w-5 h-5 flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-2'}`} />
            {!sidebarCollapsed && <span>{translations[language].signOut}</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderActiveComponent()}
      </div>
    </div>
  );
}

export default App;