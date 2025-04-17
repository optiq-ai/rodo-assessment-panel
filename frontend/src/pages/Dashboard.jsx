import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ZAKOŃCZONA':
        return 'bg-success';
      case 'W TRAKCIE':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h1>Dashboard</h1>
          <p className="lead">Witaj, {currentUser?.username}! Poniżej znajdziesz podsumowanie ocen RODO.</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="dashboard-card">
            <Card.Body className="text-center">
              <h3>{assessments.length}</h3>
              <p>Wszystkie oceny</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="dashboard-card">
            <Card.Body className="text-center">
              <h3>{assessments.filter(a => a.status === 'W TRAKCIE').length}</h3>
              <p>Oceny w trakcie</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="dashboard-card">
            <Card.Body className="text-center">
              <h3>{assessments.filter(a => a.status === 'ZAKOŃCZONA').length}</h3>
              <p>Zakończone oceny</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Twoje oceny</h5>
              <Button as={Link} to="/assessment" variant="primary">Nowa ocena</Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p className="text-center">Ładowanie ocen...</p>
              ) : assessments.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Nazwa</th>
                      <th>Data utworzenia</th>
                      <th>Status</th>
                      <th>Postęp</th>
                      <th>Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map(assessment => (
                      <tr key={assessment.id}>
                        <td>{assessment.name}</td>
                        <td>{assessment.createdAt}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(assessment.status)}`}>
                            {assessment.status}
                          </span>
                        </td>
                        <td>
                          <div className="progress">
                            <div 
                              className="progress-bar" 
                              role="progressbar" 
                              style={{ width: `${assessment.progress}%` }}
                              aria-valuenow={assessment.progress} 
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            >
                              {assessment.progress}%
                            </div>
                          </div>
                        </td>
                        <td>
                          <Button 
                            as={Link} 
                            to={`/assessment/${assessment.id}`} 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                          >
                            Edytuj
                          </Button>
                          <Button 
                            as={Link} 
                            to={`/results/${assessment.id}`} 
                            variant="outline-info" 
                            size="sm"
                          >
                            Wyniki
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center">Brak ocen. Kliknij "Nowa ocena", aby rozpocząć.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Podsumowanie wyników</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p className="text-center">Ładowanie wyników...</p>
              ) : assessments.length > 0 ? (
                <Row>
                  <Col md={6}>
                    <h6>Obszary z oceną pozytywną</h6>
                    <div className="progress mb-3">
                      <div 
                        className="progress-bar bg-success" 
                        role="progressbar" 
                        style={{ width: `${(assessments.reduce((sum, a) => sum + a.positiveAreas, 0) / (assessments.reduce((sum, a) => sum + a.positiveAreas + a.warningAreas + a.negativeAreas, 0)) * 100).toFixed(0)}%` }}
                      >
                        {(assessments.reduce((sum, a) => sum + a.positiveAreas, 0) / (assessments.reduce((sum, a) => sum + a.positiveAreas + a.warningAreas + a.negativeAreas, 0)) * 100).toFixed(0)}%
                      </div>
                    </div>
                    
                    <h6>Obszary z zastrzeżeniami</h6>
                    <div className="progress mb-3">
                      <div 
                        className="progress-bar bg-warning text-dark" 
                        role="progressbar" 
                        style={{ width: `${(assessments.reduce((sum, a) => sum + a.warningAreas, 0) / (assessments.reduce((sum, a) => sum + a.positiveAreas + a.warningAreas + a.negativeAreas, 0)) * 100).toFixed(0)}%` }}
                      >
                        {(assessments.reduce((sum, a) => sum + a.warningAreas, 0) / (assessments.reduce((sum, a) => sum + a.positiveAreas + a.warningAreas + a.negativeAreas, 0)) * 100).toFixed(0)}%
                      </div>
                    </div>
                    
                    <h6>Obszary z oceną negatywną</h6>
                    <div className="progress mb-3">
                      <div 
                        className="progress-bar bg-danger" 
                        role="progressbar" 
                        style={{ width: `${(assessments.reduce((sum, a) => sum + a.negativeAreas, 0) / (assessments.reduce((sum, a) => sum + a.positiveAreas + a.warningAreas + a.negativeAreas, 0)) * 100).toFixed(0)}%` }}
                      >
                        {(assessments.reduce((sum, a) => sum + a.negativeAreas, 0) / (assessments.reduce((sum, a) => sum + a.positiveAreas + a.warningAreas + a.negativeAreas, 0)) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="text-center">
                      <p>Łączna liczba ocenionych obszarów: {assessments.reduce((sum, a) => sum + a.positiveAreas + a.warningAreas + a.negativeAreas, 0)}</p>
                      <Button as={Link} to="/results" variant="outline-primary">Zobacz szczegółowe raporty</Button>
                    </div>
                  </Col>
                </Row>
              ) : (
                <p className="text-center">Brak danych do wyświetlenia.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
