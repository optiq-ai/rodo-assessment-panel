import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Form, Table, Badge, Alert, OverlayTrigger, Tooltip, Tabs, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faChartPie, faChartLine, faInfoCircle, faDownload, faExchangeAlt, faHistory, faTable } from '@fortawesome/free-solid-svg-icons';
// Komentujemy import bibliotek wykresów i PDF do czasu rozwiązania problemu z zależnościami
// import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale } from 'chart.js';
// import { Pie, Bar, Line, PolarArea } from 'react-chartjs-2';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

/**
 * Komponent wizualizacji oceny RODO
 * 
 * Funkcjonalności:
 * - Różne typy wykresów (kołowy, słupkowy, liniowy, polarny)
 * - Porównanie z poprzednimi ocenami
 * - Analiza trendów w czasie
 * - Eksport wizualizacji do PNG/PDF
 * - Interaktywne elementy wykresów
 */
const AssessmentVisualizations = ({ assessmentData }) => {
  // Rejestracja komponentów ChartJS - zakomentowane do czasu rozwiązania problemu z zależnościami
  // ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale);
  
  // Mockowe dane dla wizualizacji
  const initialVisualizationData = {
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
        areas: [
          { id: 1, name: 'Zasady przetwarzania', score: 60 },
          { id: 2, name: 'Prawa podmiotów', score: 50 },
          { id: 3, name: 'Obowiązki administratora', score: 65 },
          { id: 4, name: 'Bezpieczeństwo danych', score: 70 },
          { id: 5, name: 'Przekazywanie danych', score: 80 },
          { id: 6, name: 'Dokumentacja', score: 70 }
        ]
      }
    ],
    complianceByCategory: {
      labels: ['Dane osobowe zwykłe', 'Dane wrażliwe', 'Dane dzieci', 'Profilowanie', 'Marketing', 'Monitoring'],
      datasets: [
        {
          label: 'Poziom zgodności (%)',
          data: [85, 70, 60, 75, 80, 65],
          backgroundColor: [
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 99, 132, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }
      ]
    },
    riskTrends: {
      labels: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień'],
      datasets: [
        {
          label: 'Ogólny poziom ryzyka',
          data: [85, 80, 75, 65],
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4
        },
        {
          label: 'Bezpieczeństwo danych',
          data: [70, 65, 60, 50],
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4
        },
        {
          label: 'Prawa podmiotów',
          data: [60, 65, 70, 60],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4
        }
      ]
    },
    complianceComparison: {
      labels: ['Zasady przetwarzania', 'Prawa podmiotów', 'Obowiązki administratora', 'Bezpieczeństwo danych', 'Przekazywanie danych', 'Dokumentacja'],
      datasets: [
        {
          label: 'Aktualna ocena',
          data: [70, 60, 75, 50, 60, 80],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Poprzednia ocena',
          data: [65, 55, 70, 60, 70, 75],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    }
  };

  const [visualizationData, setVisualizationData] = useState(assessmentData?.visualizationData || initialVisualizationData);
  const [activeTab, setActiveTab] = useState('overview');
  const [showComparisonView, setShowComparisonView] = useState(false);
  const [selectedPreviousAssessment, setSelectedPreviousAssessment] = useState(null);
  const [chartRefs, setChartRefs] = useState({
    pieChart: null,
    barChart: null,
    lineChart: null,
    polarChart: null
  });

  // Efekt do aktualizacji danych wizualizacji na podstawie danych z formularza
  useEffect(() => {
    if (assessmentData && assessmentData.visualizationData) {
      setVisualizationData(assessmentData.visualizationData);
    }
  }, [assessmentData]);

  // Funkcja zwracająca kolor na podstawie oceny
  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  // Eksport wykresu do PNG
  const exportChartToPNG = (chartType) => {
    // Funkcjonalność eksportu do PNG zostanie zaimplementowana po rozwiązaniu problemu z zależnościami
    console.log(`Eksport do PNG: ${chartType}`);
    alert('Funkcja eksportu do PNG zostanie dostępna po rozwiązaniu problemu z zależnościami.');
    
    // Kod do odkomentowania po rozwiązaniu problemu z zależnościami
    /*
    const chartRef = chartRefs[chartType];
    if (!chartRef) return;
    
    const chartElement = chartRef.current;
    if (!chartElement) return;
    
    html2canvas(chartElement).then(canvas => {
      const link = document.createElement('a');
      link.download = `rodo-${chartType}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
    */
  };

  // Eksport wszystkich wykresów do PDF
  const exportAllToPDF = () => {
    // Funkcjonalność eksportu do PDF zostanie zaimplementowana po rozwiązaniu problemu z zależnościami
    console.log('Eksport do PDF: wszystkie wykresy');
    alert('Funkcja eksportu do PDF zostanie dostępna po rozwiązaniu problemu z zależnościami.');
    
    // Kod do odkomentowania po rozwiązaniu problemu z zależnościami
    /*
    const doc = new jsPDF();
    
    // Tytuł
    doc.setFontSize(18);
    doc.text('Wizualizacje oceny RODO', 14, 22);
    
    // Data wygenerowania
    doc.setFontSize(10);
    doc.text(`Wygenerowano: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Data ostatniej aktualizacji: ${new Date(visualizationData.lastUpdated).toLocaleDateString()}`, 14, 35);
    
    // Eksport wykresów
    let yPosition = 45;
    const chartTypes = ['pieChart', 'barChart', 'lineChart', 'polarChart'];
    
    const exportCharts = async () => {
      for (const chartType of chartTypes) {
        const chartRef = chartRefs[chartType];
        if (!chartRef || !chartRef.current) continue;
        
        const canvas = await html2canvas(chartRef.current);
        const imgData = canvas.toDataURL('image/png');
        
        // Dodaj tytuł wykresu
        doc.setFontSize(14);
        doc.text(getChartTitle(chartType), 14, yPosition);
        yPosition += 5;
        
        // Dodaj wykres
        const imgWidth = 180;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
        
        yPosition += imgHeight + 15;
        
        // Jeśli nie ma wystarczająco miejsca na następny wykres, dodaj nową stronę
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
      }
      
      // Zapisz PDF
      doc.save('wizualizacje-oceny-rodo.pdf');
    };
    
    exportCharts();
    */
  };

  // Funkcja zwracająca tytuł wykresu
  const getChartTitle = (chartType) => {
    switch (chartType) {
      case 'pieChart':
        return 'Ocena obszarów RODO';
      case 'barChart':
        return 'Porównanie z poprzednią oceną';
      case 'lineChart':
        return 'Trendy ryzyka w czasie';
      case 'polarChart':
        return 'Poziom zgodności według kategorii';
      default:
        return '';
    }
  };

  // Przygotowanie danych do porównania
  const comparisonData = selectedPreviousAssessment ? {
    current: {
      date: visualizationData.lastUpdated,
      areas: visualizationData.areas
    },
    previous: selectedPreviousAssessment
  } : null;

  return (
    <Card className="mb-4 visualizations-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FontAwesomeIcon icon={faChartBar} className="me-2" />
          Wizualizacje oceny
        </h5>
        <div>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => {
              if (visualizationData.previousAssessments.length > 0) {
                setSelectedPreviousAssessment(visualizationData.previousAssessments[0]);
                setShowComparisonView(!showComparisonView);
              } else {
                alert('Brak wcześniejszych ocen do porównania.');
              }
            }}
            className="me-2"
          >
            <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
            {showComparisonView ? 'Ukryj porównanie' : 'Pokaż porównanie'}
          </Button>
          
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={exportAllToPDF}
          >
            <FontAwesomeIcon icon={faDownload} className="me-1" />
            Eksportuj wszystkie
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
            eventKey="overview" 
            title={
              <span>
                <FontAwesomeIcon icon={faChartPie} className="me-1" />
                Przegląd
              </span>
            }
          />
          <Tab 
            eventKey="trends" 
            title={
              <span>
                <FontAwesomeIcon icon={faChartLine} className="me-1" />
                Trendy
              </span>
            }
          />
          <Tab 
            eventKey="comparison" 
            title={
              <span>
                <FontAwesomeIcon icon={faTable} className="me-1" />
                Porównanie
              </span>
            }
          />
          <Tab 
            eventKey="history" 
            title={
              <span>
                <FontAwesomeIcon icon={faHistory} className="me-1" />
                Historia
              </span>
            }
          />
        </Tabs>
        
        {activeTab === 'overview' && (
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Ocena obszarów RODO</h6>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => exportChartToPNG('pieChart')}
                  >
                    <FontAwesomeIcon icon={faDownload} className="me-1" />
                    Eksportuj
                  </Button>
                </Card.Header>
                <Card.Body>
                  <div className="chart-container" style={{ position: 'relative', height: '300px', width: '100%' }} ref={ref => setChartRefs(prev => ({ ...prev, pieChart: { current: ref } }))}>
                    <div className="text-center p-5 bg-light rounded">
                      <FontAwesomeIcon icon={faChartPie} size="3x" className="mb-3 text-primary" />
                      <h4>Wykres kołowy oceny obszarów</h4>
                      <p className="text-muted">Wykres zostanie wyświetlony po rozwiązaniu problemu z zależnościami.</p>
                      <div className="mt-3">
                        <Table striped bordered hover size="sm">
                          <thead>
                            <tr>
                              <th>Obszar</th>
                              <th>Ocena</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visualizationData.areas.map(area => (
                              <tr key={area.id}>
                                <td>{area.name}</td>
                                <td>
                                  <Badge bg={getScoreColor(area.score)}>
                                    {area.score}%
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                    {/* Kod do odkomentowania po rozwiązaniu problemu z zależnościami */}
                    {/* <Pie 
                      data={{
                        labels: visualizationData.areas.map(area => area.name),
                        datasets: [
                          {
                            label: 'Ocena (%)',
                            data: visualizationData.areas.map(area => area.score),
                            backgroundColor: [
                              'rgba(54, 162, 235, 0.5)',
                              'rgba(255, 99, 132, 0.5)',
                              'rgba(255, 206, 86, 0.5)',
                              'rgba(75, 192, 192, 0.5)',
                              'rgba(153, 102, 255, 0.5)',
                              'rgba(255, 159, 64, 0.5)'
                            ],
                            borderColor: [
                              'rgba(54, 162, 235, 1)',
                              'rgba(255, 99, 132, 1)',
                              'rgba(255, 206, 86, 1)',
                              'rgba(75, 192, 192, 1)',
                              'rgba(153, 102, 255, 1)',
                              'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right'
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `${context.label}: ${context.raw}%`;
                              }
                            }
                          }
                        }
                      }}
                    /> */}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Poziom zgodności według kategorii</h6>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => exportChartToPNG('polarChart')}
                  >
                    <FontAwesomeIcon icon={faDownload} className="me-1" />
                    Eksportuj
                  </Button>
                </Card.Header>
                <Card.Body>
                  <div className="chart-container" style={{ position: 'relative', height: '300px', width: '100%' }} ref={ref => setChartRefs(prev => ({ ...prev, polarChart: { current: ref } }))}>
                    <div className="text-center p-5 bg-light rounded">
                      <FontAwesomeIcon icon={faChartPie} size="3x" className="mb-3 text-primary" />
                      <h4>Wykres polarny zgodności</h4>
                      <p className="text-muted">Wykres zostanie wyświetlony po rozwiązaniu problemu z zależnościami.</p>
                      <div className="mt-3">
                        <Table striped bordered hover size="sm">
                          <thead>
                            <tr>
                              <th>Kategoria</th>
                              <th>Zgodność</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visualizationData.complianceByCategory.labels.map((label, index) => (
                              <tr key={index}>
                                <td>{label}</td>
                                <td>
                                  <Badge bg={getScoreColor(visualizationData.complianceByCategory.datasets[0].data[index])}>
                                    {visualizationData.complianceByCategory.datasets[0].data[index]}%
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                    {/* Kod do odkomentowania po rozwiązaniu problemu z zależnościami */}
                    {/* <PolarArea 
                      data={visualizationData.complianceByCategory}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right'
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `${context.label}: ${context.raw}%`;
                              }
                            }
                          }
                        }
                      }}
                    /> */}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            {showComparisonView && comparisonData && (
              <Col md={12}>
                <Card className="mb-4">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      Porównanie z oceną z dnia {new Date(comparisonData.previous.date).toLocaleDateString()}
                    </h6>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => exportChartToPNG('barChart')}
                    >
                      <FontAwesomeIcon icon={faDownload} className="me-1" />
                      Eksportuj
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <div className="chart-container" style={{ position: 'relative', height: '300px', width: '100%' }} ref={ref => setChartRefs(prev => ({ ...prev, barChart: { current: ref } }))}>
                      <div className="text-center p-5 bg-light rounded">
                        <FontAwesomeIcon icon={faChartBar} size="3x" className="mb-3 text-primary" />
                        <h4>Wykres porównawczy ocen</h4>
                        <p className="text-muted">Wykres zostanie wyświetlony po rozwiązaniu problemu z zależnościami.</p>
                        <div className="mt-3">
                          <Table striped bordered hover size="sm">
                            <thead>
                              <tr>
                                <th>Obszar</th>
                                <th>Aktualna ocena</th>
                                <th>Poprzednia ocena</th>
                                <th>Zmiana</th>
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
                                      <Badge bg={getScoreColor(currentArea.score)}>
                                        {currentArea.score}%
                                      </Badge>
                                    </td>
                                    <td>
                                      {previousArea ? (
                                        <Badge bg={getScoreColor(previousArea.score)}>
                                          {previousArea.score}%
                                        </Badge>
                                      ) : (
                                        <span className="text-muted">Brak danych</span>
                                      )}
                                    </td>
                                    <td>
                                      {change !== null ? (
                                        <Badge bg={change > 0 ? 'success' : change < 0 ? 'danger' : 'secondary'}>
                                          {change > 0 ? '+' : ''}{change}%
                                        </Badge>
                                      ) : (
                                        <span className="text-muted">Brak danych</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        </div>
                      </div>
                      {/* Kod do odkomentowania po rozwiązaniu problemu z zależnościami */}
                      {/* <Bar 
                        data={visualizationData.complianceComparison}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top'
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `${context.dataset.label}: ${context.raw}%`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100,
                              title: {
                                display: true,
                                text: 'Ocena (%)'
                              }
                            }
                          }
                        }}
                      /> */}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        )}
        
        {activeTab === 'trends' && (
          <Row>
            <Col md={12}>
              <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Trendy ryzyka w czasie</h6>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => exportChartToPNG('lineChart')}
                  >
                    <FontAwesomeIcon icon={faDownload} className="me-1" />
                    Eksportuj
                  </Button>
                </Card.Header>
                <Card.Body>
                  <div className="chart-container" style={{ position: 'relative', height: '400px', width: '100%' }} ref={ref => setChartRefs(prev => ({ ...prev, lineChart: { current: ref } }))}>
                    <div className="text-center p-5 bg-light rounded">
                      <FontAwesomeIcon icon={faChartLine} size="3x" className="mb-3 text-primary" />
                      <h4>Wykres trendów ryzyka</h4>
                      <p className="text-muted">Wykres zostanie wyświetlony po rozwiązaniu problemu z zależnościami.</p>
                      <div className="mt-3">
                        <Table striped bordered hover size="sm">
                          <thead>
                            <tr>
                              <th>Miesiąc</th>
                              {visualizationData.riskTrends.datasets.map((dataset, index) => (
                                <th key={index}>{dataset.label}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {visualizationData.riskTrends.labels.map((label, labelIndex) => (
                              <tr key={labelIndex}>
                                <td>{label}</td>
                                {visualizationData.riskTrends.datasets.map((dataset, datasetIndex) => (
                                  <td key={datasetIndex}>
                                    <Badge bg={getScoreColor(dataset.data[labelIndex])}>
                                      {dataset.data[labelIndex]}%
                                    </Badge>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                    {/* Kod do odkomentowania po rozwiązaniu problemu z zależnościami */}
                    {/* <Line 
                      data={visualizationData.riskTrends}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top'
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `${context.dataset.label}: ${context.raw}%`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                              display: true,
                              text: 'Poziom ryzyka (%)'
                            },
                            reverse: true
                          }
                        }
                      }}
                    /> */}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={12}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">Analiza trendów</h6>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    Analiza trendów pokazuje zmiany poziomu ryzyka w czasie dla różnych obszarów RODO.
                  </Alert>
                  
                  <h6 className="mt-3">Kluczowe obserwacje:</h6>
                  <ul>
                    <li>Ogólny poziom ryzyka systematycznie maleje, co wskazuje na poprawę zgodności z RODO.</li>
                    <li>Obszar bezpieczeństwa danych wykazuje największy spadek poziomu ryzyka, co sugeruje skuteczność wdrożonych środków bezpieczeństwa.</li>
                    <li>Obszar praw podmiotów wykazuje wahania, co może wskazywać na potrzebę bardziej systematycznego podejścia.</li>
                  </ul>
                  
                  <h6 className="mt-3">Rekomendacje:</h6>
                  <ol>
                    <li>Kontynuować działania w obszarze bezpieczeństwa danych, które przynoszą pozytywne rezultaty.</li>
                    <li>Opracować bardziej systematyczne podejście do obszaru praw podmiotów, aby uniknąć wahań.</li>
                    <li>Monitorować trendy w kolejnych miesiącach, aby potwierdzić skuteczność wdrożonych działań.</li>
                  </ol>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
        
        {activeTab === 'comparison' && (
          <Row>
            <Col md={12}>
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">Porównanie z poprzednimi ocenami</h6>
                </Card.Header>
                <Card.Body>
                  {visualizationData.previousAssessments.length > 0 ? (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Wybierz ocenę do porównania</Form.Label>
                        <Form.Select 
                          value={selectedPreviousAssessment ? selectedPreviousAssessment.date : ''}
                          onChange={(e) => {
                            const selected = visualizationData.previousAssessments.find(a => a.date === e.target.value);
                            setSelectedPreviousAssessment(selected);
                            setShowComparisonView(!!selected);
                          }}
                        >
                          <option value="">Wybierz datę oceny</option>
                          {visualizationData.previousAssessments.map((assessment, index) => (
                            <option key={index} value={assessment.date}>
                              {new Date(assessment.date).toLocaleDateString()}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      
                      {showComparisonView && comparisonData && (
                        <>
                          <div className="chart-container" style={{ position: 'relative', height: '400px', width: '100%' }} ref={ref => setChartRefs(prev => ({ ...prev, barChart: { current: ref } }))}>
                            <div className="text-center p-5 bg-light rounded">
                              <FontAwesomeIcon icon={faChartBar} size="3x" className="mb-3 text-primary" />
                              <h4>Wykres porównawczy ocen</h4>
                              <p className="text-muted">Wykres zostanie wyświetlony po rozwiązaniu problemu z zależnościami.</p>
                            </div>
                            {/* Kod do odkomentowania po rozwiązaniu problemu z zależnościami */}
                            {/* <Bar 
                              data={{
                                labels: comparisonData.current.areas.map(area => area.name),
                                datasets: [
                                  {
                                    label: `Aktualna ocena (${new Date(comparisonData.current.date).toLocaleDateString()})`,
                                    data: comparisonData.current.areas.map(area => area.score),
                                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                    borderColor: 'rgba(54, 162, 235, 1)',
                                    borderWidth: 1
                                  },
                                  {
                                    label: `Ocena z dnia ${new Date(comparisonData.previous.date).toLocaleDateString()}`,
                                    data: comparisonData.current.areas.map(area => {
                                      const previousArea = comparisonData.previous.areas.find(a => a.id === area.id);
                                      return previousArea ? previousArea.score : 0;
                                    }),
                                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 1
                                  }
                                ]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'top'
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function(context) {
                                        return `${context.dataset.label}: ${context.raw}%`;
                                      }
                                    }
                                  }
                                },
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    max: 100,
                                    title: {
                                      display: true,
                                      text: 'Ocena (%)'
                                    }
                                  }
                                }
                              }}
                            /> */}
                          </div>
                          
                          <Table striped bordered hover className="mt-4">
                            <thead>
                              <tr>
                                <th>Obszar</th>
                                <th>Aktualna ocena ({new Date(comparisonData.current.date).toLocaleDateString()})</th>
                                <th>Poprzednia ocena ({new Date(comparisonData.previous.date).toLocaleDateString()})</th>
                                <th>Zmiana</th>
                                <th>Komentarz</th>
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
                                      <Badge bg={getScoreColor(currentArea.score)}>
                                        {currentArea.score}%
                                      </Badge>
                                    </td>
                                    <td>
                                      {previousArea ? (
                                        <Badge bg={getScoreColor(previousArea.score)}>
                                          {previousArea.score}%
                                        </Badge>
                                      ) : (
                                        <span className="text-muted">Brak danych</span>
                                      )}
                                    </td>
                                    <td>
                                      {change !== null ? (
                                        <Badge bg={change > 0 ? 'success' : change < 0 ? 'danger' : 'secondary'}>
                                          {change > 0 ? '+' : ''}{change}%
                                        </Badge>
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
                          
                          <div className="mt-4">
                            <h6>Podsumowanie zmian:</h6>
                            <p>
                              Porównanie aktualnej oceny z oceną z dnia {new Date(comparisonData.previous.date).toLocaleDateString()} 
                              pokazuje {
                                comparisonData.current.areas.reduce((sum, currentArea) => {
                                  const previousArea = comparisonData.previous.areas.find(a => a.id === currentArea.id);
                                  return previousArea ? sum + (currentArea.score - previousArea.score) : sum;
                                }, 0) > 0 ? 'poprawę' : 'pogorszenie'
                              } ogólnego poziomu zgodności z RODO.
                            </p>
                            <p>
                              Największą poprawę zaobserwowano w obszarze {
                                (() => {
                                  let maxImprovement = -Infinity;
                                  let maxImprovementArea = '';
                                  
                                  comparisonData.current.areas.forEach(currentArea => {
                                    const previousArea = comparisonData.previous.areas.find(a => a.id === currentArea.id);
                                    if (previousArea) {
                                      const improvement = currentArea.score - previousArea.score;
                                      if (improvement > maxImprovement) {
                                        maxImprovement = improvement;
                                        maxImprovementArea = currentArea.name;
                                      }
                                    }
                                  });
                                  
                                  return maxImprovementArea || 'brak danych';
                                })()
                              }.
                            </p>
                            <p>
                              Największe pogorszenie zaobserwowano w obszarze {
                                (() => {
                                  let maxDeterioration = Infinity;
                                  let maxDeteriorationArea = '';
                                  
                                  comparisonData.current.areas.forEach(currentArea => {
                                    const previousArea = comparisonData.previous.areas.find(a => a.id === currentArea.id);
                                    if (previousArea) {
                                      const deterioration = currentArea.score - previousArea.score;
                                      if (deterioration < maxDeterioration) {
                                        maxDeterioration = deterioration;
                                        maxDeteriorationArea = currentArea.name;
                                      }
                                    }
                                  });
                                  
                                  return maxDeteriorationArea || 'brak danych';
                                })()
                              }.
                            </p>
                          </div>
                        </>
                      )}
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
        )}
        
        {activeTab === 'history' && (
          <Row>
            <Col md={12}>
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">Historia ocen</h6>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Liczba obszarów</th>
                        <th>Średnia ocena</th>
                        <th>Najwyższa ocena</th>
                        <th>Najniższa ocena</th>
                        <th>Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{new Date(visualizationData.lastUpdated).toLocaleDateString()}</td>
                        <td>{visualizationData.areas.length}</td>
                        <td>
                          <Badge bg={getScoreColor(
                            visualizationData.areas.reduce((sum, area) => sum + area.score, 0) / visualizationData.areas.length
                          )}>
                            {Math.round(visualizationData.areas.reduce((sum, area) => sum + area.score, 0) / visualizationData.areas.length)}%
                          </Badge>
                        </td>
                        <td>
                          <Badge bg="success">
                            {Math.max(...visualizationData.areas.map(area => area.score))}%
                          </Badge>
                        </td>
                        <td>
                          <Badge bg="danger">
                            {Math.min(...visualizationData.areas.map(area => area.score))}%
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => {
                              setActiveTab('overview');
                              setShowComparisonView(false);
                            }}
                            className="me-2"
                          >
                            Szczegóły
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => exportAllToPDF()}
                          >
                            <FontAwesomeIcon icon={faDownload} className="me-1" />
                            Eksportuj
                          </Button>
                        </td>
                      </tr>
                      
                      {visualizationData.previousAssessments.map((assessment, index) => {
                        const avgScore = assessment.areas.reduce((sum, area) => sum + area.score, 0) / assessment.areas.length;
                        const maxScore = Math.max(...assessment.areas.map(area => area.score));
                        const minScore = Math.min(...assessment.areas.map(area => area.score));
                        
                        return (
                          <tr key={index}>
                            <td>{new Date(assessment.date).toLocaleDateString()}</td>
                            <td>{assessment.areas.length}</td>
                            <td>
                              <Badge bg={getScoreColor(avgScore)}>
                                {Math.round(avgScore)}%
                              </Badge>
                            </td>
                            <td>
                              <Badge bg="success">
                                {maxScore}%
                              </Badge>
                            </td>
                            <td>
                              <Badge bg="danger">
                                {minScore}%
                              </Badge>
                            </td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => {
                                  setSelectedPreviousAssessment(assessment);
                                  setShowComparisonView(true);
                                  setActiveTab('comparison');
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
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

export default AssessmentVisualizations;
