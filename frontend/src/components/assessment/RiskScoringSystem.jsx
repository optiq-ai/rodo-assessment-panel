import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Badge, OverlayTrigger, Tooltip, Button, Table, Accordion } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faExclamationTriangle, faHistory, faChartLine, faSave, faFileExport } from '@fortawesome/free-solid-svg-icons';

/**
 * Komponent systemu punktacji ryzyka dla oceny RODO
 * 
 * Funkcjonalności:
 * - Skala punktacji ryzyka 1-5
 * - Automatyczne podsumowanie wyników
 * - Klasyfikacja poziomu ryzyka
 * - Kolorowe oznaczenia dla różnych poziomów ryzyka
 * - Podpowiedzi i objaśnienia
 * - Historia zmian oceny ryzyka
 * - Rekomendacje działań w zależności od poziomu ryzyka
 * - Eksport oceny ryzyka do PDF/CSV
 */
const RiskScoringSystem = ({ chapterIndex, areaIndex, area, onScoreChange }) => {
  // Inicjalizacja stanu z danymi obszaru, jeśli są dostępne
  const initialRiskScores = area?.riskScore?.details || {
    likelihood: 3, // Prawdopodobieństwo wystąpienia ryzyka (1-5)
    impact: 3,     // Wpływ na prawa i wolności (1-5)
    controls: 3,   // Skuteczność kontroli (1-5, gdzie 1 to najlepsze kontrole)
  };

  const [riskScores, setRiskScores] = useState(initialRiskScores);
  const [showHistory, setShowHistory] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [riskHistory, setRiskHistory] = useState([
    {
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      user: 'Jan Kowalski',
      likelihood: 4,
      impact: 4,
      controls: 2,
      score: 8,
      level: 'Średnie'
    },
    {
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      user: 'Anna Nowak',
      likelihood: 3,
      impact: 4,
      controls: 2,
      score: 6,
      level: 'Średnie'
    }
  ]);

  // Aktualizacja stanu, gdy zmienia się obszar
  useEffect(() => {
    if (area?.riskScore?.details) {
      setRiskScores(area.riskScore.details);
    } else {
      setRiskScores(initialRiskScores);
    }
  }, [area, chapterIndex, areaIndex]);

  // Obliczanie całkowitego wyniku ryzyka
  const calculateRiskScore = () => {
    return Math.round((riskScores.likelihood * riskScores.impact) / riskScores.controls);
  };

  // Określanie poziomu ryzyka na podstawie wyniku
  const getRiskLevel = (score) => {
    if (score <= 3) return { level: 'Niskie', color: 'success', value: 1 };
    if (score <= 9) return { level: 'Średnie', color: 'warning', value: 2 };
    return { level: 'Wysokie', color: 'danger', value: 3 };
  };

  // Obsługa zmiany wartości punktacji
  const handleRiskScoreChange = (factor, value) => {
    const newScores = { ...riskScores, [factor]: parseInt(value) };
    setRiskScores(newScores);
    
    // Wywołanie funkcji zwrotnej z nowym wynikiem
    if (onScoreChange) {
      const totalScore = Math.round((newScores.likelihood * newScores.impact) / newScores.controls);
      const riskLevel = getRiskLevel(totalScore);
      onScoreChange(chapterIndex, areaIndex, totalScore, riskLevel.value);
    }
  };

  // Zapisanie historii oceny ryzyka
  const saveRiskHistory = () => {
    const currentScore = calculateRiskScore();
    const currentLevel = getRiskLevel(currentScore);
    
    const newHistoryEntry = {
      date: new Date().toISOString().split('T')[0],
      user: 'Aktualny użytkownik', // W rzeczywistej aplikacji byłoby to pobierane z kontekstu uwierzytelniania
      likelihood: riskScores.likelihood,
      impact: riskScores.impact,
      controls: riskScores.controls,
      score: currentScore,
      level: currentLevel.level
    };
    
    setRiskHistory([newHistoryEntry, ...riskHistory]);
    setShowHistory(true);
  };

  // Eksport oceny ryzyka
  const exportRiskAssessment = () => {
    const currentScore = calculateRiskScore();
    const currentLevel = getRiskLevel(currentScore);
    
    const exportData = {
      area: area.name,
      date: new Date().toISOString().split('T')[0],
      riskFactors: {
        likelihood: {
          value: riskScores.likelihood,
          description: "Prawdopodobieństwo wystąpienia naruszenia"
        },
        impact: {
          value: riskScores.impact,
          description: "Wpływ na prawa i wolności"
        },
        controls: {
          value: riskScores.controls,
          description: "Skuteczność istniejących kontroli"
        }
      },
      result: {
        score: currentScore,
        level: currentLevel.level,
        recommendations: getRecommendations(currentLevel.value)
      },
      history: riskHistory
    };
    
    // W rzeczywistej aplikacji tutaj byłby kod do generowania PDF lub CSV
    // Na potrzeby mockowe, po prostu zapisujemy jako JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocena-ryzyka-${area.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generowanie rekomendacji na podstawie poziomu ryzyka
  const getRecommendations = (riskLevelValue) => {
    const baseRecommendations = [
      "Regularny przegląd i aktualizacja polityk ochrony danych",
      "Szkolenia pracowników z zakresu ochrony danych osobowych",
      "Dokumentowanie wszystkich procesów przetwarzania danych"
    ];
    
    const mediumRiskRecommendations = [
      "Przeprowadzenie szczegółowej analizy procesów przetwarzania danych",
      "Wdrożenie dodatkowych środków technicznych i organizacyjnych",
      "Konsultacja z Inspektorem Ochrony Danych"
    ];
    
    const highRiskRecommendations = [
      "Przeprowadzenie pełnej oceny skutków dla ochrony danych (DPIA)",
      "Wdrożenie zaawansowanych środków bezpieczeństwa",
      "Konsultacja z organem nadzorczym",
      "Przegląd i rewizja wszystkich procesów przetwarzania danych"
    ];
    
    if (riskLevelValue === 3) {
      return [...baseRecommendations, ...mediumRiskRecommendations, ...highRiskRecommendations];
    } else if (riskLevelValue === 2) {
      return [...baseRecommendations, ...mediumRiskRecommendations];
    } else {
      return baseRecommendations;
    }
  };

  const riskScore = calculateRiskScore();
  const riskLevel = getRiskLevel(riskScore);
  const recommendations = getRecommendations(riskLevel.value);

  // Opisy dla tooltipów
  const tooltips = {
    likelihood: "Prawdopodobieństwo wystąpienia naruszenia lub incydentu związanego z ochroną danych osobowych.",
    impact: "Potencjalny wpływ na prawa i wolności osób, których dane dotyczą, w przypadku naruszenia.",
    controls: "Skuteczność istniejących środków kontroli i zabezpieczeń (niższa wartość oznacza lepsze kontrole).",
    total: "Całkowity poziom ryzyka obliczony na podstawie prawdopodobieństwa, wpływu i skuteczności kontroli."
  };

  // Porównanie z poprzednią oceną ryzyka
  const getPreviousRiskScore = () => {
    if (riskHistory.length > 0) {
      return riskHistory[0].score;
    }
    return null;
  };

  const previousScore = getPreviousRiskScore();
  const scoreDifference = previousScore !== null ? riskScore - previousScore : null;

  return (
    <Card className="mb-4 risk-scoring-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">System punktacji ryzyka</h5>
        <div>
          {scoreDifference !== null && (
            <Badge 
              bg={scoreDifference > 0 ? 'danger' : scoreDifference < 0 ? 'success' : 'secondary'} 
              className="me-2"
            >
              {scoreDifference > 0 ? '+' : ''}{scoreDifference}
            </Badge>
          )}
          <Badge bg={riskLevel.color} className="risk-level-badge">
            Ryzyko: {riskLevel.level} ({riskScore}/25)
          </Badge>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between mb-3">
          <p className="text-muted">
            Oceń poziom ryzyka związanego z przetwarzaniem danych osobowych w tym obszarze.
            Wynik zostanie automatycznie obliczony na podstawie wprowadzonych wartości.
          </p>
          <div>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="me-2"
              onClick={() => setShowHistory(!showHistory)}
            >
              <FontAwesomeIcon icon={faHistory} className="me-1" />
              Historia
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm" 
              className="me-2"
              onClick={() => setShowRecommendations(!showRecommendations)}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
              Rekomendacje
            </Button>
            <Button 
              variant="outline-success" 
              size="sm" 
              className="me-2"
              onClick={saveRiskHistory}
            >
              <FontAwesomeIcon icon={faSave} className="me-1" />
              Zapisz
            </Button>
            <Button 
              variant="outline-dark" 
              size="sm"
              onClick={exportRiskAssessment}
            >
              <FontAwesomeIcon icon={faFileExport} className="me-1" />
              Eksport
            </Button>
          </div>
        </div>
        
        <Row className="mb-4">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="d-flex align-items-center">
                Prawdopodobieństwo 
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>{tooltips.likelihood}</Tooltip>}
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="ms-2 text-primary" />
                </OverlayTrigger>
              </Form.Label>
              <Form.Range 
                min={1} 
                max={5} 
                value={riskScores.likelihood}
                onChange={(e) => handleRiskScoreChange('likelihood', e.target.value)}
                className="risk-slider"
              />
              <div className="d-flex justify-content-between">
                <small>Bardzo niskie</small>
                <small>Bardzo wysokie</small>
              </div>
              <div className="text-center mt-1">
                <Badge bg="secondary">{riskScores.likelihood}</Badge>
                {riskHistory.length > 0 && riskScores.likelihood !== riskHistory[0].likelihood && (
                  <Badge 
                    bg={riskScores.likelihood > riskHistory[0].likelihood ? 'danger' : 'success'} 
                    className="ms-2"
                  >
                    {riskScores.likelihood > riskHistory[0].likelihood ? '+' : ''}
                    {riskScores.likelihood - riskHistory[0].likelihood}
                  </Badge>
                )}
              </div>
            </Form.Group>
          </Col>
          
          <Col md={4}>
            <Form.Group>
              <Form.Label className="d-flex align-items-center">
                Wpływ 
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>{tooltips.impact}</Tooltip>}
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="ms-2 text-primary" />
                </OverlayTrigger>
              </Form.Label>
              <Form.Range 
                min={1} 
                max={5} 
                value={riskScores.impact}
                onChange={(e) => handleRiskScoreChange('impact', e.target.value)}
                className="risk-slider"
              />
              <div className="d-flex justify-content-between">
                <small>Minimalny</small>
                <small>Krytyczny</small>
              </div>
              <div className="text-center mt-1">
                <Badge bg="secondary">{riskScores.impact}</Badge>
                {riskHistory.length > 0 && riskScores.impact !== riskHistory[0].impact && (
                  <Badge 
                    bg={riskScores.impact > riskHistory[0].impact ? 'danger' : 'success'} 
                    className="ms-2"
                  >
                    {riskScores.impact > riskHistory[0].impact ? '+' : ''}
                    {riskScores.impact - riskHistory[0].impact}
                  </Badge>
                )}
              </div>
            </Form.Group>
          </Col>
          
          <Col md={4}>
            <Form.Group>
              <Form.Label className="d-flex align-items-center">
                Skuteczność kontroli 
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>{tooltips.controls}</Tooltip>}
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="ms-2 text-primary" />
                </OverlayTrigger>
              </Form.Label>
              <Form.Range 
                min={1} 
                max={5} 
                value={riskScores.controls}
                onChange={(e) => handleRiskScoreChange('controls', e.target.value)}
                className="risk-slider"
              />
              <div className="d-flex justify-content-between">
                <small>Bardzo skuteczne</small>
                <small>Nieskuteczne</small>
              </div>
              <div className="text-center mt-1">
                <Badge bg="secondary">{riskScores.controls}</Badge>
                {riskHistory.length > 0 && riskScores.controls !== riskHistory[0].controls && (
                  <Badge 
                    bg={riskScores.controls > riskHistory[0].controls ? 'danger' : 'success'} 
                    className="ms-2"
                  >
                    {riskScores.controls > riskHistory[0].controls ? '+' : ''}
                    {riskScores.controls - riskHistory[0].controls}
                  </Badge>
                )}
              </div>
            </Form.Group>
          </Col>
        </Row>
        
        <div className="risk-result p-3 rounded">
          <h6 className="d-flex align-items-center">
            Wynik oceny ryzyka 
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{tooltips.total}</Tooltip>}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="ms-2 text-primary" />
            </OverlayTrigger>
          </h6>
          
          <div className="progress mb-2" style={{height: '20px'}}>
            <div 
              className={`progress-bar bg-${riskLevel.color}`}
              role="progressbar" 
              style={{width: `${(riskScore/25)*100}%`}}
              aria-valuenow={riskScore} 
              aria-valuemin="0" 
              aria-valuemax="25"
            >
              {riskScore}/25
            </div>
          </div>
          
          <div className="d-flex justify-content-between text-muted">
            <small>Niskie ryzyko</small>
            <small>Średnie ryzyko</small>
            <small>Wysokie ryzyko</small>
          </div>
          
          {riskLevel.value >= 2 && (
            <div className="alert alert-warning mt-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              {riskLevel.value === 3 ? (
                <span>Wykryto <strong>wysokie ryzyko</strong>. Zalecane jest przeprowadzenie pełnej oceny skutków dla ochrony danych (DPIA) oraz wdrożenie dodatkowych środków bezpieczeństwa.</span>
              ) : (
                <span>Wykryto <strong>średnie ryzyko</strong>. Zalecane jest rozważenie dodatkowych środków kontroli i zabezpieczeń.</span>
              )}
            </div>
          )}
        </div>
        
        {showHistory && (
          <div className="mt-4">
            <h6 className="d-flex align-items-center mb-3">
              <FontAwesomeIcon icon={faHistory} className="me-2" />
              Historia ocen ryzyka
            </h6>
            {riskHistory.length > 0 ? (
              <div className="table-responsive">
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Użytkownik</th>
                      <th>Prawdopodobieństwo</th>
                      <th>Wpływ</th>
                      <th>Kontrole</th>
                      <th>Wynik</th>
                      <th>Poziom ryzyka</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskHistory.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.date}</td>
                        <td>{entry.user}</td>
                        <td>{entry.likelihood}</td>
                        <td>{entry.impact}</td>
                        <td>{entry.controls}</td>
                        <td>{entry.score}</td>
                        <td>
                          <Badge bg={
                            entry.level === 'Wysokie' ? 'danger' : 
                            entry.level === 'Średnie' ? 'warning' : 
                            'success'
                          }>
                            {entry.level}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <p className="text-muted">Brak historii ocen ryzyka dla tego obszaru.</p>
            )}
          </div>
        )}
        
        {showRecommendations && (
          <div className="mt-4">
            <h6 className="d-flex align-items-center mb-3">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              Rekomendowane działania
            </h6>
            <Accordion defaultActiveKey="0">
              {recommendations.map((recommendation, index) => (
                <Accordion.Item key={index} eventKey={index.toString()}>
                  <Accordion.Header>
                    <span className={index < 3 ? 'text-primary' : index < 6 ? 'text-warning' : 'text-danger'}>
                      {recommendation}
                    </span>
                  </Accordion.Header>
                  <Accordion.Body>
                    <p className="text-muted">
                      {index < 3 ? (
                        "Podstawowe działanie zalecane dla wszystkich poziomów ryzyka. Stanowi dobrą praktykę w zakresie ochrony danych osobowych."
                      ) : index < 6 ? (
                        "Działanie zalecane dla średniego i wysokiego poziomu ryzyka. Pomaga w znacznym ograniczeniu ryzyka naruszenia ochrony danych."
                      ) : (
                        "Działanie krytyczne, zalecane dla wysokiego poziomu ryzyka. Niezbędne do odpowiedniego zabezpieczenia danych osobowych."
                      )}
                    </p>
                    <div className="d-flex justify-content-end">
                      <Button variant="outline-primary" size="sm">
                        Dodaj do działań naprawczych
                      </Button>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => {
              const currentScore = calculateRiskScore();
              const currentLevel = getRiskLevel(currentScore);
              
              // Symulacja analizy trendów
              const trendData = [
                { date: '2025-01-15', score: 12 },
                { date: '2025-02-15', score: 10 },
                { date: '2025-03-15', score: 8 },
                { date: '2025-04-15', score: currentScore }
              ];
              
              // W rzeczywistej aplikacji tutaj byłby kod do wyświetlania wykresu trendów
              alert(`Analiza trendów ryzyka dla obszaru "${area.name}":\n\n` + 
                    trendData.map(item => `${item.date}: ${item.score}/25`).join('\n') + 
                    `\n\nObecny poziom ryzyka: ${currentLevel.level} (${currentScore}/25)`);
            }}
          >
            <FontAwesomeIcon icon={faChartLine} className="me-1" />
            Analiza trendów ryzyka
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RiskScoringSystem;
