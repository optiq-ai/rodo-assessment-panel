import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faFilter, faSortAmountDown, faChartBar, faClipboardCheck, faHistory, faShieldAlt, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Komponent widgetu
const Widget = ({ title, children, toggleable = false, defaultActive = true }) => {
  const [active, setActive] = useState(defaultActive);

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span>{title}</span>
        {toggleable && (
          <label className="toggle-switch mb-0">
            <input 
              type="checkbox" 
              checked={active} 
              onChange={() => setActive(!active)}
            />
            <span className="toggle-slider"></span>
          </label>
        )}
      </div>
      {(!toggleable || active) && (
        <div className="widget-content">
          {children}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeWidgets, setActiveWidgets] = useState({
    recentAssessments: true,
    statistics: true,
    riskOverview: true,
    subscriptionInfo: true,
    quickActions: true
  });

  useEffect(() => {
    // Symulacja pobierania danych z API
    const fetchAssessments = async () => {
      try {
        // W rzeczywistości będzie to wywołanie do backendu
        // const response = await assessmentService.getAssessments();
        
        // Tymczasowe dane dla szkieletu
        const mockAssessments = [
          {
            id: 1,
            name: 'Ocena RODO - Dział IT',
            createdAt: '2025-04-15',
            status: 'W TRAKCIE',
            progress: 45,
            positiveAreas: 12,
            warningAreas: 8,
            negativeAreas: 3
          },
          {
            id: 2,
            name: 'Ocena RODO - Dział HR',
            createdAt: '2025-04-10',
            status: 'ZAKOŃCZONA',
            progress: 100,
            positiveAreas: 30,
            warningAreas: 15,
            negativeAreas: 4
          },
          {
            id: 3,
            name: 'Ocena RODO - Dział Marketingu',
            createdAt: '2025-04-05',
            status: 'W TRAKCIE',
            progress: 75,
            positiveAreas: 20,
            warningAreas: 10,
            negativeAreas: 2
          }
        ];
        
        setAssessments(mockAssessments);
      } catch (error) {
        console.error('Błąd podczas pobierania ocen:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  // Filtrowanie ocen
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assessment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Obliczanie statystyk
  const statistics = {
    total: assessments.length,
    completed: assessments.filter(a => a.status === 'ZAKOŃCZONA').length,
    inProgress: assessments.filter(a => a.status === 'W TRAKCIE').length,
    highRisk: assessments.filter(a => a.negativeAreas > 5).length
  };

  // Informacje o subskrypcji
  const subscriptionInfo = {
    plan: 'Darmowy',
    assessmentsLimit: 1,
    assessmentsUsed: assessments.length,
    expiryDate: 'Bezterminowo'
  };

  return (
    <Container className="main-container">
      <Row className="mb-4">
        <Col>
          <h1 className="app-title">Dashboard</h1>
          <p className="section-subtitle">
            Witaj, <strong>{currentUser?.username}</strong>! Poniżej znajdziesz podsumowanie ocen RODO i dostępne narzędzia.
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <div className="filter-bar">
            <span>Filtruj widgety:</span>
            <button 
              className={`filter-button ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              Wszystkie
            </button>
            <button 
              className={`filter-button ${filterStatus === 'W TRAKCIE' ? 'active' : ''}`}
              onClick={() => setFilterStatus('W TRAKCIE')}
            >
              W trakcie
            </button>
            <button 
              className={`filter-button ${filterStatus === 'ZAKOŃCZONA' ? 'active' : ''}`}
              onClick={() => setFilterStatus('ZAKOŃCZONA')}
            >
              Zakończone
            </button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Wyszukaj oceny..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      <div className="widgets-container">
        {/* Widget z ostatnimi ocenami */}
        <Widget 
          title="Ostatnie oceny RODO" 
          toggleable={true} 
          defaultActive={activeWidgets.recentAssessments}
        >
          {loading ? (
            <p className="text-center">Ładowanie ocen...</p>
          ) : filteredAssessments.length > 0 ? (
            <div>
              {filteredAssessments.map(assessment => (
                <div key={assessment.id} className="mb-3 p-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{assessment.name}</h6>
                      <p className="text-muted small mb-1">
                        Utworzono: {new Date(assessment.createdAt).toLocaleDateString()}
                      </p>
                      <div>
                        <Badge 
                          bg={assessment.status === 'ZAKOŃCZONA' ? 'success' : 'warning'}
                          className="me-2"
                        >
                          {assessment.status}
                        </Badge>
                        <Badge bg="info">
                          Postęp: {assessment.progress}%
                        </Badge>
                      </div>
                    </div>
                    <Link to={`/assessment/${assessment.id}`}>
                      <Button variant="outline-primary" size="sm">
                        Szczegóły
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              <div className="text-center mt-3">
                <Link to="/assessment/new">
                  <Button variant="primary">
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Nowa ocena
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p>Brak ocen spełniających kryteria wyszukiwania.</p>
              <Link to="/assessment/new">
                <Button variant="primary">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Nowa ocena
                </Button>
              </Link>
            </div>
          )}
        </Widget>

        {/* Widget ze statystykami */}
        <Widget 
          title="Statystyki" 
          toggleable={true} 
          defaultActive={activeWidgets.statistics}
        >
          <div className="d-flex flex-column">
            <div className="d-flex justify-content-between mb-3">
              <span>Wszystkie oceny:</span>
              <Badge bg="primary" pill>{statistics.total}</Badge>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span>Zakończone:</span>
              <Badge bg="success" pill>{statistics.completed}</Badge>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span>W trakcie:</span>
              <Badge bg="warning" pill>{statistics.inProgress}</Badge>
            </div>
            <div className="d-flex justify-content-between">
              <span>Wysokie ryzyko:</span>
              <Badge bg="danger" pill>{statistics.highRisk}</Badge>
            </div>
          </div>
        </Widget>

        {/* Widget z informacjami o subskrypcji */}
        <Widget 
          title="Informacje o subskrypcji" 
          toggleable={true} 
          defaultActive={activeWidgets.subscriptionInfo}
        >
          <div className="d-flex flex-column">
            <div className="d-flex justify-content-between mb-3">
              <span>Plan:</span>
              <Badge bg="primary">{subscriptionInfo.plan}</Badge>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span>Limit ocen:</span>
              <span>{subscriptionInfo.assessmentsUsed} / {subscriptionInfo.assessmentsLimit}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span>Ważność:</span>
              <span>{subscriptionInfo.expiryDate}</span>
            </div>
            <div className="text-center mt-2">
              <Link to="/settings/subscription">
                <Button variant="outline-primary" size="sm">
                  Zmień plan
                </Button>
              </Link>
            </div>
          </div>
        </Widget>

        {/* Widget z szybkimi akcjami */}
        <Widget 
          title="Szybkie akcje" 
          toggleable={true} 
          defaultActive={activeWidgets.quickActions}
        >
          <div className="d-flex flex-column gap-2">
            <Link to="/assessment/new">
              <Button variant="primary" className="w-100">
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Nowa ocena RODO
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline-primary" className="w-100">
                <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                Ustawienia bezpieczeństwa
              </Button>
            </Link>
            <Link to="/settings/company">
              <Button variant="outline-primary" className="w-100">
                <FontAwesomeIcon icon={faClipboardCheck} className="me-2" />
                Dane firmy
              </Button>
            </Link>
          </div>
        </Widget>
      </div>

      <Row className="mb-4">
        <Col>
          <Card className="widget-card">
            <Card.Header className="widget-header">
              <span>Konfiguracja widgetów</span>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Włączone widgety:</h6>
                  <div className="d-flex flex-column gap-2 mt-3">
                    {Object.entries(activeWidgets).map(([key, value]) => (
                      value && (
                        <div key={key} className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faToggleOn} className="text-success me-2" />
                          <span>{widgetNameTranslation(key)}</span>
                        </div>
                      )
                    ))}
                  </div>
                </Col>
                <Col md={6}>
                  <h6>Dostępne widgety:</h6>
                  <div className="d-flex flex-column gap-2 mt-3">
                    {Object.entries(activeWidgets).map(([key, value]) => (
                      !value && (
                        <div key={key} className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faToggleOff} className="text-secondary me-2" />
                          <span>{widgetNameTranslation(key)}</span>
                        </div>
                      )
                    ))}
                  </div>
                </Col>
              </Row>
              <div className="text-center mt-4">
                <Button variant="primary">
                  Zarządzaj widgetami
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// Funkcja pomocnicza do tłumaczenia nazw widgetów
const widgetNameTranslation = (key) => {
  const translations = {
    recentAssessments: 'Ostatnie oceny RODO',
    statistics: 'Statystyki',
    riskOverview: 'Przegląd ryzyka',
    subscriptionInfo: 'Informacje o subskrypcji',
    quickActions: 'Szybkie akcje'
  };
  return translations[key] || key;
};

export default Dashboard;
