import React, { useState } from 'react';
import { Card, Form, Button, Table, Badge, Row, Col, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faCheck, faTimes, faInfoCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

/**
 * Komponent sekcji działań naprawczych dla oceny RODO
 * 
 * Funkcjonalności:
 * - Automatyczne generowanie rekomendacji na podstawie wyników oceny
 * - Miejsce na określenie osób odpowiedzialnych i terminów realizacji
 * - Śledzenie postępu wdrażania działań naprawczych
 * - Możliwość dodawania własnych działań naprawczych
 * - Filtrowanie i sortowanie działań
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
      notes: 'Przygotowano materiały szkoleniowe, ustalono harmonogram szkoleń'
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
      notes: ''
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
      notes: 'Polityka została zaktualizowana i zatwierdzona przez zarząd'
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
      notes: 'Nowe formularze zostały opracowane, oczekują na zatwierdzenie przez dział prawny'
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
    notes: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Wszystkie');
  const [filterPriority, setFilterPriority] = useState('Wszystkie');
  const [editingActionId, setEditingActionId] = useState(null);

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
        notes: 'Automatycznie wygenerowane na podstawie wyników oceny'
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
        notes: 'Automatycznie wygenerowane na podstawie wyników oceny'
      }
    ];
    
    setRemedialActions([...remedialActions, ...newRecommendations]);
  };

  // Obsługa dodawania nowego działania naprawczego
  const handleAddAction = () => {
    const actionWithId = {
      ...newAction,
      id: remedialActions.length + 1
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
      notes: ''
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
    setRemedialActions(remedialActions.map(action => 
      action.id === id ? { 
        ...action, 
        status: newStatus,
        progress: newStatus === 'Zakończone' ? 100 : (newStatus === 'Nierozpoczęte' ? 0 : action.progress)
      } : action
    ));
  };

  // Filtrowanie działań naprawczych
  const filteredActions = remedialActions.filter(action => {
    const statusMatch = filterStatus === 'Wszystkie' || action.status === filterStatus;
    const priorityMatch = filterPriority === 'Wszystkie' || action.priority === filterPriority;
    return statusMatch && priorityMatch;
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

  return (
    <Card className="mb-4 remedial-actions-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Działania naprawcze</h5>
        <div>
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="me-2"
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
        
        <div className="mb-3">
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filtruj według statusu</Form.Label>
                <Form.Select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-select-sm"
                >
                  <option value="Wszystkie">Wszystkie statusy</option>
                  <option value="Nierozpoczęte">Nierozpoczęte</option>
                  <option value="W trakcie">W trakcie</option>
                  <option value="Zakończone">Zakończone</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filtruj według priorytetu</Form.Label>
                <Form.Select 
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="form-select-sm"
                >
                  <option value="Wszystkie">Wszystkie priorytety</option>
                  <option value="Krytyczny">Krytyczny</option>
                  <option value="Wysoki">Wysoki</option>
                  <option value="Średni">Średni</option>
                  <option value="Niski">Niski</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <div className="text-end w-100">
                <Badge bg="secondary" className="me-2">
                  Łącznie: {filteredActions.length}
                </Badge>
                <Badge bg="danger" className="me-2">
                  Nierozpoczęte: {filteredActions.filter(a => a.status === 'Nierozpoczęte').length}
                </Badge>
                <Badge bg="warning" className="me-2">
                  W trakcie: {filteredActions.filter(a => a.status === 'W trakcie').length}
                </Badge>
                <Badge bg="success">
                  Zakończone: {filteredActions.filter(a => a.status === 'Zakończone').length}
                </Badge>
              </div>
            </Col>
          </Row>
        </div>
        
        {filteredActions.length > 0 ? (
          <div className="table-responsive">
            <Table striped hover className="remedial-actions-table">
              <thead>
                <tr>
                  <th style={{width: '15%'}}>Obszar</th>
                  <th style={{width: '20%'}}>Problem</th>
                  <th style={{width: '25%'}}>Rekomendacja</th>
                  <th style={{width: '10%'}}>Priorytet</th>
                  <th style={{width: '10%'}}>Osoba odpowiedzialna</th>
                  <th style={{width: '10%'}}>Termin</th>
                  <th style={{width: '10%'}}>Status</th>
                  <th style={{width: '10%'}}>Postęp</th>
                  <th style={{width: '10%'}}>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredActions.map(action => (
                  <tr key={action.id}>
                    <td>{action.area}</td>
                    <td>
                      {editingActionId === action.id ? (
                        <Form.Control 
                          type="text" 
                          value={action.issue}
                          onChange={(e) => handleSaveEdit(action.id, {...action, issue: e.target.value})}
                          size="sm"
                        />
                      ) : (
                        action.issue
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
                          type="text" 
                          value={action.responsiblePerson}
                          onChange={(e) => handleSaveEdit(action.id, {...action, responsiblePerson: e.target.value})}
                          size="sm"
                        />
                      ) : (
                        action.responsiblePerson || '-'
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
                        action.deadline ? new Date(action.deadline).toLocaleDateString() : '-'
                      )}
                    </td>
                    <td>
                      {editingActionId === action.id ? (
                        <Form.Select 
                          value={action.status}
                          onChange={(e) => handleSaveEdit(action.id, {
                            ...action, 
                            status: e.target.value,
                            progress: e.target.value === 'Zakończone' ? 100 : (e.target.value === 'Nierozpoczęte' ? 0 : action.progress)
                          })}
                          size="sm"
                        >
                          <option value="Nierozpoczęte">Nierozpoczęte</option>
                          <option value="W trakcie">W trakcie</option>
                          <option value="Zakończone">Zakończone</option>
                        </Form.Select>
                      ) : (
                        renderStatusBadge(action.status)
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
                                   parseInt(e.target.value) === 100 ? 'Zakończone' : 'W trakcie'
                          })}
                        />
                      ) : (
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
                      )}
                      <small>{action.progress}%</small>
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
        
        {filteredActions.length > 0 && (
          <div className="mt-3 p-3 bg-light rounded">
            <h6>Podsumowanie działań naprawczych</h6>
            <p className="text-muted small">
              Poniżej znajduje się podsumowanie postępu w realizacji działań naprawczych.
              Dąż do terminowej realizacji wszystkich działań, zaczynając od tych o najwyższym priorytecie.
            </p>
            
            <div className="progress mb-2" style={{height: '20px'}}>
              <div 
                className="progress-bar bg-success" 
                role="progressbar" 
                style={{width: `${(filteredActions.filter(a => a.status === 'Zakończone').length / filteredActions.length) * 100}%`}}
                aria-valuenow={(filteredActions.filter(a => a.status === 'Zakończone').length / filteredActions.length) * 100} 
                aria-valuemin="0" 
                aria-valuemax="100"
              >
                Zakończone
              </div>
              <div 
                className="progress-bar bg-warning" 
                role="progressbar" 
                style={{width: `${(filteredActions.filter(a => a.status === 'W trakcie').length / filteredActions.length) * 100}%`}}
                aria-valuenow={(filteredActions.filter(a => a.status === 'W trakcie').length / filteredActions.length) * 100} 
                aria-valuemin="0" 
                aria-valuemax="100"
              >
                W trakcie
              </div>
              <div 
                className="progress-bar bg-danger" 
                role="progressbar" 
                style={{width: `${(filteredActions.filter(a => a.status === 'Nierozpoczęte').length / filteredActions.length) * 100}%`}}
                aria-valuenow={(filteredActions.filter(a => a.status === 'Nierozpoczęte').length / filteredActions.length) * 100} 
                aria-valuemin="0" 
                aria-valuemax="100"
              >
                Nierozpoczęte
              </div>
            </div>
            
            <div className="d-flex justify-content-between text-muted small">
              <span>0%</span>
              <span>Postęp realizacji działań naprawczych</span>
              <span>100%</span>
            </div>
            
            {filteredActions.filter(a => a.status !== 'Zakończone' && a.priority === 'Krytyczny').length > 0 && (
              <div className="alert alert-danger mt-3">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                <strong>Uwaga!</strong> Masz {filteredActions.filter(a => a.status !== 'Zakończone' && a.priority === 'Krytyczny').length} niezakończonych działań o krytycznym priorytecie.
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RemedialActionsSection;
