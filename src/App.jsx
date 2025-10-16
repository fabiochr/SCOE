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

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (error) console.error("Error fetching user role:", error.message);
        else setUserRole(profile.role);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (error) console.error("Error fetching user role:", error.message);
        else setUserRole(profile.role);
      } else {
        setUserRole(null);
      }
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
      // WorkerSubmission
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
      worker: 'Worker',
      selectWorker: 'Select Worker',
      serviceType: 'Service Type',
      selectServiceType: 'Select Service Type',
      location: 'Location',
      jobDate: 'Job Date',
      description: 'Description',
      amount: 'Amount',
      paymentMethod: 'Payment Method',
      uploadImages: 'Upload Images',
      submitJob: 'Submit Job',
      remove: 'Remove',
      clickToUpload: 'Click to upload',
      orDragAndDrop: 'or drag and drop',
      imageFormats: 'SVG, PNG, JPG or GIF (MAX. 800x400px)',
      // Dashboard
      dashboardTitle: 'Management Dashboard',
      dashboardDescription: 'Monitor job submissions and manage payments',
      totalJobs: 'Total Jobs',
      totalValue: 'Total Value',
      paid: 'Paid',
      pending: 'Pending',
      searchJobsPlaceholder: 'Search jobs...',
      allStatus: 'All Status',
      statusPending: 'Pending',
      statusPaid: 'Paid',
      statusOverdue: 'Overdue',
      allServices: 'All Services',
      generateInvoice: 'Generate Invoice',
      jobDetails: 'Job Details',
      date: 'Date',
      images: 'Images',
      close: 'Close',
      editJob: 'Edit Job',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      markPaid: 'Mark Paid',
      noJobsFound: 'No jobs found matching your filters.',
      actions: 'Actions',
      // Reports
      reportsTitle: 'Reports & Analytics',
      reportsDescription: 'Business insights and performance metrics',
      startDate: 'Start Date',
      endDate: 'End Date',
      allWorkers: 'All Workers',
      service: 'Service',
      exportCSV: 'Export CSV',
      totalRevenue: 'Total Revenue',
      paidAmount: 'Paid Amount',
      pendingAmount: 'Pending Amount',
      workerPerformance: 'Worker Performance',
      jobsCompleted: 'jobs completed',
      avg: 'avg',
      serviceTypeBreakdown: 'Service Type Breakdown',
      jobs: 'jobs',
      monthRevenueTrend: '6-Month Revenue Trend',
      recentJobs: 'Recent Jobs',
      // WorkerManagement
      workerManagementTitle: 'Worker Management',
      workerManagementDescription: 'Manage your construction team',
      addWorker: 'Add Worker',
      active: 'Active',
      inactive: 'Inactive',
      edit: 'Edit',
      deactivate: 'Deactivate',
      activate: 'Activate',
      delete: 'Delete',
      confirmDeleteWorker: 'Are you sure you want to delete this worker?',
      addNewWorker: 'Add New Worker',
      fullName: 'Full Name',
      phoneNumber: 'Phone Number',
      specialty: 'Specialty',
      selectSpecialty: 'Select Specialty',
      activeWorkerDescription: 'Active worker (can receive job assignments)',
      updateWorker: 'Update Worker',
      noWorkersYet: 'No workers yet',
      getStartedAddWorker: 'Get started by adding your first worker to the team.',
      addYourFirstWorker: 'Add Your First Worker',
      fillNameSpecialty: 'Please fill in name and specialty',
      editWorker: 'Edit Worker',
      // InvoiceGenerator
      generateInvoiceTitle: 'Generate Invoice',
      invoiceInformation: 'Invoice Information',
      invoiceNumber: 'Invoice Number',
      invoiceDate: 'Invoice Date',
      dueDate: 'Due Date',
      clientName: 'Client Name',
      clientAddress: 'Client Address',
      notes: 'Notes',
      selectJobsToInclude: 'Select Jobs to Include',
      jobsSelected: 'jobs selected',
      total: 'Total',
      generatePdfInvoice: 'Generate PDF Invoice',
      // Service Types - dynamically generated from serviceTypesData
      ...Object.fromEntries(serviceTypesData.map(s => [s.key, s.en]))
    },
    pt: {
      appTitle: 'Gerenciador ConstructAI',
      workerSubmission: 'Submissão de Trabalhadores',
      managementDashboard: 'Painel de Gestão',
      reports: 'Relatórios',
      workerManagement: 'Gestão de Trabalhadores',
      // WorkerSubmission
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
      worker: 'Trabalhador',
      selectWorker: 'Selecionar Trabalhador',
      serviceType: 'Tipo de Serviço',
      selectServiceType: 'Selecionar Tipo de Serviço',
      location: 'Localização',
      jobDate: 'Data do Trabalho',
      description: 'Descrição',
      amount: 'Valor',
      paymentMethod: 'Método de Pagamento',
      uploadImages: 'Carregar Imagens',
      submitJob: 'Enviar Trabalho',
      remove: 'Remover',
      clickToUpload: 'Clique para carregar',
      orDragAndDrop: 'ou arraste e solte',
      imageFormats: 'SVG, PNG, JPG ou GIF (MÁX. 800x400px)',
      // Dashboard
      dashboardTitle: 'Painel de Gestão',
      dashboardDescription: 'Monitore envios de trabalho e gerencie pagamentos',
      totalJobs: 'Total de Trabalhos',
      totalValue: 'Valor Total',
      paid: 'Pago',
      pending: 'Pendente',
      searchJobsPlaceholder: 'Buscar trabalhos...',
      allStatus: 'Todos os Status',
      statusPending: 'Pendente',
      statusPaid: 'Pago',
      statusOverdue: 'Atrasado',
      allServices: 'Todos os Serviços',
      generateInvoice: 'Gerar Fatura',
      jobDetails: 'Detalhes do Trabalho',
      date: 'Data',
      images: 'Imagens',
      close: 'Fechar',
      editJob: 'Editar Trabalho',
      saveChanges: 'Salvar Alterações',
      cancel: 'Cancelar',
      markPaid: 'Marcar como Pago',
      noJobsFound: 'Nenhum trabalho encontrado para os filtros.',
      actions: 'Ações',
      // Reports
      reportsTitle: 'Relatórios e Análises',
      reportsDescription: 'Insights de negócios e métricas de desempenho',
      startDate: 'Data de Início',
      endDate: 'Data de Término',
      allWorkers: 'Todos os Trabalhadores',
      service: 'Serviço',
      exportCSV: 'Exportar CSV',
      totalRevenue: 'Receita Total',
      paidAmount: 'Valor Pago',
      pendingAmount: 'Valor Pendente',
      workerPerformance: 'Desempenho do Trabalhador',
      jobsCompleted: 'trabalhos concluídos',
      avg: 'média',
      serviceTypeBreakdown: 'Detalhes por Tipo de Serviço',
      jobs: 'trabalhos',
      monthRevenueTrend: 'Tendência de Receita (6 meses)',
      recentJobs: 'Trabalhos Recentes',
      // WorkerManagement
      workerManagementTitle: 'Gestão de Trabalhadores',
      workerManagementDescription: 'Gerencie sua equipe de construção',
      addWorker: 'Adicionar Trabalhador',
      active: 'Ativo',
      inactive: 'Inativo',
      edit: 'Editar',
      deactivate: 'Desativar',
      activate: 'Ativar',
      delete: 'Excluir',
      confirmDeleteWorker: 'Tem certeza de que deseja excluir este trabalhador?',
      addNewWorker: 'Adicionar Novo Trabalhador',
      fullName: 'Nome Completo',
      phoneNumber: 'Número de Telefone',
      specialty: 'Especialidade',
      selectSpecialty: 'Selecionar Especialidade',
      activeWorkerDescription: 'Trabalhador ativo (pode receber atribuições de trabalho)',
      updateWorker: 'Atualizar Trabalhador',
      noWorkersYet: 'Nenhum trabalhador ainda',
      getStartedAddWorker: 'Comece adicionando seu primeiro trabalhador à equipe.',
      addYourFirstWorker: 'Adicionar Seu Primeiro Trabalhador',
      fillNameSpecialty: 'Por favor, preencha nome e especialidade',
      editWorker: 'Editar Trabalhador',
      // InvoiceGenerator
      generateInvoiceTitle: 'Gerar Fatura',
      invoiceInformation: 'Informações da Fatura',
      invoiceNumber: 'Número da Fatura',
      invoiceDate: 'Data da Fatura',
      dueDate: 'Data de Vencimento',
      clientName: 'Nome do Cliente',
      clientAddress: 'Endereço do Cliente',
      notes: 'Notas',
      selectJobsToInclude: 'Selecionar Trabalhos para Incluir',
      jobsSelected: 'trabalhos selecionados',
      total: 'Total',
      generatePdfInvoice: 'Gerar Fatura em PDF',
      // Service Types
      ...Object.fromEntries(serviceTypesData.map(s => [s.key, s.pt]))
    },
    fr: {
      appTitle: 'Gestionnaire ConstructAI',
      workerSubmission: 'Soumission des Travailleurs',
      managementDashboard: 'Tableau de Bord de Gestion',
      reports: 'Rapports',
      workerManagement: 'Gestion des Travailleurs',
      // WorkerSubmission
      cash: 'Espèces',
      bankTransfer: 'Virement Bancaire',
      check: 'Chèque',
      creditCard: 'Carte de Crédit',
      otherPayment: 'Autre',
      specifyOtherPayment: 'Spécifier un autre mode de paiement',
      fillRequiredFields: 'Veuillez remplir tous les champs obligatoires',
      submissionSuccess: 'Soumission de travail réussie!',
      workerSubmissionTitle: 'Soumission de Travail du Travailleur',
      workerSubmissionDescription: 'Soumettre les détails d\'achèvement du travail avec extraction de données par IA',
      quickAISubmission: 'Saisie Rapide des Détails du Travail',
      aiSubmissionDescription: 'Entrez les détails du travail ci-dessous. L\'IA aidera à analyser et pré-remplir le formulaire.',
      jobDescription: 'Description du Travail',
      jobAddress: 'Adresse du Travail',
      jobValue: 'Valeur du Travail',
      additionalInfo: 'Informations Supplémentaires',
      parseAndFill: 'Analyser et Remplir le Formulaire',
      processing: 'Traitement en cours...',
      worker: 'Travailleur',
      selectWorker: 'Sélectionner un Travailleur',
      serviceType: 'Type de Service',
      selectServiceType: 'Sélectionner le Type de Service',
      location: 'Emplacement',
      jobDate: 'Date du Travail',
      description: 'Description',
      amount: 'Montant',
      paymentMethod: 'Mode de Paiement',
      uploadImages: 'Télécharger des Images',
      submitJob: 'Soumettre le Travail',
      remove: 'Supprimer',
      clickToUpload: 'Cliquez pour télécharger',
      orDragAndDrop: 'ou glissez-déposez',
      imageFormats: 'SVG, PNG, JPG ou GIF (MAX. 800x400px)',
      // Dashboard
      dashboardTitle: 'Tableau de Bord de Gestion',
      dashboardDescription: 'Surveiller les soumissions de travaux et gérer les paiements',
      totalJobs: 'Total des Travaux',
      totalValue: 'Valeur Totale',
      paid: 'Payé',
      pending: 'En Attente',
      searchJobsPlaceholder: 'Rechercher des travaux...',
      allStatus: 'Tous les Statuts',
      statusPending: 'En Attente',
      statusPaid: 'Payé',
      statusOverdue: 'En Retard',
      allServices: 'Tous les Services',
      generateInvoice: 'Générer une Facture',
      jobDetails: 'Détails du Travail',
      date: 'Date',
      images: 'Images',
      close: 'Fermer',
      editJob: 'Modifier le Travail',
      saveChanges: 'Enregistrer les Modifications',
      cancel: 'Annuler',
      markPaid: 'Marquer comme Payé',
      noJobsFound: 'Aucun travail trouvé correspondant à vos filtres.',
      actions: 'Actions',
      // Reports
      reportsTitle: 'Rapports et Analyses',
      reportsDescription: 'Perspectives commerciales et métriques de performance',
      startDate: 'Date de Début',
      endDate: 'Date de Fin',
      allWorkers: 'Tous les Travailleurs',
      service: 'Service',
      exportCSV: 'Exporter CSV',
      totalRevenue: 'Revenu Total',
      paidAmount: 'Montant Payé',
      pendingAmount: 'Montant En Attente',
      workerPerformance: 'Performance du Travailleur',
      jobsCompleted: 'travaux terminés',
      avg: 'moy',
      serviceTypeBreakdown: 'Répartition par Type de Service',
      jobs: 'travaux',
      monthRevenueTrend: 'Tendance des Revenus (6 mois)',
      recentJobs: 'Travaux Récents',
      // WorkerManagement
      workerManagementTitle: 'Gestion des Travailleurs',
      workerManagementDescription: 'Gérez votre équipe de construction',
      addWorker: 'Ajouter un Travailleur',
      active: 'Actif',
      inactive: 'Inactif',
      edit: 'Modifier',
      deactivate: 'Désactiver',
      activate: 'Activer',
      delete: 'Supprimer',
      confirmDeleteWorker: 'Êtes-vous sûr de vouloir supprimer ce travailleur?',
      addNewWorker: 'Ajouter un Nouveau Travailleur',
      fullName: 'Nom Complet',
      phoneNumber: 'Numéro de Téléphone',
      specialty: 'Spécialité',
      selectSpecialty: 'Sélectionner la Spécialité',
      activeWorkerDescription: 'Travailleur actif (peut recevoir des affectations de travail)',
      updateWorker: 'Mettre à Jour le Travailleur',
      noWorkersYet: 'Aucun travailleur pour le moment',
      getStartedAddWorker: 'Commencez en ajoutant votre premier travailleur à l\'équipe.',
      addYourFirstWorker: 'Ajouter Votre Premier Travailleur',
      fillNameSpecialty: 'Veuillez remplir le nom et la spécialité',
      editWorker: 'Modifier le Travailleur',
      // InvoiceGenerator
      generateInvoiceTitle: 'Générer une Facture',
      invoiceInformation: 'Informations sur la Facture',
      invoiceNumber: 'Numéro de Facture',
      invoiceDate: 'Date de la Facture',
      dueDate: 'Date d\'Échéance',
      clientName: 'Nom du Client',
      clientAddress: 'Adresse du Client',
      notes: 'Notes',
      selectJobsToInclude: 'Sélectionner les Travaux à Inclure',
      jobsSelected: 'travaux sélectionnés',
      total: 'Total',
      generatePdfInvoice: 'Générer une Facture PDF',
      // Service Types
      ...Object.fromEntries(serviceTypesData.map(s => [s.key, s.fr]))
    },
    es: {
      appTitle: 'Gerente ConstructAI',
      workerSubmission: 'Envío de Trabajadores',
      managementDashboard: 'Panel de Gestión',
      reports: 'Informes',
      workerManagement: 'Gestión de Trabajadores',
      // WorkerSubmission
      cash: 'Efectivo',
      bankTransfer: 'Transferencia Bancaria',
      check: 'Cheque',
      creditCard: 'Tarjeta de Crédito',
      otherPayment: 'Otro',
      specifyOtherPayment: 'Especificar otro método de pago',
      fillRequiredFields: 'Por favor, complete todos los campos obligatorios',
      submissionSuccess: '¡Envío de trabajo exitoso!',
      workerSubmissionTitle: 'Envío de Trabajo del Trabajador',
      workerSubmissionDescription: 'Enviar detalles de finalización del trabajo con extracción de datos por IA',
      quickAISubmission: 'Entrada Rápida de Detalles del Trabajo',
      aiSubmissionDescription: 'Ingrese los detalles del trabajo a continuación. La IA ayudará a analizar y prellenar el formulario.',
      jobDescription: 'Descripción del Trabajo',
      jobAddress: 'Dirección del Trabajo',
      jobValue: 'Valor del Trabajo',
      additionalInfo: 'Información Adicional',
      parseAndFill: 'Analizar y Rellenar Formulario',
      processing: 'Procesando...',
      worker: 'Trabajador',
      selectWorker: 'Seleccionar Trabajador',
      serviceType: 'Tipo de Servicio',
      selectServiceType: 'Seleccionar Tipo de Servicio',
      location: 'Ubicación',
      jobDate: 'Fecha del Trabajo',
      description: 'Descripción',
      amount: 'Monto',
      paymentMethod: 'Método de Pago',
      uploadImages: 'Subir Imágenes',
      submitJob: 'Enviar Trabajo',
      remove: 'Eliminar',
      clickToUpload: 'Haga clic para subir',
      orDragAndDrop: 'o arrastre y suelte',
      imageFormats: 'SVG, PNG, JPG o GIF (MÁX. 800x400px)',
      // Dashboard
      dashboardTitle: 'Panel de Gestión',
      dashboardDescription: 'Monitorear envíos de trabajos y gestionar pagos',
      totalJobs: 'Total de Trabajos',
      totalValue: 'Valor Total',
      paid: 'Pagado',
      pending: 'Pendiente',
      searchJobsPlaceholder: 'Buscar trabajos...',
      allStatus: 'Todos los Estados',
      statusPending: 'Pendiente',
      statusPaid: 'Pagado',
      statusOverdue: 'Vencido',
      allServices: 'Todos los Servicios',
      generateInvoice: 'Generar Factura',
      jobDetails: 'Detalles del Trabajo',
      date: 'Fecha',
      images: 'Imágenes',
      close: 'Cerrar',
      editJob: 'Editar Trabajo',
      saveChanges: 'Guardar Cambios',
      cancel: 'Cancelar',
      markPaid: 'Marcar como Pagado',
      noJobsFound: 'No se encontraron trabajos que coincidan con sus filtros.',
      actions: 'Acciones',
      // Reports
      reportsTitle: 'Informes y Análisis',
      reportsDescription: 'Perspectivas comerciales y métricas de rendimiento',
      startDate: 'Fecha de Inicio',
      endDate: 'Fecha de Fin',
      allWorkers: 'Todos los Trabajadores',
      service: 'Servicio',
      exportCSV: 'Exportar CSV',
      totalRevenue: 'Ingresos Totales',
      paidAmount: 'Monto Pagado',
      pendingAmount: 'Monto Pendiente',
      workerPerformance: 'Rendimiento del Trabajador',
      jobsCompleted: 'trabajos completados',
      avg: 'prom',
      serviceTypeBreakdown: 'Desglose por Tipo de Servicio',
      jobs: 'trabajos',
      monthRevenueTrend: 'Tendencia de Ingresos (6 meses)',
      recentJobs: 'Trabajos Recientes',
      // WorkerManagement
      workerManagementTitle: 'Gestión de Trabajadores',
      workerManagementDescription: 'Administre su equipo de construcción',
      addWorker: 'Agregar Trabajador',
      active: 'Activo',
      inactive: 'Inactivo',
      edit: 'Editar',
      deactivate: 'Desactivar',
      activate: 'Activar',
      delete: 'Eliminar',
      confirmDeleteWorker: '¿Está seguro de que desea eliminar este trabajador?',
      addNewWorker: 'Agregar Nuevo Trabajador',
      fullName: 'Nombre Completo',
      phoneNumber: 'Número de Teléfono',
      specialty: 'Especialidad',
      selectSpecialty: 'Seleccionar Especialidad',
      activeWorkerDescription: 'Trabajador activo (puede recibir asignaciones de trabajo)',
      updateWorker: 'Actualizar Trabajador',
      noWorkersYet: 'Aún no hay trabajadores',
      getStartedAddWorker: 'Comience agregando su primer trabajador al equipo.',
      addYourFirstWorker: 'Agregar Su Primer Trabajador',
      fillNameSpecialty: 'Por favor, complete nombre y especialidad',
      editWorker: 'Editar Trabajador',
      // InvoiceGenerator
      generateInvoiceTitle: 'Generar Factura',
      invoiceInformation: 'Información de la Factura',
      invoiceNumber: 'Número de Factura',
      invoiceDate: 'Fecha de la Factura',
      dueDate: 'Fecha de Vencimiento',
      clientName: 'Nombre del Cliente',
      clientAddress: 'Dirección del Cliente',
      notes: 'Notas',
      selectJobsToInclude: 'Seleccionar Trabajos para Incluir',
      jobsSelected: 'trabajos seleccionados',
      total: 'Total',
      generatePdfInvoice: 'Generar Factura PDF',
      // Service Types
      ...Object.fromEntries(serviceTypesData.map(s => [s.key, s.es]))
    },
    de: {
      appTitle: 'ConstructAI Manager',
      workerSubmission: 'Arbeiter-Einreichung',
      managementDashboard: 'Management-Dashboard',
      reports: 'Berichte',
      workerManagement: 'Arbeiterverwaltung',
      // WorkerSubmission
      cash: 'Bargeld',
      bankTransfer: 'Banküberweisung',
      check: 'Scheck',
      creditCard: 'Kreditkarte',
      otherPayment: 'Andere',
      specifyOtherPayment: 'Andere Zahlungsmethode angeben',
      fillRequiredFields: 'Bitte füllen Sie alle Pflichtfelder aus',
      submissionSuccess: 'Auftragsübermittlung erfolgreich!',
      workerSubmissionTitle: 'Arbeiter-Auftragsübermittlung',
      workerSubmissionDescription: 'Übermitteln Sie Auftragsabschlussdetails mit KI-gestützter Datenextraktion',
      quickAISubmission: 'Schnelle Auftragseingabe',
      aiSubmissionDescription: 'Geben Sie die Auftragsdetails unten ein. Die KI hilft beim Parsen und Vorabausfüllen des Formulars.',
      jobDescription: 'Auftragsbeschreibung',
      jobAddress: 'Auftragsadresse',
      jobValue: 'Auftragswert',
      additionalInfo: 'Zusätzliche Informationen',
      parseAndFill: 'Parsen & Formular ausfüllen',
      processing: 'Verarbeitung...',
      worker: 'Arbeiter',
      selectWorker: 'Arbeiter auswählen',
      serviceType: 'Dienstleistungstyp',
      selectServiceType: 'Dienstleistungstyp auswählen',
      location: 'Standort',
      jobDate: 'Auftragsdatum',
      description: 'Beschreibung',
      amount: 'Betrag',
      paymentMethod: 'Zahlungsmethode',
      uploadImages: 'Bilder hochladen',
      submitJob: 'Auftrag übermitteln',
      remove: 'Entfernen',
      clickToUpload: 'Zum Hochladen klicken',
      orDragAndDrop: 'oder ziehen und ablegen',
      imageFormats: 'SVG, PNG, JPG oder GIF (MAX. 800x400px)',
      // Dashboard
      dashboardTitle: 'Management-Dashboard',
      dashboardDescription: 'Auftragsübermittlungen überwachen und Zahlungen verwalten',
      totalJobs: 'Gesamtanzahl Aufträge',
      totalValue: 'Gesamtwert',
      paid: 'Bezahlt',
      pending: 'Ausstehend',
      searchJobsPlaceholder: 'Aufträge suchen...',
      allStatus: 'Alle Status',
      statusPending: 'Ausstehend',
      statusPaid: 'Bezahlt',
      statusOverdue: 'Überfällig',
      allServices: 'Alle Dienstleistungen',
      generateInvoice: 'Rechnung generieren',
      jobDetails: 'Auftragsdetails',
      date: 'Datum',
      images: 'Bilder',
      close: 'Schließen',
      editJob: 'Auftrag bearbeiten',
      saveChanges: 'Änderungen speichern',
      cancel: 'Abbrechen',
      markPaid: 'Als bezahlt markieren',
      noJobsFound: 'Keine Aufträge gefunden, die Ihren Filtern entsprechen.',
      actions: 'Aktionen',
      // Reports
      reportsTitle: 'Berichte & Analysen',
      reportsDescription: 'Geschäftseinblicke und Leistungsmetriken',
      startDate: 'Startdatum',
      endDate: 'Enddatum',
      allWorkers: 'Alle Arbeiter',
      service: 'Dienstleistung',
      exportCSV: 'CSV exportieren',
      totalRevenue: 'Gesamteinnahmen',
      paidAmount: 'Bezahlter Betrag',
      pendingAmount: 'Ausstehender Betrag',
      workerPerformance: 'Arbeiterleistung',
      jobsCompleted: 'abgeschlossene Aufträge',
      avg: 'Durchschnitt',
      serviceTypeBreakdown: 'Aufschlüsselung nach Dienstleistungstyp',
      jobs: 'Aufträge',
      monthRevenueTrend: '6-Monats-Umsatztrend',
      recentJobs: 'Aktuelle Aufträge',
      // WorkerManagement
      workerManagementTitle: 'Arbeiterverwaltung',
      workerManagementDescription: 'Verwalten Sie Ihr Bauteam',
      addWorker: 'Arbeiter hinzufügen',
      active: 'Aktiv',
      inactive: 'Inaktiv',
      edit: 'Bearbeiten',
      deactivate: 'Deaktivieren',
      activate: 'Aktivieren',
      delete: 'Löschen',
      confirmDeleteWorker: 'Sind Sie sicher, dass Sie diesen Arbeiter löschen möchten?',
      addNewWorker: 'Neuen Arbeiter hinzufügen',
      fullName: 'Vollständiger Name',
      phoneNumber: 'Telefonnummer',
      specialty: 'Spezialität',
      selectSpecialty: 'Spezialität auswählen',
      activeWorkerDescription: 'Aktiver Arbeiter (kann Auftragszuweisungen erhalten)',
      updateWorker: 'Arbeiter aktualisieren',
      noWorkersYet: 'Noch keine Arbeiter',
      getStartedAddWorker: 'Beginnen Sie, indem Sie Ihren ersten Arbeiter zum Team hinzufügen.',
      addYourFirstWorker: 'Ersten Arbeiter hinzufügen',
      fillNameSpecialty: 'Bitte Namen und Spezialität eingeben',
      editWorker: 'Arbeiter bearbeiten',
      // InvoiceGenerator
      generateInvoiceTitle: 'Rechnung generieren',
      invoiceInformation: 'Rechnungsinformationen',
      invoiceNumber: 'Rechnungsnummer',
      invoiceDate: 'Rechnungsdatum',
      dueDate: 'Fälligkeitsdatum',
      clientName: 'Kundenname',
      clientAddress: 'Kundenadresse',
      notes: 'Notizen',
      selectJobsToInclude: 'Aufträge zur Aufnahme auswählen',
      jobsSelected: 'Aufträge ausgewählt',
      total: 'Gesamt',
      generatePdfInvoice: 'PDF-Rechnung generieren',
      // Service Types
      ...Object.fromEntries(serviceTypesData.map(s => [s.key, s.de]))
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

  const navigation = allNavigation.filter(item => item.roles.includes(userRole));

  const renderActiveComponent = () => {
    if (!userRole) return null; // Don't render anything until role is loaded

    switch (activeTab) {
      case 'submission':
        return userRole === 'worker' || userRole === 'manager' ? <WorkerSubmission onSubmit={addJob} workers={workers} language={language} translations={translations} serviceTypes={serviceTypesData} /> : null;
      case 'dashboard':
        return userRole === 'manager' ? <Dashboard jobs={jobs} workers={workers} onUpdateJob={updateJob} onDeleteJob={deleteJob} language={language} translations={translations} /> : null;
      case 'reports':
        return userRole === 'manager' ? <Reports jobs={jobs} workers={workers} language={language} translations={translations} /> : null;
      case 'workers':
        return userRole === 'manager' ? <WorkerManagement workers={workers} setWorkers={setWorkers} language={language} translations={translations} serviceTypes={serviceTypesData} /> : null;
      default:
        // Default to the first available tab for the user's role
        const firstAllowedTab = navigation[0]?.id;
        if (firstAllowedTab === 'submission') {
          return <WorkerSubmission onSubmit={addJob} workers={workers} language={language} translations={translations} serviceTypes={serviceTypesData} />;
        } else if (firstAllowedTab === 'dashboard') {
          return <Dashboard jobs={jobs} workers={workers} onUpdateJob={updateJob} onDeleteJob={deleteJob} language={language} translations={translations} />;
        } else if (firstAllowedTab === 'reports') {
          return <Reports jobs={jobs} workers={workers} language={language} translations={translations} />;
        } else if (firstAllowedTab === 'workers') {
          return <WorkerManagement workers={workers} setWorkers={setWorkers} language={language} translations={translations} serviceTypes={serviceTypesData} />;
        }
        return null; // Should not happen if navigation is properly filtered
    }
  };

  if (!session) {
    return <Auth />;
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

            {/* Language Selector */}
            <div className="flex items-center">
              <LanguageSelector
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
              {session && (
                <button
                  onClick={async () => {
                    const { error } = await supabase.auth.signOut();
                    if (error) console.error("Error signing out:", error.message);
                  }}
                  className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
              )}
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

