import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Form, Table, Badge, Alert, OverlayTrigger, Tooltip, Tabs, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faExclamationTriangle, faInfoCircle, faDownload, faExchangeAlt, faArrowUp, faArrowDown, faEquals } from '@fortawesome/free-solid-svg-icons';
// Komentujemy import bibliotek wykresów i PDF do czasu rozwiązania problemu z zależnościami
// import jsPDF from 'jspdf';

/**
 * Komponent systemu oceny ryzyka RODO
 * 
 * Funkcjonalności:
 * - Ocena ryzyka w różnych obszarach RODO
 * - Historia ocen ryzyka
 * - Porównanie z poprzednimi ocenami
 * - Rekomendacje działań w zależności od poziomu ryzyka
 * - Eksport oceny ryzyka do PDF
 * - Analiza trendów ryzyka w czasie
 */
const RiskScoringSystem = ({ assessmentData, onRiskScoreChange }) => {
  // Mockowe dane dla oceny ryzyka
  const initialRiskData = {
    overallRisk: 65,
    lastUpdated: '2025-04-15',
    areas: [
      { id: 1, name: 'Zasady przetwarzania', score: 70, weight: 1.5, maxScore: 100 },
      { id: 2, name: 'Prawa podmiotów', score: 60, weight: 1.2, maxScore: 100 },
      { id: 3, name: 'Obowiązki administratora', score: 75, weight: 1.3, maxScore: 100 },
      { id: 4, name: 'Bezpieczeństwo danych', score: 50, weight: 1.8, maxScore: 100 },
      { id: 5, name: 'Przekazywanie danych', score: 60, weight: 1.0, maxScore: 100 },
      { id: 6, name: 'Dokumentacja', score: 80, weight: 1.2, maxScore: 100 }
    ],
    previousAssessments: [
      { 
        date: '2025-03-01', 
        overallRisk: 75,
        areas: [
          { id: 1, name: 'Zasady przetwarzania', score: 65 },
          { id: 2, name: 'Prawa podmiotów', score: 55 },
          { id: 3, name: 'Obowiązki administratora', score: 70 },
          { id: 4, name: 'Bezpieczeństwo danych', score: 60 },
          { id: 5, name: 'Przekazywanie danych', score: 70 },
          { id: 6, name: 'Dokumentacja', score: 75 }
        ]
      },
      { 
        date: '2025-01-15', 
        overallRisk: 85,
        areas: [
          { id: 1, name: 'Zasady przetwarzania', score: 60 },
          { id: 2, name: 'Prawa podmiotów', score: 50 },
          { id: 3, name: 'Obowiązki administratora', score: 65 },
          { id: 4, name: 'Bezpieczeństwo danych', score: 70 },
          { id: 5, name: 'Przekazywanie danych', score: 80 },
          { id: 6, name: 'Dokumentacja', score: 70 }
        ]
      }
    ]
  };

  const [riskData, setRiskData] = useState(assessmentData?.riskData || initialRiskData);
  const [activeTab, setActiveTab] = useState('current');
  const [selectedPreviousAssessment, setSelectedPreviousAssessment] = useState(null);
  const [showComparisonView, setShowComparisonView] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedScores, setEditedScores] = useState({});

  // Efekt do aktualizacji oceny ryzyka na podstawie danych z formularza
  useEffect(() => {
    if (assessmentData && assessmentData.riskData) {
      setRiskData(assessmentData.riskData);
    }
  }, [assessmentData]);

  // Efekt do powiadamiania rodzica o zmianach w ocenie ryzyka
  useEffect(() => {
    if (onRiskScoreChange) {
      onRiskScoreChange(riskData);
    }
  }, [riskData, onRiskScoreChange]);

  // Obliczanie ogólnego poziomu ryzyka
  const calculateOverallRisk = (areas) => {
    if (!areas || areas.length === 0) return 0;
    
    const totalWeightedScore = areas.reduce((sum, area) => sum + (area.score * area.weight), 0);
    const totalWeight = areas.reduce((sum, area) => sum + area.weight, 0);
    
    return Math.round(totalWeightedScore / totalWeight);
  };

  // Obsługa zmiany oceny ryzyka dla obszaru
  const handleScoreChange = (areaId, newScore) => {
    setEditedScores({
      ...editedScores,
      [areaId]: newScore
    });
  };

  // Zapisywanie zmian w ocenie ryzyka
  const saveRiskChanges = () => {
    const updatedAreas = riskData.areas.map(area => {
      if (editedScores[area.id] !== undefined) {
        return {
          ...area,
          score: parseInt(editedScores[area.id])
        };
      }
      return area;
    });
    
    const now = new Date().toISOString().split('T')[0];
    
    // Zapisanie poprzedniej oceny w historii
    const previousAssessment = {
      date: riskData.lastUpdated,
      overallRisk: riskData.overallRisk,
      areas: riskData.areas.map(area => ({
        id: area.id,
        name: area.name,
        score: area.score
      }))
    };
    
    const updatedRiskData = {
      ...riskData,
      areas: updatedAreas,
      overallRisk: calculateOverallRisk(updatedAreas),
      lastUpdated: now,
      previousAssessments: [previousAssessment, ...riskData.previousAssessments]
    };
    
    setRiskData(updatedRiskData);
    setEditMode(false);
    setEditedScores({});
  };

  // Anulowanie zmian w ocenie ryzyka
  const cancelRiskChanges = () => {
    setEditMode(false);
    setEditedScores({});
  };

  // Eksport oceny ryzyka do PDF
  const exportToPDF = () => {
    // Funkcjonalność eksportu do PDF zostanie zaimplementowana po rozwiązaniu problemu z zależnościami
    console.log('Eksport do PDF: ocena ryzyka');
    alert('Funkcja eksportu do PDF zostanie dostępna po rozwiązaniu problemu z zależnościami.');
    
    // Kod do odkomentowania po rozwiązaniu problemu z zależnościami
    /*
    const doc = new jsPDF();
    
    // Tytuł
    doc.setFontSize(18);
    doc.text('Ocena ryzyka RODO', 14, 22);
    
    // Data wygenerowania
    doc.setFontSize(10);
    doc.text(`Wygenerowano: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Data ostatniej aktualizacji: ${new Date(riskData.lastUpdated).toLocaleDateString()}`, 14, 35);
    
    // Ogólny poziom ryzyka
    doc.setFontSize(14);
    doc.text(`Ogólny poziom ryzyka: ${riskData.overallRisk}%`, 14, 45);
    
    // Tabela z oceną ryzyka dla obszarów
    const tableColumn = ["Obszar", "Ocena", "Waga", "Poziom ryzyka"];
    const tableRows = [];
    
    riskData.areas.forEach(area => {
      const riskLevel = area.score >= 80 ? 'Niski' : area.score >= 60 ? 'Średni' : 'Wysoki';
      
      const areaData = [
        area.name,
        `${area.score}%`,
        area.weight,
        riskLevel
      ];
      tableRows.push(areaData);
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 50 }
    });
    
    // Rekomendacje
    doc.setFontSize(14);
    doc.text('Rekomendacje:', 14, doc.autoTable.previous.finalY + 10);
    
    let yPos = doc.autoTable.previous.finalY + 15;
    
    // Dodanie rekomendacji dla obszarów wysokiego ryzyka
    const highRiskAreas = riskData.areas.filter(area => area.score < 60);
    if (highRiskAreas.length > 0) {
      doc.setFontSize(12);
      doc.text('Obszary wysokiego ryzyka (priorytet działań):', 14, yPos);
      yPos += 5;
      
      highRiskAreas.forEach(area => {
        yPos += 5;
        doc.setFontSize(10);
        doc.text(`- ${area.name}: ${getRecommendation(area.score, area.name)}`, 14, yPos);
      });
    }
    
    // Zapisz PDF
    doc.save('ocena-ryzyka-rodo.pdf');
    */
  };

  // Funkcja zwracająca rekomendację na podstawie oceny
  const getRecommendation = (score, areaName) => {
    if (score >= 80) {
      return `Obszar ${areaName} jest zgodny z wymogami RODO. Zalecane jest utrzymanie obecnych praktyk i regularne monitorowanie.`;
    } else if (score >= 60) {
      return `Obszar ${areaName} wymaga uwagi. Zalecane jest przeprowadzenie przeglądu procedur i wprowadzenie usprawnień.`;
    } else {
      return `Obszar ${areaName} wymaga natychmiastowych działań naprawczych. Konieczne jest opracowanie i wdrożenie planu naprawczego.`;
    }
  };

  // Funkcja zwracająca kolor na podstawie oceny
  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  // Funkcja zwracająca ikonę zmiany na podstawie porównania ocen
  const getChangeIcon = (currentScore, previousScore) => {
    if (currentScore > previousScore) {
      return <FontAwesomeIcon icon={faArrowUp} className="text-success" />;
    } else if (currentScore < previousScore) {
      return <FontAwesomeIcon icon={faArrowDown} className="text-danger" />;
    } else {
      return <FontAwesomeIcon icon={faEquals} className="text-secondary" />;
    }
  };

  // Przygotowanie danych do porównania
  const comparisonData = selectedPreviousAssessment ? {
    current: {
      date: riskData.lastUpdated,
      overallRisk: riskData.overallRisk,
      areas: riskData.areas
    },
    previous: selectedPreviousAssessment
  } : null;

  return (
    <Card className="mb-4 risk-scoring-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          System oceny ryzyka
        </h5>
        <div>
          {!editMode && activeTab === 'current' && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setEditMode(true)}
              className="me-2"
            >
              Edytuj ocenę ryzyka
            </Button>
          )}
          
          {activeTab === 'current' && !showComparisonView && (
            <Button 
              variant="outline-info" 
              size="sm"
              onClick={() => {
                setActiveTab('history');
              }}
              className="me-2"
            >
              Historia ocen
            </Button>
          )}
          
          {activeTab === 'history' && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => {
                setActiveTab('current');
                setShowComparisonView(false);
              }}
              className="me-2"
            >
              Aktualna ocena
            </Button>
          )}
          
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={exportToPDF}
          >
            <FontAwesomeIcon icon={faDownload} className="me-1" />
            Eksportuj do PDF
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {activeTab === 'current' && !showComparisonView && (
          <>
            <div className="mb-4">
              <Row>
                <Col md={6}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="risk-score-circle me-3">
                      <div className={`circle-inner bg-${getScoreColor(riskData.overallRisk)}`}>
                        <span className="risk-score">{riskData.overallRisk}%</span>
                      </div>
                    </div>
                    <div>
                      <h5 className="mb-1">Ogólny poziom ryzyka</h5>
                      <p className="text-muted mb-0">
                        Ostatnia aktualizacja: {new Date(riskData.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Alert variant={getScoreColor(riskData.overallRisk)}>
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    {riskData.overallRisk >= 80 ? (
                      'Organizacja jest w dużym stopniu zgodna z wymogami RODO. Zalecane jest utrzymanie obecnych praktyk i regularne monitorowanie.'
                    ) : riskData.overallRisk >= 60 ? (
                      'Organizacja wymaga uwagi w zakresie zgodności z RODO. Zalecane jest przeprowadzenie przeglądu procedur i wprowadzenie usprawnień.'
                    ) : (
                      'Organizacja wymaga natychmiastowych działań naprawczych w zakresie zgodności z RODO. Konieczne jest opracowanie i wdrożenie planu naprawczego.'
                    )}
                  </Alert>
                </Col>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header>
                      <h6 className="mb-0">Porównanie z poprzednią oceną</h6>
                    </Card.Header>
                    <Card.Body>
                      {riskData.previousAssessments.length > 0 ? (
                        <>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                              <h6>Aktualna ocena</h6>
                              <Badge bg={getScoreColor(riskData.overallRisk)} className="p-2">
                                {riskData.overallRisk}%
                              </Badge>
                            </div>
                            <div className="text-center">
                              {getChangeIcon(riskData.overallRisk, riskData.previousAssessments[0].overallRisk)}
                              <Badge 
                                bg={riskData.overallRisk >= riskData.previousAssessments[0].overallRisk ? 'success' : 'danger'}
                                className="ms-2"
                              >
                                {Math.abs(riskData.overallRisk - riskData.previousAssessments[0].overallRisk)}%
                              </Badge>
                            </div>
                            <div className="text-end">
                              <h6>Poprzednia ocena</h6>
                              <Badge bg={getScoreColor(riskData.previousAssessments[0].overallRisk)} className="p-2">
                                {riskData.previousAssessments[0].overallRisk}%
                              </Badge>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="w-100"
                            onClick={() => {
                              setSelectedPreviousAssessment(riskData.previousAssessments[0]);
                              setShowComparisonView(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
                            Szczegółowe porównanie
                          </Button>
                        </>
                      ) : (
                        <Alert variant="info">
                          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                          Brak wcześniejszych ocen do porównania.
                        </Alert>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
            
            <div className="mb-3">
              <h6>Ocena ryzyka dla poszczególnych obszarów</h6>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Obszar</th>
                    <th style={{width: '15%'}}>Waga</th>
                    <th style={{width: '15%'}}>Ocena</th>
                    <th style={{width: '15%'}}>Poziom ryzyka</th>
                    <th style={{width: '30%'}}>Rekomendacja</th>
                  </tr>
                </thead>
                <tbody>
                  {riskData.areas.map(area => {
                    const previousArea = riskData.previousAssessments.length > 0 
                      ? riskData.previousAssessments[0].areas.find(a => a.id === area.id)
                      : null;
                    
                    return (
                      <tr key={area.id}>
                        <td>{area.name}</td>
                        <td>{area.weight}</td>
                        <td>
                          {editMode ? (
                            <Form.Control 
                              type="number" 
                              min="0" 
                              max="100" 
                              value={editedScores[area.id] !== undefined ? editedScores[area.id] : area.score}
                              onChange={(e) => handleScoreChange(area.id, e.target.value)}
                            />
                          ) : (
                            <div className="d-flex align-items-center">
                              <Badge bg={getScoreColor(area.score)} className="p-2 me-2">
                                {area.score}%
                              </Badge>
                              {previousArea && (
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip>
                                      Poprzednia ocena: {previousArea.score}%
                                      {area.score !== previousArea.score && (
                                        <> ({area.score > previousArea.score ? '+' : ''}{area.score - previousArea.score}%)</>
                                      )}
                                    </Tooltip>
                                  }
                                >
                                  <span>{getChangeIcon(area.score, previousArea.score)}</span>
                                </OverlayTrigger>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <Badge bg={getScoreColor(area.score)}>
                            {area.score >= 80 ? 'Niski' : area.score >= 60 ? 'Średni' : 'Wysoki'}
                          </Badge>
                        </td>
                        <td>
                          <small>{getRecommendation(area.score, area.name)}</small>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              
              {editMode && (
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="outline-secondary" 
                    onClick={cancelRiskChanges}
                    className="me-2"
                  >
                    Anuluj
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={saveRiskChanges}
                  >
                    Zapisz zmiany
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
        
        {activeTab === 'current' && showComparisonView && comparisonData && (
          <div className="comparison-view">
            <div className="mb-3">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setShowComparisonView(false)}
              >
                &larr; Powrót do oceny ryzyka
              </Button>
            </div>
            
            <h6 className="mb-3">
              Porównanie oceny ryzyka z dnia {new Date(comparisonData.current.date).toLocaleDateString()} 
              z oceną z dnia {new Date(comparisonData.previous.date).toLocaleDateString()}
            </h6>
            
            <Row className="mb-4">
              <Col md={5}>
                <Card>
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">
                      Ocena z dnia {new Date(comparisonData.previous.date).toLocaleDateString()}
                    </h6>
                  </Card.Header>
                  <Card.Body className="text-center">
                    <div className="risk-score-circle mx-auto mb-3">
                      <div className={`circle-inner bg-${getScoreColor(comparisonData.previous.overallRisk)}`}>
                        <span className="risk-score">{comparisonData.previous.overallRisk}%</span>
                      </div>
                    </div>
                    <Badge bg={getScoreColor(comparisonData.previous.overallRisk)}>
                      {comparisonData.previous.overallRisk >= 80 ? 'Niskie ryzyko' : 
                       comparisonData.previous.overallRisk >= 60 ? 'Średnie ryzyko' : 
                       'Wysokie ryzyko'}
                    </Badge>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={2} className="d-flex align-items-center justify-content-center">
                <div className="text-center">
                  {getChangeIcon(comparisonData.current.overallRisk, comparisonData.previous.overallRisk)}
                  <Badge 
                    bg={comparisonData.current.overallRisk >= comparisonData.previous.overallRisk ? 'success' : 'danger'}
                    className="d-block mt-2"
                  >
                    {comparisonData.current.overallRisk >= comparisonData.previous.overallRisk ? '+' : ''}
                    {comparisonData.current.overallRisk - comparisonData.previous.overallRisk}%
                  </Badge>
                </div>
              </Col>
              
              <Col md={5}>
                <Card>
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">
                      Aktualna ocena ({new Date(comparisonData.current.date).toLocaleDateString()})
                    </h6>
                  </Card.Header>
                  <Card.Body className="text-center">
                    <div className="risk-score-circle mx-auto mb-3">
                      <div className={`circle-inner bg-${getScoreColor(comparisonData.current.overallRisk)}`}>
                        <span className="risk-score">{comparisonData.current.overallRisk}%</span>
                      </div>
                    </div>
                    <Badge bg={getScoreColor(comparisonData.current.overallRisk)}>
                      {comparisonData.current.overallRisk >= 80 ? 'Niskie ryzyko' : 
                       comparisonData.current.overallRisk >= 60 ? 'Średnie ryzyko' : 
                       'Wysokie ryzyko'}
                    </Badge>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Obszar</th>
                  <th style={{width: '15%'}}>Poprzednia ocena</th>
                  <th style={{width: '15%'}}>Aktualna ocena</th>
                  <th style={{width: '15%'}}>Zmiana</th>
                  <th style={{width: '30%'}}>Komentarz</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.current.areas.map(currentArea => {
                  const previousArea = comparisonData.previous.areas.find(a => a.id === currentArea.id);
                  const change = previousArea ? currentArea.score - previousArea.score : null;
                  
                  return (
                    <tr key={currentArea.id}>
                      <td>{currentArea.name}</td>
                      <td>
                        {previousArea ? (
                          <Badge bg={getScoreColor(previousArea.score)} className="p-2">
                            {previousArea.score}%
                          </Badge>
                        ) : (
                          <span className="text-muted">Brak danych</span>
                        )}
                      </td>
                      <td>
                        <Badge bg={getScoreColor(currentArea.score)} className="p-2">
                          {currentArea.score}%
                        </Badge>
                      </td>
                      <td>
                        {change !== null ? (
                          <div className="d-flex align-items-center">
                            {getChangeIcon(currentArea.score, previousArea.score)}
                            <Badge 
                              bg={change > 0 ? 'success' : change < 0 ? 'danger' : 'secondary'}
                              className="ms-2"
                            >
                              {change > 0 ? '+' : ''}{change}%
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted">Brak danych</span>
                        )}
                      </td>
                      <td>
                        {change !== null ? (
                          <small>
                            {change > 0 ? (
                              'Poprawa zgodności w tym obszarze.'
                            ) : change < 0 ? (
                              'Pogorszenie zgodności w tym obszarze. Zalecane działania naprawcze.'
                            ) : (
                              'Brak zmian w tym obszarze.'
                            )}
                          </small>
                        ) : (
                          <small className="text-muted">Brak danych do porównania.</small>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="history-view">
            <h6 className="mb-3">Historia ocen ryzyka</h6>
            
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Data</th>
                  <th style={{width: '15%'}}>Ogólny poziom ryzyka</th>
                  <th style={{width: '15%'}}>Zmiana</th>
                  <th style={{width: '20%'}}>Akcje</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{new Date(riskData.lastUpdated).toLocaleDateString()}</td>
                  <td>
                    <Badge bg={getScoreColor(riskData.overallRisk)} className="p-2">
                      {riskData.overallRisk}%
                    </Badge>
                  </td>
                  <td>
                    {riskData.previousAssessments.length > 0 && (
                      <div className="d-flex align-items-center">
                        {getChangeIcon(riskData.overallRisk, riskData.previousAssessments[0].overallRisk)}
                        <Badge 
                          bg={riskData.overallRisk >= riskData.previousAssessments[0].overallRisk ? 'success' : 'danger'}
                          className="ms-2"
                        >
                          {riskData.overallRisk >= riskData.previousAssessments[0].overallRisk ? '+' : ''}
                          {riskData.overallRisk - riskData.previousAssessments[0].overallRisk}%
                        </Badge>
                      </div>
                    )}
                  </td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => {
                        setActiveTab('current');
                        setShowComparisonView(false);
                      }}
                      className="me-2"
                    >
                      Szczegóły
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => exportToPDF()}
                    >
                      <FontAwesomeIcon icon={faDownload} className="me-1" />
                      Eksportuj
                    </Button>
                  </td>
                </tr>
                
                {riskData.previousAssessments.map((assessment, index) => {
                  const previousAssessment = index < riskData.previousAssessments.length - 1 
                    ? riskData.previousAssessments[index + 1]
                    : null;
                  
                  return (
                    <tr key={index}>
                      <td>{new Date(assessment.date).toLocaleDateString()}</td>
                      <td>
                        <Badge bg={getScoreColor(assessment.overallRisk)} className="p-2">
                          {assessment.overallRisk}%
                        </Badge>
                      </td>
                      <td>
                        {previousAssessment && (
                          <div className="d-flex align-items-center">
                            {getChangeIcon(assessment.overallRisk, previousAssessment.overallRisk)}
                            <Badge 
                              bg={assessment.overallRisk >= previousAssessment.overallRisk ? 'success' : 'danger'}
                              className="ms-2"
                            >
                              {assessment.overallRisk >= previousAssessment.overallRisk ? '+' : ''}
                              {assessment.overallRisk - previousAssessment.overallRisk}%
                            </Badge>
                          </div>
                        )}
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => {
                            setSelectedPreviousAssessment(assessment);
                            setShowComparisonView(true);
                            setActiveTab('current');
                          }}
                          className="me-2"
                        >
                          Porównaj
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => alert(`Eksport oceny z dnia ${new Date(assessment.date).toLocaleDateString()}`)}
                        >
                          <FontAwesomeIcon icon={faDownload} className="me-1" />
                          Eksportuj
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            
            <div className="mt-4">
              <h6>Analiza trendów ryzyka w czasie</h6>
              <div className="chart-container" style={{ position: 'relative', height: '300px', width: '100%' }}>
                <div className="text-center p-5 bg-light rounded">
                  <FontAwesomeIcon icon={faChartBar} size="3x" className="mb-3 text-primary" />
                  <h4>Wykres trendów ryzyka</h4>
                  <p className="text-muted">Wykres zostanie wyświetlony po rozwiązaniu problemu z zależnościami.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card.Body>
      
      <style jsx>{`
        .risk-score-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .circle-inner {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }
        
        .risk-score {
          font-size: 1.5rem;
        }
        
        .sortable-header {
          cursor: pointer;
        }
        
        .bg-success {
          background-color: #28a745;
        }
        
        .bg-warning {
          background-color: #ffc107;
        }
        
        .bg-danger {
          background-color: #dc3545;
        }
      `}</style>
    </Card>
  );
};

export default RiskScoringSystem;
