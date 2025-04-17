import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Form, Nav, Tab, Button, ButtonGroup, Dropdown, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import { Radar, Bar, Doughnut, Line, PolarArea } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement, Title } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faInfoCircle, faChartLine, faChartPie, faChartBar, faSync, faCalendarAlt, faHistory } from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Rejestracja komponentów ChartJS
ChartJS.register(
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  ChartTooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title
);

/**
 * Komponent wizualizacji dla oceny RODO
 * 
 * Funkcjonalności:
 * - Wykresy radarowe pokazujące poziom zgodności w różnych obszarach
 * - Wykresy słupkowe do porównania ryzyka w różnych kategoriach
 * - Wykresy kołowe pokazujące rozkład ocen
 * - Kolorowe oznaczenia dla łatwej identyfikacji obszarów problematycznych
 * - Interaktywne elementy do eksploracji danych
 * - Możliwość eksportu wizualizacji do PDF/PNG
 * - Porównanie z poprzednimi ocenami
 * - Analiza trendów w czasie
 */
const AssessmentVisualizations = ({ assessmentData }) => {
  const [activeTab, setActiveTab] = useState('radar');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [showTrendModal, setShowTrendModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [exportFormat, setExportFormat] = useState('png');
  const chartRef = useRef(null);
  
  // Mockowe dane dla wizualizacji
  const [mockData, setMockData] = useState({
    chapters: [
      { name: 'Zasady przetwarzania', score: 75 },
      { name: 'Prawa podmiotów', score: 60 },
      { name: 'Obowiązki administratora', score: 85 },
      { name: 'Bezpieczeństwo danych', score: 50 },
      { name: 'Przekazywanie danych', score: 70 },
      { name: 'Dokumentacja', score: 90 }
    ],
    riskCategories: [
      { name: 'Ryzyko techniczne', value: 3.5 },
      { name: 'Ryzyko organizacyjne', value: 2.8 },
      { name: 'Ryzyko prawne', value: 4.2 },
      { name: 'Ryzyko dla podmiotów', value: 3.0 }
    ],
    complianceDistribution: [
      { name: 'Zgodne', value: 65 },
      { name: 'Częściowo zgodne', value: 25 },
      { name: 'Niezgodne', value: 10 }
    ],
    previousAssessment: {
      chapters: [
        { name: 'Zasady przetwarzania', score: 65 },
        { name: 'Prawa podmiotów', score: 50 },
        { name: 'Obowiązki administratora', score: 75 },
        { name: 'Bezpieczeństwo danych', score: 40 },
        { name: 'Przekazywanie danych', score: 60 },
        { name: 'Dokumentacja', score: 80 }
      ],
      complianceDistribution: [
        { name: 'Zgodne', value: 55 },
        { name: 'Częściowo zgodne', value: 30 },
        { name: 'Niezgodne', value: 15 }
      ]
    },
    historicalData: {
      labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Obecnie'],
      datasets: {
        'Zasady przetwarzania': [55, 60, 65, 70, 72, 75],
        'Prawa podmiotów': [40, 45, 48, 52, 55, 60],
        'Obowiązki administratora': [60, 65, 70, 75, 80, 85],
        'Bezpieczeństwo danych': [30, 35, 38, 42, 45, 50],
        'Przekazywanie danych': [50, 55, 60, 65, 68, 70],
        'Dokumentacja': [70, 75, 80, 85, 88, 90],
        'Ogólny wynik': [51, 56, 60, 65, 68, 72]
      }
    }
  });

  // Użyj rzeczywistych danych, jeśli są dostępne
  useEffect(() => {
    if (assessmentData) {
      // Tutaj byłaby logika przetwarzania rzeczywistych danych
      // Na razie używamy mockowych danych
    }
  }, [assessmentData]);

  // Konfiguracja dla wykresu radarowego
  const radarChartData = {
    labels: mockData.chapters.map(chapter => chapter.name),
    datasets: [
      {
        label: 'Bieżąca ocena',
        data: mockData.chapters.map(chapter => chapter.score),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: mockData.chapters.map(chapter => 
          chapter.score >= 75 ? 'rgba(75, 192, 192, 1)' : 
          chapter.score >= 50 ? 'rgba(255, 206, 86, 1)' : 
          'rgba(255, 99, 132, 1)'
        ),
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
      },
      ...(comparisonMode ? [{
        label: 'Poprzednia ocena',
        data: mockData.previousAssessment.chapters.map(chapter => chapter.score),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(153, 102, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(153, 102, 255, 1)',
      }] : [])
    ]
  };

  // Konfiguracja dla wykresu słupkowego
  const barChartData = {
    labels: mockData.riskCategories.map(category => category.name),
    datasets: [
      {
        label: 'Poziom ryzyka (1-5)',
        data: mockData.riskCategories.map(category => category.value),
        backgroundColor: mockData.riskCategories.map(category => 
          category.value <= 2 ? 'rgba(75, 192, 192, 0.6)' : 
          category.value <= 3.5 ? 'rgba(255, 206, 86, 0.6)' : 
          'rgba(255, 99, 132, 0.6)'
        ),
        borderColor: mockData.riskCategories.map(category => 
          category.value <= 2 ? 'rgba(75, 192, 192, 1)' : 
          category.value <= 3.5 ? 'rgba(255, 206, 86, 1)' : 
          'rgba(255, 99, 132, 1)'
        ),
        borderWidth: 1,
      }
    ]
  };

  // Konfiguracja dla wykresu kołowego
  const doughnutChartData = {
    labels: mockData.complianceDistribution.map(item => item.name),
    datasets: [
      {
        data: mockData.complianceDistribution.map(item => item.value),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      },
      ...(comparisonMode ? [{
        data: mockData.previousAssessment.complianceDistribution.map(item => item.value),
        backgroundColor: [
          'rgba(75, 192, 192, 0.3)',
          'rgba(255, 206, 86, 0.3)',
          'rgba(255, 99, 132, 0.3)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderWidth: 1,
        borderDash: [5, 5]
      }] : [])
    ]
  };

  // Konfiguracja dla wykresu trendów
  const getTrendChartData = (chapterName) => {
    const datasetKey = chapterName || 'Ogólny wynik';
    return {
      labels: mockData.historicalData.labels,
      datasets: [
        {
          label: datasetKey,
          data: mockData.historicalData.datasets[datasetKey],
          fill: false,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1
        }
      ]
    };
  };

  // Konfiguracja dla wykresu polarnego
  const polarAreaChartData = {
    labels: mockData.chapters.map(chapter => chapter.name),
    datasets: [
      {
        data: mockData.chapters.map(chapter => chapter.score),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Opcje dla wykresów
  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}%`;
          }
        }
      },
      legend: {
        display: comparisonMode
      }
    },
    animation: {
      duration: 2000
    },
    responsive: true,
    maintainAspectRatio: false
  };

  const barOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        title: {
          display: true,
          text: 'Poziom ryzyka'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            let riskLevel = '';
            if (value <= 2) riskLevel = 'Niskie';
            else if (value <= 3.5) riskLevel = 'Średnie';
            else riskLevel = 'Wysokie';
            return `Ryzyko: ${value} (${riskLevel})`;
          }
        }
      }
    },
    animation: {
      duration: 1500
    },
    responsive: true,
    maintainAspectRatio: false
  };

  const doughnutOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      },
      legend: {
        position: 'right'
      }
    },
    animation: {
      duration: 1500
    },
    responsive: true,
    maintainAspectRatio: false
  };

  const trendOptions = {
    scales: {
      y: {
        beginAtZero: false,
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Poziom zgodności (%)'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}%`;
          }
        }
      },
      title: {
        display: true,
        text: `Trend zgodności w czasie - ${selectedChapter || 'Ogólny wynik'}`
      }
    },
    animation: {
      duration: 1500
    },
    responsive: true,
    maintainAspectRatio: false
  };

  const polarAreaOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    },
    animation: {
      duration: 1500
    },
    responsive: true,
    maintainAspectRatio: false
  };

  // Funkcja eksportu wizualizacji
  const handleExport = () => {
    if (!chartRef.current) return;
    
    const chartContainer = chartRef.current;
    
    if (exportFormat === 'png') {
      html2canvas(chartContainer).then(canvas => {
        const link = document.createElement('a');
        link.download = `wizualizacja-rodo-${activeTab}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    } else if (exportFormat === 'pdf') {
      html2canvas(chartContainer).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`wizualizacja-rodo-${activeTab}.pdf`);
      });
    }
  };

  // Funkcja pokazująca modal z trendem dla wybranego rozdziału
  const showTrendForChapter = (chapterName) => {
    setSelectedChapter(chapterName);
    setShowTrendModal(true);
  };

  // Obliczanie różnicy między bieżącą a poprzednią oceną
  const calculateDifference = (current, previous) => {
    return current - previous;
  };

  return (
    <Card className="mb-4 visualization-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FontAwesomeIcon icon={faChartLine} className="me-2" />
          Wizualizacje oceny RODO
        </h5>
        <div>
          <ButtonGroup className="me-2">
            <Button 
              variant={comparisonMode ? "primary" : "outline-primary"} 
              size="sm"
              onClick={() => setComparisonMode(!comparisonMode)}
            >
              <FontAwesomeIcon icon={faHistory} className="me-1" />
              {comparisonMode ? "Wyłącz porównanie" : "Porównaj z poprzednią"}
            </Button>
            <Dropdown as={ButtonGroup}>
              <Dropdown.Toggle variant="outline-secondary" size="sm" id="export-dropdown">
                <FontAwesomeIcon icon={faDownload} className="me-1" />
                Eksportuj
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => { setExportFormat('png'); handleExport(); }}>
                  Eksportuj jako PNG
                </Dropdown.Item>
                <Dropdown.Item onClick={() => { setExportFormat('pdf'); handleExport(); }}>
                  Eksportuj jako PDF
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </ButtonGroup>
        </div>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-3">
          Poniższe wykresy przedstawiają wizualne podsumowanie oceny zgodności z RODO.
          Użyj zakładek, aby przełączać między różnymi typami wizualizacji.
          {comparisonMode && " Aktywny tryb porównania z poprzednią oceną."}
        </p>
        
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="radar">
                <FontAwesomeIcon icon={faChartLine} className="me-1" />
                Wykres radarowy
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="bar">
                <FontAwesomeIcon icon={faChartBar} className="me-1" />
                Wykres słupkowy
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="doughnut">
                <FontAwesomeIcon icon={faChartPie} className="me-1" />
                Wykres kołowy
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="polar">
                <FontAwesomeIcon icon={faChartPie} className="me-1" />
                Wykres polarny
              </Nav.Link>
            </Nav.Item>
          </Nav>
          
          <div ref={chartRef}>
            <Tab.Content>
              <Tab.Pane eventKey="radar">
                <Row>
                  <Col md={8}>
                    <div className="chart-container" style={{ height: '400px' }}>
                      <Radar data={radarChartData} options={radarOptions} />
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="chart-legend p-3">
                      <h6>Poziom zgodności w obszarach</h6>
                      <p className="text-muted small">
                        Wykres radarowy pokazuje poziom zgodności z RODO w poszczególnych obszarach.
                        Im większa powierzchnia wykresu, tym wyższy poziom zgodności.
                      </p>
                      <hr />
                      <div className="legend-items">
                        {mockData.chapters.map((chapter, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <span 
                                className="legend-color-box" 
                                style={{ 
                                  backgroundColor: chapter.score >= 75 ? 'rgba(75, 192, 192, 1)' : 
                                  chapter.score >= 50 ? 'rgba(255, 206, 86, 1)' : 
                                  'rgba(255, 99, 132, 1)'
                                }}
                              ></span>
                              <span 
                                className="chapter-name-link"
                                onClick={() => showTrendForChapter(chapter.name)}
                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                              >
                                {chapter.name}
                              </span>
                            </div>
                            <div>
                              <span className={`badge bg-${
                                chapter.score >= 75 ? 'success' : 
                                chapter.score >= 50 ? 'warning' : 
                                'danger'
                              }`}>
                                {chapter.score}%
                              </span>
                              
                              {comparisonMode && (
                                <span className={`badge ms-1 bg-${
                                  calculateDifference(chapter.score, mockData.previousAssessment.chapters[index].score) > 0 ? 'success' : 
                                  calculateDifference(chapter.score, mockData.previousAssessment.chapters[index].score) < 0 ? 'danger' : 
                                  'secondary'
                                }`}>
                                  {calculateDifference(chapter.score, mockData.previousAssessment.chapters[index].score) > 0 ? '+' : ''}
                                  {calculateDifference(chapter.score, mockData.previousAssessment.chapters[index].score)}%
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {comparisonMode && (
                        <div className="alert alert-info mt-3">
                          <strong>Porównanie:</strong> Widoczne są dane z bieżącej oceny oraz poprzedniej oceny.
                          Liczby w nawiasach pokazują zmianę procentową.
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </Tab.Pane>
              
              <Tab.Pane eventKey="bar">
                <Row>
                  <Col md={8}>
                    <div className="chart-container" style={{ height: '400px' }}>
                      <Bar data={barChartData} options={barOptions} />
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="chart-legend p-3">
                      <h6>Poziom ryzyka w kategoriach</h6>
                      <p className="text-muted small">
                        Wykres słupkowy przedstawia poziom ryzyka w różnych kategoriach.
                        Wyższe słupki oznaczają wyższy poziom ryzyka (skala 1-5).
                      </p>
                      <hr />
                      <div className="legend-items">
                        {mockData.riskCategories.map((category, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <span 
                                className="legend-color-box" 
                                style={{ 
                                  backgroundColor: category.value <= 2 ? 'rgba(75, 192, 192, 1)' : 
                                  category.value <= 3.5 ? 'rgba(255, 206, 86, 1)' : 
                                  'rgba(255, 99, 132, 1)'
                                }}
                              ></span>
                              <span>{category.name}</span>
                            </div>
                            <span className={`badge bg-${
                              category.value <= 2 ? 'success' : 
                              category.value <= 3.5 ? 'warning' : 
                              'danger'
                            }`}>
                              {category.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="alert alert-warning mt-3">
                        <strong>Uwaga:</strong> Kategorie z poziomem ryzyka powyżej 3.5 wymagają 
                        natychmiastowych działań naprawczych.
                      </div>
                    </div>
                  </Col>
                </Row>
              </Tab.Pane>
              
              <Tab.Pane eventKey="doughnut">
                <Row>
                  <Col md={6}>
                    <div className="chart-container" style={{ height: '400px' }}>
                      <Doughnut data={doughnutChartData} options={doughnutOptions} />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="chart-legend p-3">
                      <h6>Rozkład zgodności</h6>
                      <p className="text-muted small">
                        Wykres kołowy przedstawia procentowy rozkład wymagań pod względem zgodności z RODO.
                        {comparisonMode && " Wewnętrzny pierścień pokazuje poprzednią ocenę, zewnętrzny - bieżącą."}
                      </p>
                      <hr />
                      <div className="legend-items">
                        {mockData.complianceDistribution.map((item, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <span 
                                className="legend-color-box" 
                                style={{ 
                                  backgroundColor: index === 0 ? 'rgba(75, 192, 192, 0.6)' : 
                                  index === 1 ? 'rgba(255, 206, 86, 0.6)' : 
                                  'rgba(255, 99, 132, 0.6)'
                                }}
                              ></span>
                              <span>{item.name}</span>
                            </div>
                            <div>
                              <span className={`badge bg-${
                                index === 0 ? 'success' : 
                                index === 1 ? 'warning' : 
                                'danger'
                              }`}>
                                {item.value}%
                              </span>
                              
                              {comparisonMode && (
                                <span className={`badge ms-1 bg-${
                                  calculateDifference(item.value, mockData.previousAssessment.complianceDistribution[index].value) > 0 && index === 0 ? 'success' : 
                                  calculateDifference(item.value, mockData.previousAssessment.complianceDistribution[index].value) < 0 && index === 0 ? 'danger' : 
                                  calculateDifference(item.value, mockData.previousAssessment.complianceDistribution[index].value) > 0 && index !== 0 ? 'danger' : 
                                  calculateDifference(item.value, mockData.previousAssessment.complianceDistribution[index].value) < 0 && index !== 0 ? 'success' : 
                                  'secondary'
                                }`}>
                                  {calculateDifference(item.value, mockData.previousAssessment.complianceDistribution[index].value) > 0 ? '+' : ''}
                                  {calculateDifference(item.value, mockData.previousAssessment.complianceDistribution[index].value)}%
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="alert alert-info mt-3">
                        <strong>Wskazówka:</strong> Dąż do zwiększenia procentu wymagań oznaczonych jako "Zgodne" 
                        poprzez wdrożenie rekomendowanych działań naprawczych.
                      </div>
                    </div>
                  </Col>
                </Row>
              </Tab.Pane>
              
              <Tab.Pane eventKey="polar">
                <Row>
                  <Col md={8}>
                    <div className="chart-container" style={{ height: '400px' }}>
                      <PolarArea data={polarAreaChartData} options={polarAreaOptions} />
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="chart-legend p-3">
                      <h6>Rozkład zgodności w obszarach</h6>
                      <p className="text-muted small">
                        Wykres polarny pokazuje poziom zgodności w poszczególnych obszarach RODO.
                        Większe segmenty oznaczają wyższy poziom zgodności.
                      </p>
                      <hr />
                      <div className="legend-items">
                        {mockData.chapters.map((chapter, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <span 
                                className="legend-color-box" 
                                style={{ 
                                  backgroundColor: [
                                    'rgba(255, 99, 132, 0.5)',
                                    'rgba(54, 162, 235, 0.5)',
                                    'rgba(255, 206, 86, 0.5)',
                                    'rgba(75, 192, 192, 0.5)',
                                    'rgba(153, 102, 255, 0.5)',
                                    'rgba(255, 159, 64, 0.5)'
                                  ][index]
                                }}
                              ></span>
                              <span>{chapter.name}</span>
                            </div>
                            <span className={`badge bg-${
                              chapter.score >= 75 ? 'success' : 
                              chapter.score >= 50 ? 'warning' : 
                              'danger'
                            }`}>
                              {chapter.score}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>
        
        <div className="mt-3 d-flex justify-content-between align-items-center">
          <Form.Group className="d-flex align-items-center">
            <Form.Label className="me-2 mb-0">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
              Porównaj z:
            </Form.Label>
            <Form.Select 
              className="form-select-sm" 
              style={{ width: 'auto' }}
              onChange={(e) => {
                if (e.target.value === 'previous') {
                  setComparisonMode(true);
                } else {
                  setComparisonMode(false);
                }
              }}
            >
              <option value="none">Bieżąca ocena</option>
              <option value="previous">Poprzednia ocena</option>
              <option value="q1_2025">Ocena z Q1 2025</option>
              <option value="q4_2024">Ocena z Q4 2024</option>
            </Form.Select>
          </Form.Group>
          
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => {
              setSelectedChapter(null);
              setShowTrendModal(true);
            }}
          >
            <FontAwesomeIcon icon={faChartLine} className="me-1" />
            Analiza trendów
          </Button>
        </div>
      </Card.Body>
      
      {/* Modal z wykresem trendów */}
      <Modal 
        show={showTrendModal} 
        onHide={() => setShowTrendModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faChartLine} className="me-2" />
            Analiza trendów zgodności
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Form.Group>
              <Form.Label>Wybierz obszar do analizy:</Form.Label>
              <Form.Select 
                value={selectedChapter || ''}
                onChange={(e) => setSelectedChapter(e.target.value || null)}
              >
                <option value="">Ogólny wynik</option>
                {mockData.chapters.map((chapter, index) => (
                  <option key={index} value={chapter.name}>{chapter.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
          
          <div style={{ height: '400px' }}>
            <Line 
              data={getTrendChartData(selectedChapter)} 
              options={trendOptions}
            />
          </div>
          
          <div className="mt-3 alert alert-info">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            Wykres przedstawia zmiany poziomu zgodności w czasie dla wybranego obszaru.
            Trend wzrostowy wskazuje na skuteczność wdrażanych działań naprawczych.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowTrendModal(false)}
          >
            Zamknij
          </Button>
          <Button 
            variant="outline-primary"
            onClick={() => {
              // Symulacja eksportu wykresu trendów
              alert('Eksportowanie wykresu trendów...');
              setShowTrendModal(false);
            }}
          >
            <FontAwesomeIcon icon={faDownload} className="me-1" />
            Eksportuj wykres
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default AssessmentVisualizations;
