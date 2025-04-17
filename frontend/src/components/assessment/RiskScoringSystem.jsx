import React, { useState } from 'react';
import { Card, Form, Row, Col, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

/**
 * Komponent systemu punktacji ryzyka dla oceny RODO
 * 
 * Funkcjonalności:
 * - Skala punktacji ryzyka 1-5
 * - Automatyczne podsumowanie wyników
 * - Klasyfikacja poziomu ryzyka
 * - Kolorowe oznaczenia dla różnych poziomów ryzyka
 * - Podpowiedzi i objaśnienia
 */
const RiskScoringSystem = ({ chapterIndex, areaIndex, area, onScoreChange }) => {
  // Mockowe dane dla systemu punktacji ryzyka
  const [riskScores, setRiskScores] = useState({
    likelihood: 3, // Prawdopodobieństwo wystąpienia ryzyka (1-5)
    impact: 3,     // Wpływ na prawa i wolności (1-5)
    controls: 3,   // Skuteczność kontroli (1-5, gdzie 1 to najlepsze kontrole)
  });

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
      const totalScore = calculateRiskScore();
      const riskLevel = getRiskLevel(totalScore);
      onScoreChange(chapterIndex, areaIndex, totalScore, riskLevel.value);
    }
  };

  const riskScore = calculateRiskScore();
  const riskLevel = getRiskLevel(riskScore);

  // Opisy dla tooltipów
  const tooltips = {
    likelihood: "Prawdopodobieństwo wystąpienia naruszenia lub incydentu związanego z ochroną danych osobowych.",
    impact: "Potencjalny wpływ na prawa i wolności osób, których dane dotyczą, w przypadku naruszenia.",
    controls: "Skuteczność istniejących środków kontroli i zabezpieczeń (niższa wartość oznacza lepsze kontrole).",
    total: "Całkowity poziom ryzyka obliczony na podstawie prawdopodobieństwa, wpływu i skuteczności kontroli."
  };

  return (
    <Card className="mb-4 risk-scoring-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">System punktacji ryzyka</h5>
        <Badge bg={riskLevel.color} className="risk-level-badge">
          Ryzyko: {riskLevel.level} ({riskScore}/25)
        </Badge>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-3">
          Oceń poziom ryzyka związanego z przetwarzaniem danych osobowych w tym obszarze.
          Wynik zostanie automatycznie obliczony na podstawie wprowadzonych wartości.
        </p>
        
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
      </Card.Body>
    </Card>
  );
};

export default RiskScoringSystem;
