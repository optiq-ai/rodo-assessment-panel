import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Table, Badge, Row, Col, InputGroup, OverlayTrigger, Tooltip, Modal, Alert, Tabs, Tab, Dropdown, ButtonGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faCheck, faTimes, faInfoCircle, faExclamationTriangle, faDownload, faFilter, faSort, faCalendarAlt, faUser, faExclamationCircle, faSave, faFileExport, faLink, faSearch, faTasks } from '@fortawesome/free-solid-svg-icons';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Komponent sekcji działań naprawczych dla oceny RODO
 * 
 * Funkcjonalności:
 * - Automatyczne generowanie rekomendacji na podstawie wyników oceny
 * - Miejsce na określenie osób odpowiedzialnych i terminów realizacji
 * - Śledzenie postępu wdrażania działań naprawczych
 * - Możliwość dodawania własnych działań naprawczych
 * - Filtrowanie i sortowanie działań
 * - Eksport listy działań do CSV/PDF
 * - Powiadomienia o zbliżających się terminach
 * - Powiązanie działań z wymaganiami RODO
 * - Śledzenie historii zmian statusów
 */
const RemedialActionsSection = ({ assessmentData }) => {
  // Mockowe dane dla działań naprawczych
  const initialActions = [
    {
      id: 1,
      area: 'Bezpieczeństwo danych',
      issue: 'Brak regularnych szkoleń z zakresu bezpieczeństwa danych',
      recommendation: 'Wdrożyć cykliczne szkolenia dla wszystkich pracowników z zakresu bezpieczeństwa danych osobowych',
      priority: 'Wysoki',
      responsiblePerson: 'Jan Kowalski',
      deadline: '2025-06-30',
      status: 'W trakcie',
      progress: 30,
      notes: 'Przygotowano materiały szkoleniowe, ustalono harmonogram szkoleń',
      rodoArticles: ['Art. 32', 'Art. 39'],
      statusHistory: [
        { date: '2025-03-15', status: 'Nierozpoczęte', user: 'Anna Nowak' },
        { date: '2025-04-01', status: 'W trakcie', user: 'Jan Kowalski' }
      ],
      attachments: ['Harmonogram_szkolen.pdf']
    },
    {
      id: 2,
      area: 'Prawa podmiotów danych',
      issue: 'Brak procedury obsługi wniosków o dostęp do danych',
      recommendation: 'Opracować i wdrożyć procedurę obsługi wniosków o dostęp do danych osobowych',
      priority: 'Krytyczny',
      responsiblePerson: 'Anna Nowak',
      deadline: '2025-05-15',
      status: 'Nierozpoczęte',
      progress: 0,
      notes: '',
      rodoArticles: ['Art. 15', 'Art. 12'],
      statusHistory: [
        { date: '2025-03-15', status: 'Nierozpoczęte', user: 'Anna Nowak' }
      ],
      attachments: []
    },
    {
      id: 3,
      area: 'Dokumentacja',
      issue: 'Nieaktualna polityka ochrony danych osobowych',
      recommendation: 'Zaktualizować politykę ochrony danych osobowych zgodnie z najnowszymi wytycznymi',
      priority: 'Średni',
      responsiblePerson: 'Piotr Wiśniewski',
      deadline: '2025-07-31',
      status: 'Zakończone',
      progress: 100,
      notes: 'Polityka została zaktualizowana i zatwierdzona przez zarząd',
      rodoArticles: ['Art. 24', 'Art. 5'],
      statusHistory: [
        { date: '2025-02-10', status: 'Nierozpoczęte', user: 'Anna Nowak' },
        { date: '2025-03-05', status: 'W trakcie', user: 'Piotr Wiśniewski' },
        { date: '2025-04-12', status: 'Zakończone', user: 'Piotr Wiśniewski' }
      ],
      attachments: ['Polityka_RODO_v2.pdf', 'Protokol_zatwierdzenia.pdf']
    },
    {
      id: 4,
      area: 'Zgody na przetwarzanie',
      issue: 'Formularze zgód nie spełniają wymogów RODO',
      recommendation: 'Przeprojektować formularze zgód zgodnie z wymogami RODO (dobrowolność, konkretność, świadomość)',
      priority: 'Wysoki',
      responsiblePerson: 'Magdalena Kowalczyk',
      deadline: '2025-05-30',
      status: 'W trakcie',
      progress: 60,
      notes: 'Nowe formularze zostały opracowane, oczekują na zatwierdzenie przez dział prawny',
      rodoArticles: ['Art. 7', 'Art. 8'],
      statusHistory: [
        { date: '2025-02-20', status: 'Nierozpoczęte', user: 'Anna Nowak' },
        { date: '2025-03-10', status: 'W trakcie', user: 'Magdalena Kowalczyk' }
      ],
      attachments: ['Nowe_formularze_zgod.docx']
    }
  ];

  const [remedialActions, setRemedialActions] = useState(initialActions);
  const [newAction, setNewAction] = useState({
    area: '',
    issue: '',
    recommendation: '',
    priority: 'Średni',
    responsiblePerson: '',
    deadline: '',
    status: 'Nierozpoczęte',
    progress: 0,
    notes: '',
    rodoArticles: [],
    statusHistory: [],
    attachments: []
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Wszystkie');
  const [filterPriority, setFilterPriority] = useState('Wszystkie');
  const [filterArea, setFilterArea] = useState('Wszystkie');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingActionId, setEditingActionId] = useState(null);
  const [sortField, setSortField] = useState('deadline');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [showArticlesModal, setShowArticlesModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const csvLink = useRef();
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Generowanie unikalnych obszarów dla filtrowania
  const uniqueAreas = ['Wszystkie', ...new Set(remedialActions.map(action => action.area))];

  // Efekt do sprawdzania zbliżających się terminów
  useEffect(() => {
    // W rzeczywistej aplikacji, tutaj byłoby sprawdzanie terminów
    // i wyświetlanie powiadomień
  }, [remedialActions]);

  // Generowanie rekomendacji na podstawie wyników oceny
  const generateRecommendations = () => {
    // W rzeczywistej implementacji, tutaj byłaby logika analizująca wyniki oceny
    // i generująca odpowiednie rekomendacje
    
    // Przykładowe nowe rekomendacje
    const newRecommendations = [
      {
        id: remedialActions.length + 1,
        area: 'Retencja danych',
        issue: 'Brak polityki retencji danych',
        recommendation: 'Opracować i wdrożyć politykę retencji danych określającą okresy przechowywania różnych kategorii danych',
        priority: 'Wysoki',
        responsiblePerson: '',
        deadline: '',
        status: 'Nierozpoczęte',
        progress: 0,
        notes: 'Automatycznie wygenerowane na podstawie wyników oceny',
        rodoArticles: ['Art. 5', 'Art. 17', 'Art. 30'],
        statusHistory: [
          { date: new Date().toISOString().split('T')[0], status: 'Nierozpoczęte', user: 'System' }
        ],
        attachments: []
      },
      {
        id: remedialActions.length + 2,
        area: 'Ocena skutków',
        issue: 'Brak przeprowadzonej oceny skutków dla ochrony danych (DPIA)',
        recommendation: 'Przeprowadzić DPIA dla procesów przetwarzania wysokiego ryzyka',
        priority: 'Krytyczny',
        responsiblePerson: '',
        deadline: '',
        status: 'Nierozpoczęte',
        progress: 0,
        notes: 'Automatycznie wygenerowane na podstawie wyników oceny',
        rodoArticles: ['Art. 35', 'Art. 36'],
        statusHistory: [
          { date: new Date().toISOString().split('T')[0], status: 'Nierozpoczęte', user: 'System' }
        ],
        attachments: []
      }
    ];
    
    setRemedialActions([...remedialActions, ...newRecommendations]);
  };

  // Obsługa dodawania nowego działania naprawczego
  const handleAddAction = () => {
    const today = new Date().toISOString().split('T')[0];
    const actionWithId = {
      ...newAction,
      id: remedialActions.length + 1,
      statusHistory: [
        { date: today, status: 'Nierozpoczęte', user: 'Aktualny użytkownik' }
      ]
    };
    
    setRemedialActions([...remedialActions, actionWithId]);
    setNewAction({
      area: '',
      issue: '',
      recommendation: '',
      priority: 'Średni',
      responsiblePerson: '',
      deadline: '',
      status: 'Nierozpoczęte',
      progress: 0,
      notes: '',
      rodoArticles: [],
      statusHistory: [],
      attachments: []
    });
    setShowAddForm(false);
  };

  // Obsługa usuwania działania naprawczego
  const handleDeleteAction = (id) => {
    setRemedialActions(remedialActions.filter(action => action.id !== id));
  };

  // Obsługa edycji działania naprawczego
  const handleEditAction = (id) => {
    setEditingActionId(id);
  };

  // Obsługa zapisywania zmian w działaniu naprawczym
  const handleSaveEdit = (id, updatedAction) => {
    setRemedialActions(remedialActions.map(action => 
      action.id === id ? { ...action, ...updatedAction } : action
    ));
    setEditingActionId(null);
  };

  // Obsługa zmiany statusu działania naprawczego
  const handleStatusChange = (id, newStatus) => {
    const today = new Date().toISOString().split('T')[0];
    
    setRemedialActions(remedialActions.map(action => {
      if (action.id === id) {
        const updatedAction = { 
          ...action, 
          status: newStatus,
          progress: newStatus === 'Zakończone' ? 100 : (newStatus === 'Nierozpoczęte' ? 0 : action.progress),
          statusHistory: [
            ...action.statusHistory,
            { date: today, status: newStatus, user: 'Aktualny użytkownik' }
          ]
        };
        return updatedAction;
      }
      return action;
    }));
  };

  // Obsługa dodawania artykułu RODO
  const handleAddRodoArticle = (id, article) => {
    setRemedialActions(remedialActions.map(action => {
      if (action.id === id && !action.rodoArticles.includes(article)) {
        return {
          ...action,
          rodoArticles: [...action.rodoArticles, article]
        };
      }
      return action;
    }));
  };

  // Obsługa usuwania artykułu RODO
  const handleRemoveRodoArticle = (id, article) => {
    setRemedialActions(remedialActions.map(action => {
      if (action.id === id) {
        return {
          ...action,
          rodoArticles: action.rodoArticles.filter(a => a !== article)
        };
      }
      return action;
    }));
  };

  // Obsługa dodawania załącznika
  const handleAddAttachment = (id, attachment) => {
    setRemedialActions(remedialActions.map(action => {
      if (action.id === id && !action.attachments.includes(attachment)) {
        return {
          ...action,
          attachments: [...action.attachments, attachment]
        };
      }
      return action;
    }));
  };

  // Obsługa usuwania załącznika
  const handleRemoveAttachment = (id, attachment) => {
    setRemedialActions(remedialActions.map(action => {
      if (action.id === id) {
        return {
          ...action,
          attachments: action.attachments.filter(a => a !== attachment)
        };
      }
      return action;
    }));
  };

  // Filtrowanie działań naprawczych
  const filteredActions = remedialActions.filter(action => {
    const statusMatch = filterStatus === 'Wszystkie' || action.status === filterStatus;
    const priorityMatch = filterPriority === 'Wszystkie' || action.priority === filterPriority;
    const areaMatch = filterArea === 'Wszystkie' || action.area === filterArea;
    const searchMatch = searchTerm === '' || 
      action.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.recommendation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrowanie według zakładek
    if (activeTab === 'upcoming') {
      const today = new Date();
      const deadline = new Date(action.deadline);
      const diffTime = deadline - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return statusMatch && priorityMatch && areaMatch && searchMatch && 
             action.status !== 'Zakończone' && action.deadline && diffDays <= 14;
    } else if (activeTab === 'critical') {
      return statusMatch && areaMatch && searchMatch && action.priority === 'Krytyczny' && action.status !== 'Zakończone';
    } else if (activeTab === 'completed') {
      return priorityMatch && areaMatch && searchMatch && action.status === 'Zakończone';
    } else {
      return statusMatch && priorityMatch && areaMatch && searchMatch;
    }
  });

  // Sortowanie działań naprawczych
  const sortedActions = [...filteredActions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'priority':
        const priorityOrder = { 'Krytyczny': 1, 'Wysoki': 2, 'Średni': 3, 'Niski': 4 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'deadline':
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        comparison = new Date(a.deadline) - new Date(b.deadline);
        break;
      case 'status':
        const statusOrder = { 'Nierozpoczęte': 1, 'W trakcie': 2, 'Zakończone': 3 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      case 'progress':
        comparison = a.progress - b.progress;
        break;
      default:
        comparison = a[sortField] > b[sortField] ? 1 : -1;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Funkcja pomocnicza do renderowania badge'a priorytetu
  const renderPriorityBadge = (priority) => {
    let variant = 'secondary';
    
    switch(priority) {
      case 'Krytyczny':
        variant = 'danger';
        break;
      case 'Wysoki':
        variant = 'warning';
        break;
      case 'Średni':
        variant = 'info';
        break;
      case 'Niski':
        variant = 'success';
        break;
      default:
        variant = 'secondary';
    }
    
    return <Badge bg={variant}>{priority}</Badge>;
  };

  // Funkcja pomocnicza do renderowania badge'a statusu
  const renderStatusBadge = (status) => {
    let variant = 'secondary';
    
    switch(status) {
      case 'Nierozpoczęte':
        variant = 'danger';
        break;
      case 'W trakcie':
        variant = 'warning';
        break;
      case 'Zakończone':
        variant = 'success';
        break;
      default:
        variant = 'secondary';
    }
    
    return <Badge bg={variant}>{status}</Badge>;
  };

  // Funkcja do sprawdzania, czy termin jest bliski
  const isDeadlineNear = (deadline) => {
    if (!deadline) return false;
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 14 && diffDays >= 0;
  };

  // Funkcja do sprawdzania, czy termin jest przekroczony
  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    
    return today > deadlineDate;
  };

  // Funkcja do eksportu do CSV
  const prepareCSVData = () => {
    return sortedActions.map(action => ({
      ID: action.id,
      Obszar: action.area,
      Problem: action.issue,
      Rekomendacja: action.recommendation,
      Priorytet: action.priority,
      'Osoba odpowiedzialna': action.responsiblePerson,
      'Termin realizacji': action.deadline,
      Status: action.status,
      Postęp: `${action.progress}%`,
      Notatki: action.notes,
      'Artykuły RODO': action.rodoArticles.join(', '),
      'Ostatnia aktualizacja': action.statusHistory[action.statusHistory.length - 1]?.date || ''
    }));
  };

  // Funkcja do eksportu do PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Tytuł
    doc.setFontSize(18);
    doc.text('Lista działań naprawczych RODO', 14, 22);
    
    // Data wygenerowania
    doc.setFontSize(10);
    doc.text(`Wygenerowano: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Tabela
    const tableColumn = ["ID", "Obszar", "Problem", "Priorytet", "Status", "Termin", "Postęp"];
    const tableRows = [];
    
    sortedActions.forEach(action => {
      const actionData = [
        action.id,
        action.area,
        action.issue,
        action.priority,
        action.status,
        action.deadline,
        `${action.progress}%`
      ];
      tableRows.push(actionData);
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 35 }
    });
    
    // Podsumowanie
    const finalY = doc.lastAutoTable.finalY || 35;
    doc.setFontSize(12);
    doc.text('Podsumowanie:', 14, finalY + 10);
    doc.setFontSize(10);
    doc.text(`Łączna liczba działań: ${sortedActions.length}`, 14, finalY + 20);
    doc.text(`Zakończone: ${sortedActions.filter(a => a.status === 'Zakończone').length}`, 14, finalY + 30);
    doc.text(`W trakcie: ${sortedActions.filter(a => a.status === 'W trakcie').length}`, 14, finalY + 40);
    doc.text(`Nierozpoczęte: ${sortedActions.filter(a => a.status === 'Nierozpoczęte').length}`, 14, finalY + 50);
    
    // Zapisz PDF
    doc.save('dzialania-naprawcze-rodo.pdf');
  };

  // Funkcja do pokazywania historii statusów
  const showHistory = (action) => {
    setSelectedAction(action);
    setShowHistoryModal(true);
  };

  // Funkcja do pokazywania załączników
  const showAttachments = (action) => {
    setSelectedAction(action);
    setShowAttachmentsModal(true);
  };

  // Funkcja do pokazywania artykułów RODO
  const showArticles = (action) => {
    setSelectedAction(action);
    setShowArticlesModal(true);
  };

  // Funkcja do zmiany sortowania
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Funkcja do renderowania ikony sortowania
  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    
    return (
      <FontAwesomeIcon 
        icon={faSort} 
        className="ms-1" 
        style={{ 
          transform: sortDirection === 'asc' ? 'rotate(0deg)' : 'rotate(180deg)',
          transition: 'transform 0.2s'
        }} 
      />
    );
  };

  // Obliczanie statystyk
  const stats = {
    total: remedialActions.length,
    completed: remedialActions.filter(a => a.status === 'Zakończone').length,
    inProgress: remedialActions.filter(a => a.status === 'W trakcie').length,
    notStarted: remedialActions.filter(a => a.status === 'Nierozpoczęte').length,
    critical: remedialActions.filter(a => a.priority === 'Krytyczny' && a.status !== 'Zakończone').length,
    upcoming: remedialActions.filter(a => {
      if (!a.deadline || a.status === 'Zakończone') return false;
      const today = new Date();
      const deadline = new Date(a.deadline);
      const diffTime = deadline - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 14 && diffDays >= 0;
    }).length,
    overdue: remedialActions.filter(a => {
      if (!a.deadline || a.status === 'Zakończone') return false;
      const today = new Date();
      const deadline = new Date(a.deadline);
      return today > deadline;
    }).length
  };

  // Obliczanie ogólnego postępu
  const calculateOverallProgress = () => {
    if (remedialActions.length === 0) return 0;
    
    const totalProgress = remedialActions.reduce((sum, action) => sum + action.progress, 0);
    return Math.round(totalProgress / remedialActions.length);
  };

  return (
    <Card className="mb-4 remedial-actions-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FontAwesomeIcon icon={faTasks} className="me-2" />
          Działania naprawcze
        </h5>
        <div>
          <ButtonGroup className="me-2">
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <FontAwesomeIcon icon={faPlus} className="me-1" />
              Dodaj działanie
            </Button>
            <Button 
              variant="outline-success" 
              size="sm"
              onClick={generateRecommendations}
            >
              <FontAwesomeIcon icon={faCheck} className="me-1" />
              Generuj rekomendacje
            </Button>
          </ButtonGroup>
          
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle variant="outline-secondary" size="sm" id="export-dropdown">
              <FontAwesomeIcon icon={faFileExport} className="me-1" />
              Eksportuj
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => csvLink.current.link.click()}>
                Eksportuj do CSV
              </Dropdown.Item>
              <Dropdown.Item onClick={exportToPDF}>
                Eksportuj do PDF
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <CSVLink
            data={prepareCSVData()}
            filename="dzialania-naprawcze-rodo.csv"
            className="d-none"
            ref={csvLink}
            separator=";"
          />
        </div>
      </Card.Header>
      <Card.Body>
        {showAddForm && (
          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">Dodaj nowe działanie naprawcze</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Obszar</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={newAction.area}
                      onChange={(e) => setNewAction({...newAction, area: e.target.value})}
                      placeholder="Np. Bezpieczeństwo danych"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Priorytet</Form.Label>
                    <Form.Select 
                      value={newAction.priority}
                      onChange={(e) => setNewAction({...newAction, priority: e.target.value})}
                    >
                      <option value="Krytyczny">Krytyczny</option>
                      <option value="Wysoki">Wysoki</option>
                      <option value="Średni">Średni</option>
                      <option value="Niski">Niski</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Problem</Form.Label>
                <Form.Control 
                  type="text" 
                  value={newAction.issue}
                  onChange={(e) => setNewAction({...newAction, issue: e.target.value})}
                  placeholder="Opisz zidentyfikowany problem"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Rekomendacja</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2}
                  value={newAction.recommendation}
                  onChange={(e) => setNewAction({...newAction, recommendation: e.target.value})}
                  placeholder="Opisz zalecane działanie naprawcze"
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Osoba odpowiedzialna</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={newAction.responsiblePerson}
                      onChange={(e) => setNewAction({...newAction, responsiblePerson: e.target.value})}
                      placeholder="Imię i nazwisko"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Termin realizacji</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={newAction.deadline}
                      onChange={(e) => setNewAction({...newAction, deadline: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Artykuły RODO</Form.Label>
                <InputGroup>
                  <Form.Control 
                    type="text" 
                    placeholder="Np. Art. 32"
                    value={newAction.rodoArticle || ''}
                    onChange={(e) => setNewAction({...newAction, rodoArticle: e.target.value})}
                  />
                  <Button 
                    variant="outline-secondary"
                    onClick={() => {
                      if (newAction.rodoArticle && !newAction.rodoArticles.includes(newAction.rodoArticle)) {
                        setNewAction({
                          ...newAction, 
                          rodoArticles: [...newAction.rodoArticles, newAction.rodoArticle],
                          rodoArticle: ''
                        });
                      }
                    }}
                  >
                    Dodaj
                  </Button>
                </InputGroup>
                <div className="mt-2">
                  {newAction.rodoArticles.map((article, index) => (
                    <Badge 
                      key={index} 
                      bg="info" 
                      className="me-1 mb-1"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setNewAction({
                          ...newAction,
                          rodoArticles: newAction.rodoArticles.filter(a => a !== article)
                        });
                      }}
                    >
                      {article} <FontAwesomeIcon icon={faTimes} className="ms-1" />
                    </Badge>
                  ))}
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Notatki</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2}
                  value={newAction.notes}
                  onChange={(e) => setNewAction({...newAction, notes: e.target.value})}
                  placeholder="Dodatkowe informacje"
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end">
                <Button 
                  variant="secondary" 
                  className="me-2"
                  onClick={() => setShowAddForm(false)}
                >
                  Anuluj
                </Button>
                <Button 
                  variant="primary"
                  onClick={handleAddAction}
                  disabled={!newAction.area || !newAction.issue || !newAction.recommendation}
                >
                  Dodaj działanie
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
        
        <Row className="mb-4">
          <Col md={12}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Postęp realizacji działań naprawczych</h6>
              <span className="badge bg-primary">{calculateOverallProgress()}%</span>
            </div>
            <div className="progress mb-2" style={{height: '20px'}}>
              <div 
                className="progress-bar bg-success" 
                role="progressbar" 
                style={{width: `${(stats.completed / stats.total) * 100}%`}}
                aria-valuenow={(stats.completed / stats.total) * 100} 
                aria-valuemin="0" 
                aria-valuemax="100"
              >
                Zakończone ({stats.completed})
              </div>
              <div 
                className="progress-bar bg-warning" 
                role="progressbar" 
                style={{width: `${(stats.inProgress / stats.total) * 100}%`}}
                aria-valuenow={(stats.inProgress / stats.total) * 100} 
                aria-valuemin="0" 
                aria-valuemax="100"
              >
                W trakcie ({stats.inProgress})
              </div>
              <div 
                className="progress-bar bg-danger" 
                role="progressbar" 
                style={{width: `${(stats.notStarted / stats.total) * 100}%`}}
                aria-valuenow={(stats.notStarted / stats.total) * 100} 
                aria-valuemin="0" 
                aria-valuemax="100"
              >
                Nierozpoczęte ({stats.notStarted})
              </div>
            </div>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={12}>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-3"
            >
              <Tab 
                eventKey="all" 
                title={
                  <span>
                    Wszystkie <Badge bg="secondary">{stats.total}</Badge>
                  </span>
                }
              />
              <Tab 
                eventKey="upcoming" 
                title={
                  <span>
                    Zbliżające się terminy <Badge bg="warning">{stats.upcoming}</Badge>
                  </span>
                }
              />
              <Tab 
                eventKey="critical" 
                title={
                  <span>
                    Krytyczne <Badge bg="danger">{stats.critical}</Badge>
                  </span>
                }
              />
              <Tab 
                eventKey="completed" 
                title={
                  <span>
                    Zakończone <Badge bg="success">{stats.completed}</Badge>
                  </span>
                }
              />
            </Tabs>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <InputGroup size="sm">
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control 
                  type="text"
                  placeholder="Szukaj..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <InputGroup size="sm">
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faFilter} />
                </InputGroup.Text>
                <Form.Select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="Wszystkie">Wszystkie statusy</option>
                  <option value="Nierozpoczęte">Nierozpoczęte</option>
                  <option value="W trakcie">W trakcie</option>
                  <option value="Zakończone">Zakończone</option>
                </Form.Select>
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <InputGroup size="sm">
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faFilter} />
                </InputGroup.Text>
                <Form.Select 
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="Wszystkie">Wszystkie priorytety</option>
                  <option value="Krytyczny">Krytyczny</option>
                  <option value="Wysoki">Wysoki</option>
                  <option value="Średni">Średni</option>
                  <option value="Niski">Niski</option>
                </Form.Select>
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <InputGroup size="sm">
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faFilter} />
                </InputGroup.Text>
                <Form.Select 
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                >
                  {uniqueAreas.map((area, index) => (
                    <option key={index} value={area}>{area}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>
        
        {stats.overdue > 0 && (
          <Alert variant="danger" className="mb-3">
            <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
            <strong>Uwaga!</strong> Masz {stats.overdue} działań z przekroczonym terminem realizacji.
          </Alert>
        )}
        
        {sortedActions.length > 0 ? (
          <div className="table-responsive">
            <Table striped hover className="remedial-actions-table">
              <thead>
                <tr>
                  <th style={{width: '15%'}} onClick={() => handleSort('area')} className="sortable-header">
                    Obszar {renderSortIcon('area')}
                  </th>
                  <th style={{width: '20%'}} onClick={() => handleSort('issue')} className="sortable-header">
                    Problem {renderSortIcon('issue')}
                  </th>
                  <th style={{width: '25%'}}>Rekomendacja</th>
                  <th style={{width: '10%'}} onClick={() => handleSort('priority')} className="sortable-header">
                    Priorytet {renderSortIcon('priority')}
                  </th>
                  <th style={{width: '10%'}} onClick={() => handleSort('deadline')} className="sortable-header">
                    Termin {renderSortIcon('deadline')}
                  </th>
                  <th style={{width: '10%'}} onClick={() => handleSort('status')} className="sortable-header">
                    Status {renderSortIcon('status')}
                  </th>
                  <th style={{width: '10%'}} onClick={() => handleSort('progress')} className="sortable-header">
                    Postęp {renderSortIcon('progress')}
                  </th>
                  <th style={{width: '10%'}}>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {sortedActions.map(action => (
                  <tr key={action.id}>
                    <td>
                      {editingActionId === action.id ? (
                        <Form.Control 
                          type="text" 
                          value={action.area}
                          onChange={(e) => handleSaveEdit(action.id, {...action, area: e.target.value})}
                          size="sm"
                        />
                      ) : (
                        <div className="d-flex align-items-center">
                          {action.area}
                          {action.rodoArticles.length > 0 && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Powiązane artykuły RODO: {action.rodoArticles.join(', ')}</Tooltip>}
                            >
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 ms-1"
                                onClick={() => showArticles(action)}
                              >
                                <FontAwesomeIcon icon={faLink} className="text-muted" />
                              </Button>
                            </OverlayTrigger>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingActionId === action.id ? (
                        <Form.Control 
                          type="text" 
                          value={action.issue}
                          onChange={(e) => handleSaveEdit(action.id, {...action, issue: e.target.value})}
                          size="sm"
                        />
                      ) : (
                        <div>
                          {action.issue}
                          {action.attachments.length > 0 && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0 ms-1"
                              onClick={() => showAttachments(action)}
                            >
                              <FontAwesomeIcon icon={faFileExport} className="text-muted" />
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingActionId === action.id ? (
                        <Form.Control 
                          as="textarea" 
                          rows={2}
                          value={action.recommendation}
                          onChange={(e) => handleSaveEdit(action.id, {...action, recommendation: e.target.value})}
                          size="sm"
                        />
                      ) : (
                        action.recommendation
                      )}
                    </td>
                    <td>
                      {editingActionId === action.id ? (
                        <Form.Select 
                          value={action.priority}
                          onChange={(e) => handleSaveEdit(action.id, {...action, priority: e.target.value})}
                          size="sm"
                        >
                          <option value="Krytyczny">Krytyczny</option>
                          <option value="Wysoki">Wysoki</option>
                          <option value="Średni">Średni</option>
                          <option value="Niski">Niski</option>
                        </Form.Select>
                      ) : (
                        renderPriorityBadge(action.priority)
                      )}
                    </td>
                    <td>
                      {editingActionId === action.id ? (
                        <Form.Control 
                          type="date" 
                          value={action.deadline}
                          onChange={(e) => handleSaveEdit(action.id, {...action, deadline: e.target.value})}
                          size="sm"
                        />
                      ) : (
                        <div>
                          {action.deadline ? (
                            <span className={
                              isDeadlinePassed(action.deadline) && action.status !== 'Zakończone' ? 'text-danger fw-bold' : 
                              isDeadlineNear(action.deadline) && action.status !== 'Zakończone' ? 'text-warning fw-bold' : 
                              ''
                            }>
                              {new Date(action.deadline).toLocaleDateString()}
                              {isDeadlinePassed(action.deadline) && action.status !== 'Zakończone' && (
                                <FontAwesomeIcon icon={faExclamationTriangle} className="ms-1 text-danger" />
                              )}
                            </span>
                          ) : (
                            <span className="text-muted">Nie określono</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingActionId === action.id ? (
                        <Form.Select 
                          value={action.status}
                          onChange={(e) => handleSaveEdit(action.id, {
                            ...action, 
                            status: e.target.value,
                            progress: e.target.value === 'Zakończone' ? 100 : (e.target.value === 'Nierozpoczęte' ? 0 : action.progress),
                            statusHistory: [
                              ...action.statusHistory,
                              { date: new Date().toISOString().split('T')[0], status: e.target.value, user: 'Aktualny użytkownik' }
                            ]
                          })}
                          size="sm"
                        >
                          <option value="Nierozpoczęte">Nierozpoczęte</option>
                          <option value="W trakcie">W trakcie</option>
                          <option value="Zakończone">Zakończone</option>
                        </Form.Select>
                      ) : (
                        <div className="d-flex align-items-center">
                          {renderStatusBadge(action.status)}
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 ms-1"
                            onClick={() => showHistory(action)}
                          >
                            <FontAwesomeIcon icon={faHistory} className="text-muted" />
                          </Button>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingActionId === action.id ? (
                        <Form.Control 
                          type="range" 
                          min="0"
                          max="100"
                          step="10"
                          value={action.progress}
                          onChange={(e) => handleSaveEdit(action.id, {
                            ...action, 
                            progress: parseInt(e.target.value),
                            status: parseInt(e.target.value) === 0 ? 'Nierozpoczęte' : 
                                   parseInt(e.target.value) === 100 ? 'Zakończone' : 'W trakcie',
                            statusHistory: [
                              ...action.statusHistory,
                              { 
                                date: new Date().toISOString().split('T')[0], 
                                status: parseInt(e.target.value) === 0 ? 'Nierozpoczęte' : 
                                        parseInt(e.target.value) === 100 ? 'Zakończone' : 'W trakcie', 
                                user: 'Aktualny użytkownik' 
                              }
                            ]
                          })}
                        />
                      ) : (
                        <div>
                          <div className="progress" style={{height: '10px'}}>
                            <div 
                              className={`progress-bar ${
                                action.progress === 100 ? 'bg-success' : 
                                action.progress > 0 ? 'bg-warning' : 'bg-danger'
                              }`}
                              role="progressbar" 
                              style={{width: `${action.progress}%`}}
                              aria-valuenow={action.progress} 
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            />
                          </div>
                          <small>{action.progress}%</small>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingActionId === action.id ? (
                        <>
                          <Button 
                            variant="success" 
                            size="sm" 
                            className="me-1"
                            onClick={() => setEditingActionId(null)}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => setEditingActionId(null)}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleEditAction(action.id)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteAction(action.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="alert alert-info">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            Brak działań naprawczych spełniających kryteria filtrowania.
          </div>
        )}
      </Card.Body>
      
      {/* Modal z historią statusów */}
      <Modal 
        show={showHistoryModal} 
        onHide={() => setShowHistoryModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faHistory} className="me-2" />
            Historia zmian statusu
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAction && (
            <>
              <p>
                <strong>Działanie:</strong> {selectedAction.issue}
              </p>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Status</th>
                    <th>Użytkownik</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAction.statusHistory.map((history, index) => (
                    <tr key={index}>
                      <td>{history.date}</td>
                      <td>{renderStatusBadge(history.status)}</td>
                      <td>{history.user}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
            Zamknij
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal z załącznikami */}
      <Modal 
        show={showAttachmentsModal} 
        onHide={() => setShowAttachmentsModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faFileExport} className="me-2" />
            Załączniki
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAction && (
            <>
              <p>
                <strong>Działanie:</strong> {selectedAction.issue}
              </p>
              {selectedAction.attachments.length > 0 ? (
                <ul className="list-group">
                  {selectedAction.attachments.map((attachment, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <FontAwesomeIcon icon={faFileExport} className="me-2 text-primary" />
                        {attachment}
                      </span>
                      <div>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-1"
                          onClick={() => {
                            // W rzeczywistej aplikacji tutaj byłoby pobieranie pliku
                            alert(`Pobieranie pliku: ${attachment}`);
                          }}
                        >
                          Pobierz
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => {
                            if (selectedAction) {
                              handleRemoveAttachment(selectedAction.id, attachment);
                            }
                          }}
                        >
                          Usuń
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">Brak załączników dla tego działania.</p>
              )}
              
              <hr />
              
              <Form.Group className="mt-3">
                <Form.Label>Dodaj nowy załącznik</Form.Label>
                <InputGroup>
                  <Form.Control 
                    type="text" 
                    placeholder="Nazwa pliku"
                    value={selectedAction.newAttachment || ''}
                    onChange={(e) => {
                      setSelectedAction({
                        ...selectedAction,
                        newAttachment: e.target.value
                      });
                    }}
                  />
                  <Button 
                    variant="outline-primary"
                    onClick={() => {
                      if (selectedAction.newAttachment) {
                        handleAddAttachment(selectedAction.id, selectedAction.newAttachment);
                        setSelectedAction({
                          ...selectedAction,
                          newAttachment: ''
                        });
                      }
                    }}
                  >
                    Dodaj
                  </Button>
                </InputGroup>
                <Form.Text className="text-muted">
                  W rzeczywistej aplikacji tutaj byłby upload pliku.
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAttachmentsModal(false)}>
            Zamknij
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal z artykułami RODO */}
      <Modal 
        show={showArticlesModal} 
        onHide={() => setShowArticlesModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faLink} className="me-2" />
            Powiązane artykuły RODO
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAction && (
            <>
              <p>
                <strong>Działanie:</strong> {selectedAction.issue}
              </p>
              {selectedAction.rodoArticles.length > 0 ? (
                <div>
                  {selectedAction.rodoArticles.map((article, index) => (
                    <Badge 
                      key={index} 
                      bg="info" 
                      className="me-2 mb-2 p-2"
                      style={{ fontSize: '1em' }}
                    >
                      {article}
                      <Button 
                        variant="link" 
                        className="p-0 ms-2 text-white"
                        onClick={() => {
                          if (selectedAction) {
                            handleRemoveRodoArticle(selectedAction.id, article);
                          }
                        }}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted">Brak powiązanych artykułów RODO dla tego działania.</p>
              )}
              
              <hr />
              
              <Form.Group className="mt-3">
                <Form.Label>Dodaj powiązany artykuł RODO</Form.Label>
                <InputGroup>
                  <Form.Control 
                    type="text" 
                    placeholder="Np. Art. 32"
                    value={selectedAction.newArticle || ''}
                    onChange={(e) => {
                      setSelectedAction({
                        ...selectedAction,
                        newArticle: e.target.value
                      });
                    }}
                  />
                  <Button 
                    variant="outline-primary"
                    onClick={() => {
                      if (selectedAction.newArticle && !selectedAction.rodoArticles.includes(selectedAction.newArticle)) {
                        handleAddRodoArticle(selectedAction.id, selectedAction.newArticle);
                        setSelectedAction({
                          ...selectedAction,
                          newArticle: ''
                        });
                      }
                    }}
                  >
                    Dodaj
                  </Button>
                </InputGroup>
              </Form.Group>
              
              <div className="mt-3">
                <h6>Popularne artykuły RODO:</h6>
                <div>
                  {['Art. 5', 'Art. 6', 'Art. 7', 'Art. 12', 'Art. 15', 'Art. 17', 'Art. 25', 'Art. 32', 'Art. 35'].map((article, index) => (
                    <Badge 
                      key={index} 
                      bg="secondary" 
                      className="me-2 mb-2 p-2"
                      style={{ fontSize: '0.9em', cursor: 'pointer' }}
                      onClick={() => {
                        if (selectedAction && !selectedAction.rodoArticles.includes(article)) {
                          handleAddRodoArticle(selectedAction.id, article);
                        }
                      }}
                    >
                      {article}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowArticlesModal(false)}>
            Zamknij
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default RemedialActionsSection;
