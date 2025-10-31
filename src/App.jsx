import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import { User, FileText, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('submission');
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [language, setLanguage] = useState('en');

  const serviceTypesData = [
    { key: 'painting', en: 'Painting', pt: 'Pintura' },
    { key: 'plumbing', en: 'Plumbing', pt: 'Encanamento' },
    { key: 'electrical', en: 'Electrical', pt: 'Elétrica' },
    { key: 'carpentry', en: 'Carpentry', pt: 'Carpintaria' },
    { key: 'roofing', en: 'Roofing', pt: 'Telhado' },
    { key: 'flooring', en: 'Flooring', pt: 'Piso' },
    { key: 'hvac', en: 'HVAC', pt: 'HVAC' },
    { key: 'generalContractor', en: 'General Contractor', pt: 'Empreiteiro Geral' }
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
      manager: 'Manager',
      admin: 'Admin',
      selectWorker: 'Select Worker',
      serviceType: 'Service Type',
      selectServiceType: 'Select Service Type',
      location: 'Location of work or service performed',
      jobDate: 'Job Date',
      description: 'Description',
      amount: 'Amount',
      paymentMethod: 'Payment Method',
      cash: 'Cash',
      bankTransfer: 'Bank Transfer',
      check: 'Check',
      creditCard: 'Credit Card',
      otherPayment: 'Other',
      specifyOtherPayment: 'Specify payment method',
      fillRequiredFields: 'Please fill in all required fields',
      submissionSuccess: 'Job submitted successfully!',
      uploadImages: 'Upload Images',
      submitJob: 'Submit Job',
      totalJobs: 'Total Jobs',
      totalValue: 'Total Value',
      paid: 'Paid',
	  searchJobs: 'Search jobs...',
      pending: 'Pending',
	  allStatus:'All Status',
	  dashboardHeader: 'Management Dashboard',
	  monitorJobs: 'Monitor and manage job submissions',
	  jobDetails: 'Job Details',
	  workerLabel: 'Worker',
	  dateLabel: 'Date',
	  amountLabel: 'Amount',
	  locationLabel: 'Location',
	  descriptionLabel: 'Description',
	  paymentMethodLabel: 'Payment Method',
	  photosLabel: 'Photos',
	  noDescription: 'No description provided',
	  notSpecified: 'Not specified',
	  markPaid: 'Mark Paid',
	  viewDetails: 'View Details',
      delete: 'Delete',	  
	  // Table headers
    date: 'Date',
    worker: 'Worker',
    service: 'Service',
    status: 'Status',
    actions: 'Actions',
      ...Object.fromEntries(serviceTypesData.map(s => [s.key, s.en]))
    },
    pt: {
      appTitle: 'Gestão de Negócios de Construção',
      workerSubmission: 'Submissão de Trabalho',
      managementDashboard: 'Painel de Gestão',
      reports: 'Relatórios',
      workerManagement: 'Gestão de Trabalhadores',
      loading: 'Carregando...',
      signOut: 'Sair',
      manager: 'Gerente',
      admin: 'Administrador',
      selectWorker: 'Selecionar Trabalhador',
      serviceType: 'Tipo de Serviço',
      selectServiceType: 'Selecionar Tipo',
      location: 'Local do trabalho ou serviço',
      jobDate: 'Data',
      description: 'Descrição',
      amount: 'Valor',
      paymentMethod: 'Método de Pagamento',
      cash: 'Dinheiro',
      bankTransfer: 'Transferência',
      check: 'Cheque',
      creditCard: 'Cartão',
      otherPayment: 'Outro',
      specifyOtherPayment: 'Especifique o método',
      fillRequiredFields: 'Preencha todos os campos',
      submissionSuccess: 'Trabalho enviado!',
      uploadImages: 'Carregar Imagens',
      submitJob: 'Enviar',
      totalJobs: 'Total de Trabalhos',
      totalValue: 'Valor Total',
      paid: 'Pago',
	  allStatus:'Todos os Status',
	  searchJobs: 'Busca de servicos...',
	  viewDetails: 'Ver Detalhes',
      pending: 'Pendente',
	  dashboardHeader: 'Painel de Gestão',
	  monitorJobs: 'Monitore e gerencie os trabalhos enviados',
	  jobDetails: 'Detalhes do Trabalho',
	  workerLabel: 'Trabalhador',
	  dateLabel: 'Data',
	  amountLabel: 'Valor',
	  locationLabel: 'Localização',
	  descriptionLabel: 'Descrição',
	  paymentMethodLabel: 'Método de Pagamento',
	  photosLabel: 'Fotos',
	  noDescription: 'Nenhuma descrição fornecida',
	  notSpecified: 'Não especificado',
	  markPaid: 'Marcar Pago',
      delete: 'Excluir',
	  // Table headers
     date: 'Data',
     worker: 'Trabalhador',
     service: 'Serviço',
     status: 'Status',
     actions: 'Ações',
     ...Object.fromEntries(serviceTypesData.map(s => [s.key, s.pt]))
    }
  };

// Load jobs from Supabase
const loadJobsFromDB = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error loading jobs:', error);
  } else {
    setJobs(data || []);
  }
};

// Load workers from Supabase
const loadWorkersFromDB = async () => {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error loading workers:', error);
  } else {
    setWorkers(data || []);
  }
};

// Add job to Supabase
const addJob = async (jobData) => {
  console.log('📝 Submitting job data:', jobData); // Debug log
  
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        worker_id: jobData.workerId,
        service_type: jobData.serviceType,
        location: jobData.location || null,
        start_date: jobData.startDate, // NEW: start date instead of date
        end_date: jobData.endDate || null, // NEW: end date
        description: jobData.description || null,
        amount: jobData.amount ? parseFloat(jobData.amount) : null,
        payment_method: jobData.paymentMethod === 'other' 
          ? jobData.otherPaymentMethod 
          : jobData.paymentMethod || null,
        payment_status: 'pending',
        status: jobData.endDate && new Date(jobData.endDate) < new Date() 
          ? 'completed' 
          : 'in_progress', // NEW: status field
        images: jobData.images || []
      }])
      .select();
  
    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    
    console.log('✅ Job saved successfully:', data);
    
    // Reload jobs from database
    await loadJobsFromDB();
    
    alert(translations[language]?.submissionSuccess || 'Job submitted successfully!');
  } catch (error) {
    console.error('💥 Error adding job:', error);
    alert('Error saving job: ' + error.message);
    throw error;
  }
};

  // Update job
  const updateJob = async (jobId, updates) => {
    const dbUpdates = {};
    if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
    
    const { error } = await supabase
      .from('jobs')
      .update(dbUpdates)
      .eq('id', jobId);
    
    if (error) {
      console.error('Error updating job:', error);
      alert('Error updating job.');
    } else {
      await loadJobsFromDB();
    }
  };

  // Delete job
  const deleteJob = async (jobId) => {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);
    
    if (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job.');
    } else {
      await loadJobsFromDB();
    }
  };

useEffect(() => {
  let mounted = true;

  // Initial session check
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (!mounted) return;
    
    console.log('Initial session check:', session ? 'Logged in' : 'Not logged in');
    
    setSession(session);
    
    if (session) {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        if (!mounted) return;
        
        if (error) {
          console.error("Error fetching user role:", error.message);
          setError("Failed to load user profile.");
          setUserRole(null);
        } else {
          setUserRole(profile.role);
          setError(null);
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
        setUserRole(null);
      }
    } else {
      setUserRole(null);
      setError(null);
    }
    
    if (mounted) {
      setLoading(false);
    }
  });

  // Auth state change listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth event:', event); // Debug log
    
    setSession(session);
    
    // Handle sign out explicitly
     if (event === 'SIGNED_OUT') {
      console.log('👋 User signed out');
      setSession(null);
      setUserRole(null);
      setJobs([]);
      setWorkers([]);
      setError(null);
      setLoading(false);
      return; // IMPORTANT: Exit immediately
    }
    
    // Handle other events
    setSession(session);
    
    if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
      setLoading(true);
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        if (!mounted) return;
        
        if (error) {
          console.error("Error fetching user role:", error.message);
          setError("Failed to load user profile.");
          setUserRole(null);
        } else {
          setUserRole(profile.role);
          setError(null);
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
        setUserRole(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    } else if (!session) {
      setUserRole(null);
      setError(null);
      setLoading(false);
    }
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

  useEffect(() => {
    if (session && userRole) {
      loadJobsFromDB();
      loadWorkersFromDB();
    }
    const savedLanguage = localStorage.getItem('appLanguage');
    if (savedLanguage) setLanguage(savedLanguage);
  }, [session, userRole]);

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const allNavigation = [
    { id: 'submission', name: translations[language].workerSubmission, icon: User, roles: ['worker', 'admin'] },
    { id: 'dashboard', name: translations[language].managementDashboard, icon: FileText, roles: ['manager', 'admin'] },
    { id: 'reports', name: translations[language].reports, icon: BarChart3, roles: ['manager', 'admin'] },
    { id: 'workers', name: translations[language].workerManagement, icon: Settings, roles: ['manager', 'admin'] }
  ];

  const navigation = userRole ? allNavigation.filter(item => item.roles.includes(userRole)) : [];

  const renderActiveComponent = () => {
    if (!userRole) return null;
	
// Get the allowed roles for current tab
  const currentNav = allNavigation.find(item => item.id === activeTab);
  
// Security check: verify user has access to current tab
  if (currentNav && !currentNav.roles.includes(userRole)) {
	  console.warn(`Unauthorized access attempt: ${userRole} tried to access ${activeTab}`);
    // Redirect to first allowed tab
    const allowedTab = navigation[0];
    if (allowedTab && allowedTab.id !== activeTab) {
      console.log(`Redirecting ${userRole} to ${allowedTab.id}`);
      setActiveTab(allowedTab.id);
    }
	    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );   
  }
    switch (activeTab) {
      case 'submission':
        return <WorkerSubmission onSubmit={addJob} workers={workers} language={language} translations={translations} serviceTypes={serviceTypesData} />;
      case 'dashboard':
        return <Dashboard jobs={jobs} workers={workers} onUpdateJob={updateJob} onDeleteJob={deleteJob} language={language} translations={translations} />;
      case 'reports':
        return <Reports jobs={jobs} workers={workers} language={language} translations={translations} />;
      case 'workers':
        return <WorkerManagement workers={workers} setWorkers={setWorkers} loadWorkers={loadWorkersFromDB} language={language} translations={translations} serviceTypes={serviceTypesData} />;
      default:
		  const firstTab = navigation[0];
		  if (firstTab) {
			setActiveTab(firstTab.id);
		  }
		  return null;
    }
  };
	useEffect(() => {
	  if (userRole && navigation.length > 0) {
		// Check if current active tab is accessible by user
		const hasAccess = navigation.some(item => item.id === activeTab);
		if (!hasAccess) {
		  // Set to first available tab
		  setActiveTab(navigation[0].id);
		}
	  }
	}, [userRole, navigation.length]);

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
			  onClick={async () => {
				console.log('🚪 Signing out from error screen...');
				try {
				  const { error } = await supabase.auth.signOut();
				  if (error) {
					console.error('Sign out error:', error);
					alert('Error signing out: ' + error.message);
				  }
				  // Don't set any state - listener will handle it
				} catch (error) {
				  console.error('Sign out exception:', error);
				  alert('Error signing out: ' + error.message);
				}
			  }}
			  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
			>
			  Sign Out
			</button>
        </div>
      </div>
    );
  }

  const userName = session.user.user_metadata?.full_name || session.user.email;
  const userInitial = userName.charAt(0).toUpperCase();

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
              {userInitial}
            </div>
            {!sidebarCollapsed && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{translations[language][userRole] || userRole}</p>
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
        <div className="border-t border-gray-200 p-4 space-y-2">
          {!sidebarCollapsed && (
            <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
          )}
			<button
			  onClick={async () => {
				console.log('🚪 Signing out from sidebar...');
				try {
				  const { error } = await supabase.auth.signOut();
				  if (error) {
					console.error('Sign out error:', error);
					alert('Error signing out. Please try again.');
				  }
				  // Don't set any state - listener will handle it
				} catch (error) {
				  console.error('Sign out exception:', error);
				  alert('Error signing out: ' + error.message);
				}
			  }}
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