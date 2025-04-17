import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Form, Table, Badge, Alert, OverlayTrigger, Tooltip, Tabs, Tab, Dropdown, ButtonGroup, Modal, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck, faExclamationTriangle, faInfoCircle, faDownload, faFilter, faSearch, faSortAmountDown, faSortAmountUp, faFileAlt, faPaperclip, faCalendarAlt, faCheck, faTimes, faEdit, faTrash, faPlus, faFileExport, faListAlt, faTable, faChartBar } from '@fortawesome/free-solid-svg-icons';
// Komentujemy import bibliotek PDF i CSV do czasu rozwiązania problemu z zależnościami
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { CSVLink } from 'react-csv';

/**
 * Komponent działań naprawczych dla oceny RODO
 * 
 * Funkcjonalności:
 * - Lista działań naprawczych z filtrowaniem i sortowaniem
 * - Szczegóły działań naprawczych
 * - Zarządzanie statusem działań
 * - Eksport listy działań do PDF/CSV
 * - Śledzenie historii zmian statusów
 * - Zarządzanie załącznikami
 * - Powiązanie działań z artykułami RODO
 * - Powiadomienia o terminach
 */
const RemedialActionsSection = ({ assessmentData }) => {
  // Mockowe dane dla działań naprawczych
  const initialActions = [
    {
      id: 1,
      title: 'Aktualizacja polityki prywatności',
      description: 'Aktualizacja polityki prywatności zgodnie z wymogami RODO, w szczególności w zakresie informacji o prawach podmiotów danych.',
      priority: 'Wysoki',
      status: 'W trakcie',
      dueDate: '2025-05-15',
      assignedTo: 'Jan Kowalski',
      createdAt: '2025-04-01',
      updatedAt: '2025-04-10',
      area: 'Prawa podmiotów',
      riskLevel: 'Wysoki',
      gdprArticles: ['12', '13', '14'],
      attachments: [
        { id: 1, name: 'polityka_prywatnosci_draft.docx', type: 'document', uploadedAt: '2025-04-05' }
      ],
      statusHistory: [
        { status: 'Nowe', date: '2025-04-01', user: 'System' },
        { status: 'W trakcie', date: '2025-04-10', user: 'Jan Kowalski' }
      ],
      comments: [
        { id: 1, text: 'Rozpoczęto prace nad aktualizacją polityki', date: '2025-04-10', user: 'Jan Kowalski' }
      ]
    },
    {
      id: 2,
      title: 'Wdrożenie mechanizmu zgód marketingowych',
      description: 'Implementacja mechanizmu zbierania i zarządzania zgodami marketingowymi, w tym możliwość wycofania zgody.',
      priority: 'Średni',
      status: 'Zaplanowane',
      dueDate: '2025-06-01',
      assignedTo: 'Anna Nowak',
      createdAt: '2025-04-02',
      updatedAt: '2025-04-02',
      area: 'Zgody na przetwarzanie',
      riskLevel: 'Średni',
      gdprArticles: ['6', '7'],
      attachments: [],
      statusHistory: [
        { status: 'Nowe', date: '2025-04-02', user: 'System' },
        { status: 'Zaplanowane', date: '2025-04-02', user: 'System' }
      ],
      comments: []
    },
    {
      id: 3,
      title: 'Przeprowadzenie szkolenia z bezpieczeństwa danych',
      description: 'Szkolenie dla wszystkich pracowników z zakresu bezpieczeństwa danych osobowych i procedur RODO.',
      priority: 'Wysoki',
      status: 'Zakończone',
      dueDate: '2025-04-30',
      assignedTo: 'Piotr Wiśniewski',
      createdAt: '2025-04-03',
      updatedAt: '2025-04-25',
      area: 'Bezpieczeństwo danych',
      riskLevel: 'Wysoki',
      gdprArticles: ['32'],
      attachments: [
        { id: 2, name: 'materialy_szkoleniowe.pdf', type: 'document', uploadedAt: '2025-04-15' },
        { id: 3, name: 'lista_obecnosci.pdf', type: 'document', uploadedAt: '2025-04-25' }
      ],
      statusHistory: [
        { status: 'Nowe', date: '2025-04-03', user: 'System' },
        { status: 'W trakcie', date: '2025-04-15', user: 'Piotr Wiśniewski' },
        { status: 'Zakończone', date: '2025-04-25', user: 'Piotr Wiśniewski' }
      ],
      comments: [
        { id: 2, text: 'Materiały szkoleniowe zostały przygotowane', date: '2025-04-15', user: 'Piotr Wiśniewski' },
        { id: 3, text: 'Szkolenie zostało przeprowadzone dla wszystkich pracowników', date: '2025-04-25', user: 'Piotr Wiśniewski' }
      ]
    },
    {
      id: 4,
      title: 'Aktualizacja rejestru czynności przetwarzania',
      description: 'Aktualizacja rejestru czynności przetwarzania o nowe procesy biznesowe i zmiany w istniejących.',
      priority: 'Średni',
      status: 'W trakcie',
      dueDate: '2025-05-20',
      assignedTo: 'Magdalena Kowalczyk',
      createdAt: '2025-04-05',
      updatedAt: '2025-04-12',
      area: 'Dokumentacja',
      riskLevel: 'Średni',
      gdprArticles: ['30'],
      attachments: [
        { id: 4, name: 'rejestr_czynnosci_draft.xlsx', type: 'spreadsheet', uploadedAt: '2025-04-12' }
      ],
      statusHistory: [
        { status: 'Nowe', date: '2025-04-05', user: 'System' },
        { status: 'W trakcie', date: '2025-04-12', user: 'Magdalena Kowalczyk' }
      ],
      comments: [
        { id: 4, text: 'Rozpoczęto aktualizację rejestru', date: '2025-04-12', user: 'Magdalena Kowalczyk' }
      ]
    },
    {
      id: 5,
      title: 'Wdrożenie procedury zgłaszania naruszeń',
      description: 'Opracowanie i wdrożenie procedury zgłaszania naruszeń ochrony danych osobowych.',
      priority: 'Wysoki',
      status: 'Nowe',
      dueDate: '2025-06-15',
      assignedTo: null,
      createdAt: '2025-04-10',
      updatedAt: '2025-04-10',
      area: 'Bezpieczeństwo danych',
      riskLevel: 'Wysoki',
      gdprArticles: ['33', '34'],
      attachments: [],
      statusHistory: [
        { status: 'Nowe', date: '2025-04-10', user: 'System' }
      ],
      comments: []
    }
  ];

  const [remedialActions, setRemedialActions] = useState(initialActions);
  const [filteredActions, setFilteredActions] = useState(initialActions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [sortField, setSortField] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedAction, setSelectedAction] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newAttachment, setNewAttachment] = useState({ name: '', type: 'document' });

  // Filtrowanie działań naprawczych
  useEffect(() => {
    let filtered = remedialActions;
    
    if (searchTerm) {
      filtered = filtered.filter(action => 
        action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (action.assignedTo && action.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        action.gdprArticles.some(article => article.includes(searchTerm))
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(action => action.status === statusFilter);
    }
    
    if (priorityFilter) {
      filtered = filtered.filter(action => action.priority === priorityFilter);
    }
    
    if (areaFilter) {
      filtered = filtered.filter(action => action.area === areaFilter);
    }
    
    // Filtrowanie według aktywnej zakładki
    if (activeTab === 'overdue') {
      filtered = filtered.filter(action => 
        action.status !== 'Zakończone' && 
        new Date(action.dueDate) < new Date() && 
        action.dueDate
      );
    } else if (activeTab === 'upcoming') {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      filtered = filtered.filter(action => 
        action.status !== 'Zakończone' && 
        new Date(action.dueDate) >= today && 
        new Date(action.dueDate) <= nextWeek
      );
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(action => action.status === 'Zakończone');
    } else if (activeTab === 'inProgress') {
      filtered = filtered.filter(action => action.status === 'W trakcie');
    }
    
    // Sortowanie
    filtered = [...filtered].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Obsługa wartości null
      if (aValue === null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === null) return sortDirection === 'asc' ? -1 : 1;
      
      // Obsługa dat
      if (sortField === 'dueDate' || sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredActions(filtered);
  }, [remedialActions, searchTerm, statusFilter, priorityFilter, areaFilter, sortField, sortDirection, activeTab]);

  // Obsługa sortowania
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Obsługa zmiany statusu działania
  const handleStatusChange = (actionId, newStatus) => {
    const updatedActions = remedialActions.map(action => {
      if (action.id === actionId) {
        const now = new Date().toISOString().split('T')[0];
        const updatedAction = {
          ...action,
          status: newStatus,
          updatedAt: now,
          statusHistory: [
            ...action.statusHistory,
            { status: newStatus, date: now, user: 'Aktualny użytkownik' }
          ]
        };
        return updatedAction;
      }
      return action;
    });
    
    setRemedialActions(updatedActions);
  };

  // Obsługa dodawania komentarza
  const handleAddComment = () => {
    if (!newComment.trim() || !selectedAction) return;
    
    const now = new Date().toISOString().split('T')[0];
    const newCommentObj = {
      id: Math.max(0, ...selectedAction.comments.map(c => c.id)) + 1,
      text: newComment,
      date: now,
      user: 'Aktualny użytkownik'
    };
    
    const updatedActions = remedialActions.map(action => {
      if (action.id === selectedAction.id) {
        return {
          ...action,
          comments: [...action.comments, newCommentObj],
          updatedAt: now
        };
      }
      return action;
    });
    
    setRemedialActions(updatedActions);
    setNewComment('');
    
    // Aktualizacja wybranego działania
    setSelectedAction({
      ...selectedAction,
      comments: [...selectedAction.comments, newCommentObj],
      updatedAt: now
    });
  };

  // Obsługa dodawania załącznika
  const handleAddAttachment = () => {
    if (!newAttachment.name.trim() || !selectedAction) return;
    
    const now = new Date().toISOString().split('T')[0];
    const newAttachmentObj = {
      id: Math.max(0, ...selectedAction.attachments.map(a => a.id), 0) + 1,
      name: newAttachment.name,
      type: newAttachment.type,
      uploadedAt: now
    };
    
    const updatedActions = remedialActions.map(action => {
      if (action.id === selectedAction.id) {
        return {
          ...action,
          attachments: [...action.attachments, newAttachmentObj],
          updatedAt: now
        };
      }
      return action;
    });
    
    setRemedialActions(updatedActions);
    setNewAttachment({ name: '', type: 'document' });
    
    // Aktualizacja wybranego działania
    setSelectedAction({
      ...selectedAction,
      attachments: [...selectedAction.attachments, newAttachmentObj],
      updatedAt: now
    });
  };

  // Eksport do PDF
  const exportToPDF = () => {
    // Funkcjonalność eksportu do PDF zostanie zaimplementowana po rozwiązaniu problemu z zależnościami
    console.log('Eksport do PDF: działania naprawcze');
    alert('Funkcja eksportu do PDF zostanie dostępna po rozwiązaniu problemu z zależnościami.');
    
    // Kod do odkomentowania po rozwiązaniu problemu z zależnościami
    /*
    const doc = new jsPDF();
    
    // Tytuł
    doc.setFontSize(18);
    doc.text('Lista działań naprawczych RODO', 14, 22);
    
    // Data wygenerowania
    doc.setFontSize(10);
    doc.text(`Wygenerowano: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Filtry
    let filterText = 'Filtry: ';
    if (statusFilter) filterText += `Status: ${statusFilter}, `;
    if (priorityFilter) filterText += `Priorytet: ${priorityFilter}, `;
    if (areaFilter) filterText += `Obszar: ${areaFilter}, `;
    if (searchTerm) filterText += `Wyszukiwanie: ${searchTerm}, `;
    
    if (filterText !== 'Filtry: ') {
      filterText = filterText.slice(0, -2); // Usunięcie ostatniego przecinka i spacji
      doc.text(filterText, 14, 35);
    }
    
    // Tabela
    const tableColumn = ["Tytuł", "Priorytet", "Status", "Termin", "Przypisane do", "Obszar"];
    const tableRows = [];
    
    filteredActions.forEach(action => {
      const actionData = [
        action.title,
        action.priority,
        action.status,
        action.dueDate ? new Date(action.dueDate).toLocaleDateString() : 'Brak',
        action.assignedTo || 'Nieprzypisane',
        action.area
      ];
      tableRows.push(actionData);
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 40 }
    });
    
    // Zapisz PDF
    doc.save('dzialania-naprawcze-rodo.pdf');
    */
  };

  // Przygotowanie danych do eksportu CSV
  const prepareCSVData = () => {
    const csvData = [
      ['ID', 'Tytuł', 'Opis', 'Priorytet', 'Status', 'Termin', 'Przypisane do', 'Obszar', 'Poziom ryzyka', 'Artykuły RODO', 'Data utworzenia', 'Ostatnia aktualizacja']
    ];
    
    filteredActions.forEach(action => {
      csvData.push([
        action.id,
        action.title,
        action.description,
        action.priority,
        action.status,
        action.dueDate || '',
        action.assignedTo || '',
        action.area,
        action.riskLevel,
        action.gdprArticles.join(', '),
        action.createdAt,
        action.updatedAt
      ]);
    });
    
    return csvData;
  };

  // Unikalne wartości do filtrów
  const uniqueStatuses = [...new Set(remedialActions.map(action => action.status))];
  const uniquePriorities = [...new Set(remedialActions.map(action => action.priority))];
  const uniqueAreas = [...new Set(remedialActions.map(action => action.area))];

  // Liczba działań w poszczególnych kategoriach
  const overdueCount = remedialActions.filter(action => 
    action.status !== 'Zakończone' && 
    new Date(action.dueDate) < new Date() && 
    action.dueDate
  ).length;
  
  const upcomingCount = (() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return remedialActions.filter(action => 
      action.status !== 'Zakończone' && 
      new Date(action.dueDate) >= today && 
      new Date(action.dueDate) <= nextWeek
    ).length;
  })();
  
  const completedCount = remedialActions.filter(action => action.status === 'Zakończone').length;
  const inProgressCount = remedialActions.filter(action => action.status === 'W trakcie').length;

  return (
    <Card className="mb-4 remedial-actions-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FontAwesomeIcon icon={faClipboardCheck} className="me-2" />
          Działania naprawcze
        </h5>
        <div>
          <Dropdown as={ButtonGroup} className="me-2">
            <Dropdown.Toggle variant="outline-secondary" size="sm" id="export-dropdown">
              <FontAwesomeIcon icon={faFileExport} className="me-1" />
              Eksportuj
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={exportToPDF}>
                Eksportuj do PDF
              </Dropdown.Item>
              {/* Kod do odkomentowania po rozwiązaniu problemu z zależnościami */}
              {/* <Dropdown.Item as={CSVLink} data={prepareCSVData()} filename="dzialania-naprawcze-rodo.csv" separator=";">
                Eksportuj do CSV
              </Dropdown.Item> */}
              <Dropdown.Item onClick={() => alert('Funkcja eksportu do CSV zostanie dostępna po rozwiązaniu problemu z zależnościami.')}>
                Eksportuj do CSV
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => {
              setSelectedAction(null);
              setShowActionModal(true);
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="me-1" />
            Dodaj działanie
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab 
            eventKey="all" 
            title={
              <span>
                <FontAwesomeIcon icon={faListAlt} className="me-1" />
                Wszystkie
              </span>
            }
          />
          <Tab 
            eventKey="overdue" 
            title={
              <span>
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                Zaległe <Badge bg="danger">{overdueCount}</Badge>
              </span>
            }
          />
          <Tab 
            eventKey="upcoming" 
            title={
              <span>
                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                Nadchodzące <Badge bg="warning">{upcomingCount}</Badge>
              </span>
            }
          />
          <Tab 
            eventKey="inProgress" 
            title={
              <span>
                <FontAwesomeIcon icon={faEdit} className="me-1" />
                W trakcie <Badge bg="primary">{inProgressCount}</Badge>
              </span>
            }
          />
          <Tab 
            eventKey="completed" 
            title={
              <span>
                <FontAwesomeIcon icon={faCheck} className="me-1" />
                Zakończone <Badge bg="success">{completedCount}</Badge>
              </span>
            }
          />
        </Tabs>
        
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control 
                  type="text" 
                  placeholder="Szukaj działań..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Wszystkie statusy</option>
                {uniqueStatuses.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">Wszystkie priorytety</option>
                {uniquePriorities.map((priority, index) => (
                  <option key={index} value={priority}>{priority}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Select 
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
              >
                <option value="">Wszystkie obszary</option>
                {uniqueAreas.map((area, index) => (
                  <option key={index} value={area}>{area}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Button 
              variant="outline-secondary" 
              className="w-100"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPriorityFilter('');
                setAreaFilter('');
              }}
            >
              Resetuj filtry
            </Button>
          </Col>
        </Row>
        
        {filteredActions.length > 0 ? (
          <div className="table-responsive">
            <Table striped hover className="actions-table">
              <thead>
                <tr>
                  <th style={{width: '30%'}} onClick={() => handleSort('title')} className="sortable-header">
                    Tytuł
                    {sortField === 'title' && (
                      <FontAwesomeIcon 
                        icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                        className="ms-1"
                      />
                    )}
                  </th>
                  <th style={{width: '10%'}} onClick={() => handleSort('priority')} className="sortable-header">
                    Priorytet
                    {sortField === 'priority' && (
                      <FontAwesomeIcon 
                        icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                        className="ms-1"
                      />
                    )}
                  </th>
                  <th style={{width: '10%'}} onClick={() => handleSort('status')} className="sortable-header">
                    Status
                    {sortField === 'status' && (
                      <FontAwesomeIcon 
                        icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                        className="ms-1"
                      />
                    )}
                  </th>
                  <th style={{width: '10%'}} onClick={() => handleSort('dueDate')} className="sortable-header">
                    Termin
                    {sortField === 'dueDate' && (
                      <FontAwesomeIcon 
                        icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                        className="ms-1"
                      />
                    )}
                  </th>
                  <th style={{width: '15%'}} onClick={() => handleSort('assignedTo')} className="sortable-header">
                    Przypisane do
                    {sortField === 'assignedTo' && (
                      <FontAwesomeIcon 
                        icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                        className="ms-1"
                      />
                    )}
                  </th>
                  <th style={{width: '15%'}} onClick={() => handleSort('area')} className="sortable-header">
                    Obszar
                    {sortField === 'area' && (
                      <FontAwesomeIcon 
                        icon={sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown} 
                        className="ms-1"
                      />
                    )}
                  </th>
                  <th style={{width: '10%'}}>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredActions.map(action => {
                  const isOverdue = action.status !== 'Zakończone' && new Date(action.dueDate) < new Date() && action.dueDate;
                  
                  return (
                    <tr key={action.id} className={isOverdue ? 'table-danger' : ''}>
                      <td>
                        <div className="d-flex align-items-center">
                          {action.attachments.length > 0 && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>{action.attachments.length} załącznik(ów)</Tooltip>}
                            >
                              <FontAwesomeIcon icon={faPaperclip} className="me-2 text-muted" />
                            </OverlayTrigger>
                          )}
                          <div>
                            <div>{action.title}</div>
                            <small className="text-muted">
                              {action.gdprArticles.length > 0 && (
                                <>Art. RODO: {action.gdprArticles.join(', ')}</>
                              )}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={
                          action.priority === 'Wysoki' ? 'danger' : 
                          action.priority === 'Średni' ? 'warning' : 
                          'info'
                        }>
                          {action.priority}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={
                          action.status === 'Zakończone' ? 'success' : 
                          action.status === 'W trakcie' ? 'primary' : 
                          action.status === 'Zaplanowane' ? 'info' : 
                          'secondary'
                        }>
                          {action.status}
                        </Badge>
                      </td>
                      <td>
                        {action.dueDate ? (
                          <div className={isOverdue ? 'text-danger fw-bold' : ''}>
                            {new Date(action.dueDate).toLocaleDateString()}
                            {isOverdue && (
                              <FontAwesomeIcon icon={faExclamationTriangle} className="ms-1" />
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">Brak</span>
                        )}
                      </td>
                      <td>
                        {action.assignedTo || <span className="text-muted">Nieprzypisane</span>}
                      </td>
                      <td>{action.area}</td>
                      <td>
                        <ButtonGroup size="sm">
                          <Button 
                            variant="outline-primary"
                            onClick={() => {
                              setSelectedAction(action);
                              setShowActionModal(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button 
                            variant="outline-info"
                            onClick={() => {
                              setSelectedAction(action);
                              setShowHistoryModal(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faFileAlt} />
                          </Button>
                          <Button 
                            variant="outline-success"
                            onClick={() => {
                              setSelectedAction(action);
                              setShowAttachmentsModal(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faPaperclip} />
                          </Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        ) : (
          <Alert variant="info">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            Brak działań naprawczych spełniających kryteria filtrowania.
          </Alert>
        )}
      </Card.Body>
      
      {/* Modal szczegółów działania */}
      <Modal 
        show={showActionModal} 
        onHide={() => setShowActionModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedAction ? 'Edycja działania naprawczego' : 'Nowe działanie naprawcze'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAction ? (
            <Tabs defaultActiveKey="details" className="mb-3">
              <Tab 
                eventKey="details" 
                title={
                  <span>
                    <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                    Szczegóły
                  </span>
                }
              >
                <Form>
                  <Row>
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tytuł</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={selectedAction.title}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select 
                          value={selectedAction.status}
                          onChange={(e) => handleStatusChange(selectedAction.id, e.target.value)}
                        >
                          <option value="Nowe">Nowe</option>
                          <option value="Zaplanowane">Zaplanowane</option>
                          <option value="W trakcie">W trakcie</option>
                          <option value="Zakończone">Zakończone</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Opis</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3}
                      value={selectedAction.description}
                      readOnly
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Priorytet</Form.Label>
                        <Form.Select 
                          value={selectedAction.priority}
                          disabled
                        >
                          <option value="Niski">Niski</option>
                          <option value="Średni">Średni</option>
                          <option value="Wysoki">Wysoki</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Termin</Form.Label>
                        <Form.Control 
                          type="date" 
                          value={selectedAction.dueDate || ''}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Przypisane do</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={selectedAction.assignedTo || ''}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Obszar</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={selectedAction.area}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Poziom ryzyka</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={selectedAction.riskLevel}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Artykuły RODO</Form.Label>
                        <div className="d-flex flex-wrap">
                          {selectedAction.gdprArticles.map((article, index) => (
                            <Badge 
                              key={index} 
                              bg="info"
                              className="me-1 mb-1 p-2"
                            >
                              Art. {article}
                            </Badge>
                          ))}
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Data utworzenia</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={new Date(selectedAction.createdAt).toLocaleDateString()}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Ostatnia aktualizacja</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={new Date(selectedAction.updatedAt).toLocaleDateString()}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Tab>
              
              <Tab 
                eventKey="comments" 
                title={
                  <span>
                    <FontAwesomeIcon icon={faFileAlt} className="me-1" />
                    Komentarze <Badge bg="info">{selectedAction.comments.length}</Badge>
                  </span>
                }
              >
                <div className="comments-section mb-3">
                  {selectedAction.comments.length > 0 ? (
                    selectedAction.comments.map(comment => (
                      <div key={comment.id} className="comment p-3 mb-2 bg-light rounded">
                        <div className="d-flex justify-content-between mb-2">
                          <strong>{comment.user}</strong>
                          <small className="text-muted">{new Date(comment.date).toLocaleDateString()}</small>
                        </div>
                        <p className="mb-0">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <Alert variant="info">
                      <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                      Brak komentarzy dla tego działania.
                    </Alert>
                  )}
                </div>
                
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Dodaj komentarz</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Wpisz komentarz..."
                    />
                  </Form.Group>
                  <Button 
                    variant="primary"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    Dodaj komentarz
                  </Button>
                </Form>
              </Tab>
              
              <Tab 
                eventKey="history" 
                title={
                  <span>
                    <FontAwesomeIcon icon={faHistory} className="me-1" />
                    Historia zmian
                  </span>
                }
              >
                <div className="history-section">
                  {selectedAction.statusHistory.length > 0 ? (
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Status</th>
                          <th>Użytkownik</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...selectedAction.statusHistory].reverse().map((history, index) => (
                          <tr key={index}>
                            <td>{new Date(history.date).toLocaleDateString()}</td>
                            <td>
                              <Badge bg={
                                history.status === 'Zakończone' ? 'success' : 
                                history.status === 'W trakcie' ? 'primary' : 
                                history.status === 'Zaplanowane' ? 'info' : 
                                'secondary'
                              }>
                                {history.status}
                              </Badge>
                            </td>
                            <td>{history.user}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Alert variant="info">
                      <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                      Brak historii zmian dla tego działania.
                    </Alert>
                  )}
                </div>
              </Tab>
              
              <Tab 
                eventKey="attachments" 
                title={
                  <span>
                    <FontAwesomeIcon icon={faPaperclip} className="me-1" />
                    Załączniki <Badge bg="info">{selectedAction.attachments.length}</Badge>
                  </span>
                }
              >
                <div className="attachments-section mb-3">
                  {selectedAction.attachments.length > 0 ? (
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Nazwa pliku</th>
                          <th>Typ</th>
                          <th>Data dodania</th>
                          <th>Akcje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAction.attachments.map(attachment => (
                          <tr key={attachment.id}>
                            <td>
                              <FontAwesomeIcon 
                                icon={
                                  attachment.type === 'document' ? faFileAlt : 
                                  attachment.type === 'spreadsheet' ? faTable : 
                                  faFileAlt
                                } 
                                className="me-2"
                              />
                              {attachment.name}
                            </td>
                            <td>
                              {attachment.type === 'document' ? 'Dokument' : 
                               attachment.type === 'spreadsheet' ? 'Arkusz kalkulacyjny' : 
                               'Inny'}
                            </td>
                            <td>{new Date(attachment.uploadedAt).toLocaleDateString()}</td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => alert(`Pobieranie pliku: ${attachment.name}`)}
                              >
                                <FontAwesomeIcon icon={faDownload} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Alert variant="info">
                      <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                      Brak załączników dla tego działania.
                    </Alert>
                  )}
                </div>
                
                <Form>
                  <Row>
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nazwa pliku</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={newAttachment.name}
                          onChange={(e) => setNewAttachment({...newAttachment, name: e.target.value})}
                          placeholder="Wpisz nazwę pliku..."
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Typ</Form.Label>
                        <Form.Select 
                          value={newAttachment.type}
                          onChange={(e) => setNewAttachment({...newAttachment, type: e.target.value})}
                        >
                          <option value="document">Dokument</option>
                          <option value="spreadsheet">Arkusz kalkulacyjny</option>
                          <option value="other">Inny</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button 
                    variant="primary"
                    onClick={handleAddAttachment}
                    disabled={!newAttachment.name.trim()}
                  >
                    Dodaj załącznik
                  </Button>
                </Form>
              </Tab>
            </Tabs>
          ) : (
            <Alert variant="info">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              Funkcja dodawania nowych działań naprawczych będzie dostępna w przyszłej wersji.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowActionModal(false)}
          >
            Zamknij
          </Button>
          {selectedAction && (
            <Button 
              variant="primary"
              onClick={() => setShowActionModal(false)}
            >
              Zapisz zmiany
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      
      {/* Modal historii zmian */}
      <Modal 
        show={showHistoryModal} 
        onHide={() => setShowHistoryModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faHistory} className="me-2" />
            Historia zmian
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAction && (
            <div className="history-section">
              <h6 className="mb-3">Historia zmian dla: {selectedAction.title}</h6>
              
              {selectedAction.statusHistory.length > 0 ? (
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Status</th>
                      <th>Użytkownik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedAction.statusHistory].reverse().map((history, index) => (
                      <tr key={index}>
                        <td>{new Date(history.date).toLocaleDateString()}</td>
                        <td>
                          <Badge bg={
                            history.status === 'Zakończone' ? 'success' : 
                            history.status === 'W trakcie' ? 'primary' : 
                            history.status === 'Zaplanowane' ? 'info' : 
                            'secondary'
                          }>
                            {history.status}
                          </Badge>
                        </td>
                        <td>{history.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Brak historii zmian dla tego działania.
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowHistoryModal(false)}
          >
            Zamknij
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal załączników */}
      <Modal 
        show={showAttachmentsModal} 
        onHide={() => setShowAttachmentsModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faPaperclip} className="me-2" />
            Załączniki
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAction && (
            <div className="attachments-section">
              <h6 className="mb-3">Załączniki dla: {selectedAction.title}</h6>
              
              {selectedAction.attachments.length > 0 ? (
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Nazwa pliku</th>
                      <th>Typ</th>
                      <th>Data dodania</th>
                      <th>Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAction.attachments.map(attachment => (
                      <tr key={attachment.id}>
                        <td>
                          <FontAwesomeIcon 
                            icon={
                              attachment.type === 'document' ? faFileAlt : 
                              attachment.type === 'spreadsheet' ? faTable : 
                              faFileAlt
                            } 
                            className="me-2"
                          />
                          {attachment.name}
                        </td>
                        <td>
                          {attachment.type === 'document' ? 'Dokument' : 
                           attachment.type === 'spreadsheet' ? 'Arkusz kalkulacyjny' : 
                           'Inny'}
                        </td>
                        <td>{new Date(attachment.uploadedAt).toLocaleDateString()}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => alert(`Pobieranie pliku: ${attachment.name}`)}
                          >
                            <FontAwesomeIcon icon={faDownload} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Brak załączników dla tego działania.
                </Alert>
              )}
              
              <Form className="mt-3">
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nazwa pliku</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={newAttachment.name}
                        onChange={(e) => setNewAttachment({...newAttachment, name: e.target.value})}
                        placeholder="Wpisz nazwę pliku..."
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Typ</Form.Label>
                      <Form.Select 
                        value={newAttachment.type}
                        onChange={(e) => setNewAttachment({...newAttachment, type: e.target.value})}
                      >
                        <option value="document">Dokument</option>
                        <option value="spreadsheet">Arkusz kalkulacyjny</option>
                        <option value="other">Inny</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Button 
                  variant="primary"
                  onClick={handleAddAttachment}
                  disabled={!newAttachment.name.trim()}
                >
                  Dodaj załącznik
                </Button>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowAttachmentsModal(false)}
          >
            Zamknij
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default RemedialActionsSection;
