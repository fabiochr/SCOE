import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import { User, FileText, BarChart3, Settings, Menu, X } from 'lucide-react';
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

  useEffect(() => {
    // Get initial session
supabase.auth.getSession().then(async ({ data: { session } }) => {
  console.log('Session:', session);
  setSession(session);
  if (session) {
    console.log('User ID:', session.user.id);
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      
      console.log('Profile data:', profile);
      console.log('Profile error:', error);
          
          if (error) {
            console.error("Error fetching user role:", error.message);
            setError("Failed to load user profile. Please try refreshing.");
          } else {
            console.log("User role loaded:", profile.role);
            setUserRole(profile.role);
          }
        } catch (err) {
          console.error("Unexpected error:", err);
          setError("An unexpected error occurred.");
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
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
            console.log("User role loaded:", profile.role);
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [language, setLanguage] = useState('en');

  // Service types array for translations
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

   // Language translations
const translations = {
  en: {
    appTitle: 'ConstructAI Manager',
    workerSubmission: 'Worker Submission',
    managementDashboard: 'Management Dashboard',
    reports: 'Reports',
    workerManagement: 'Worker Management',
    loading: 'Loading...',
    // WorkerSubmission translations - ADD THESE:
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
    workerSubmissionDescription: 'Submit job completion details with AI-powered data extraction',
    quickAISubmission: 'Quick Job Details Input',
    aiSubmissionDescription: 'Enter job details below. AI will help parse and pre-fill the form.',
    jobDescription: 'Job Description',
    jobAddress: 'Job Address',
    jobValue: 'Job Value',
    additionalInfo: 'Additional Info',
    parseAndFill: 'Parse & Fill Form',
    processing: 'Processing...',
    uploadImages: 'Upload Images',
    submitJob: 'Submit Job',
    remove: 'Remove',
    clickToUpload: 'Click to upload',
    orDragAndDrop: 'or drag and drop',
    imageFormats: 'SVG, PNG, JPG or GIF (MAX. 800x400px)',
    ...Object.fromEntries(serviceTypesData.map(s => [s.key, s.en]))
  },
  pt: {
    appTitle: 'Gerenciador ConstructAI',
    workerSubmission: 'Submissão de Trabalhadores',
    managementDashboard: 'Painel de Gestão',
    reports: 'Relatórios',
    workerManagement: 'Gestão de Trabalhadores',
    loading: 'Carregando...',
    // WorkerSubmission translations - Portuguese:
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
    specifyOtherPayment: 'Especifique outro método de pagamento',
    fillRequiredFields: 'Por favor, preencha todos os campos obrigatórios',
    submissionSuccess: 'Envio de trabalho realizado com sucesso!',
    workerSubmissionTitle: 'Envio de Trabalho do Trabalhador',
    workerSubmissionDescription: 'Envie detalhes de conclusão de trabalho com extração de dados por IA',
    quickAISubmission: 'Entrada Rápida de Detalhes do Trabalho',
    aiSubmissionDescription: 'Insira os detalhes do trabalho abaixo. A IA ajudará a analisar e preencher o formulário.',
    jobDescription: 'Descrição do Trabalho',
    jobAddress: 'Endereço do Trabalho',
    jobValue: 'Valor do Trabalho',
    additionalInfo: 'Informações Adicionais',
    parseAndFill: 'Analisar e Preencher Formulário',
    processing: 'Processando...',
    uploadImages: 'Carregar Imagens',
    submitJob: 'Enviar Trabalho',
    remove: 'Remover',
    clickToUpload: 'Clique para carregar',
    orDragAndDrop: 'ou arraste e solte',
    imageFormats: 'SVG, PNG, JPG ou GIF (MÁX. 800x400px)',
    ...Object.fromEntries(serviceTypesData.map(s => [s.key, s.pt]))
  }
};

  useEffect(() => {
    // Load data from localStorage
    const savedJobs = localStorage.getItem('constructionJobs');
    const savedWorkers = localStorage.getItem('constructionWorkers');
    const savedLanguage = localStorage.getItem('appLanguage');

    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    }

    if (savedWorkers) {
      setWorkers(JSON.parse(savedWorkers));
    } else {
      // Initialize with default workers
      const defaultWorkers = [
        { id: 1, name: 'John Smith', phone: '+1-555-0101', specialty: 'Painting', active: true },
        { id: 2, name: 'Mike Johnson', phone: '+1-555-0102', specialty: 'Plumbing', active: true },
        { id: 3, name: 'Sarah Davis', phone: '+1-555-0103', specialty: 'Electrical', active: true },
        { id: 4, name: 'Tom Wilson', phone: '+1-555-0104', specialty: 'General Contractor', active: true }
      ];
      setWorkers(defaultWorkers);
      localStorage.setItem('constructionWorkers', JSON.stringify(defaultWorkers));
    }

    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
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
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, ...updates } : job
    ));
  };

  const deleteJob = (jobId) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const allNavigation = [
    { id: 'submission', name: translations[language].workerSubmission, icon: User, roles: ['worker', 'manager'] },
    { id: 'dashboard', name: translations[language].managementDashboard, icon: FileText, roles: ['manager'] },
    { id: 'reports', name: translations[language].reports, icon: BarChart3, roles: ['manager'] },
    { id: 'workers', name: translations[language].workerManagement, icon: Settings, roles: ['manager'] }
  ];

  const navigation = userRole ? allNavigation.filter(item => item.roles.includes(userRole)) : [];

  const renderActiveComponent = () => {
    if (!userRole) return null;

    switch (activeTab) {
      case 'submission':
        return (userRole === 'worker' || userRole === 'manager') ? 
          <WorkerSubmission onSubmit={addJob} workers={workers} language={language} translations={translations} serviceTypes={serviceTypesData} /> : null;
      case 'dashboard':
        return userRole === 'manager' ? 
          <Dashboard jobs={jobs} workers={workers} onUpdateJob={updateJob} onDeleteJob={deleteJob} language={language} translations={translations} /> : null;
      case 'reports':
        return userRole === 'manager' ? 
          <Reports jobs={jobs} workers={workers} language={language} translations={translations} /> : null;
      case 'workers':
        return userRole === 'manager' ? 
          <WorkerManagement workers={workers} setWorkers={setWorkers} language={language} translations={translations} serviceTypes={serviceTypesData} /> : null;
      default:
        const firstAllowedTab = navigation[0];
        if (!firstAllowedTab) return null;
        
        setActiveTab(firstAllowedTab.id);
        return null;
    }
  };

  // Show loading state
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
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

  // Show auth screen if not logged in
  if (!session) {
    return <Auth />;
  }

  // Show message if no role found
  if (!userRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">{translations[language].appTitle}</h1>
              </div>
            </div>

            {/* Language Selector & Sign Out */}
            <div className="flex items-center space-x-4">
              <LanguageSelector
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
              <button
                onClick={async () => {
                  const { error } = await supabase.auth.signOut();
                  if (error) console.error("Error signing out:", error.message);
                }}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                      activeTab === item.id
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left pl-3 pr-4 py-2 text-base font-medium ${
                      activeTab === item.id
                        ? 'text-blue-700 bg-blue-50 border-r-4 border-blue-500'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderActiveComponent()}
      </main>
    </div>
  );
}

export default App;