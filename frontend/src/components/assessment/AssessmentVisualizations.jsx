import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Nav, Tab } from 'react-bootstrap';
import { Radar, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement } from 'chart.js';

// Rejestracja komponentów ChartJS
ChartJS.register(
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement
);

/**
 * Komponent wizualizacji dla oceny RODO
 * 
 * Funkcjonalności:
 * - Wykresy radarowe pokazujące poziom zgodności w różnych obszarach
 * - Wykresy słupkowe do porównania ryzyka w różnych kategoriach
 * - Wykresy kołowe pokazujące rozkład ocen
 * - Kolorowe oznaczenia dla łatwej identyfikacji obszarów problematycznych
 */
const AssessmentVisualizations = ({ assessmentData }) => {
  const [activeTab, setActiveTab] = useState('radar');
  
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
    ]
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
        label: 'Poziom zgodności (%)',
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
      }
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
      }
    }
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
    }
  };

  const doughnutOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    }
  };

  return (
    <Card className="mb-4 visualization-card">
      <Card.Header>
        <h5 className="mb-0">Wizualizacje oceny RODO</h5>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-3">
          Poniższe wykresy przedstawiają wizualne podsumowanie oceny zgodności z RODO.
          Użyj zakładek, aby przełączać między różnymi typami wizualizacji.
        </p>
        
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="radar">Wykres radarowy</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="bar">Wykres słupkowy</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="doughnut">Wykres kołowy</Nav.Link>
            </Nav.Item>
          </Nav>
          
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
                          <span className={`badge bg-${
                            index === 0 ? 'success' : 
                            index === 1 ? 'warning' : 
                            'danger'
                          }`}>
                            {item.value}%
                          </span>
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
          </Tab.Content>
        </Tab.Container>
        
        <div className="mt-3">
          <Form.Group>
            <Form.Label>Wybierz okres do porównania</Form.Label>
            <Form.Select className="form-select-sm w-auto">
              <option>Bieżąca ocena</option>
              <option>Porównaj z poprzednią oceną</option>
              <option>Porównaj z oceną z Q1 2025</option>
              <option>Porównaj z oceną z Q4 2024</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Wybierz opcję, aby porównać bieżące wyniki z wcześniejszymi ocenami.
            </Form.Text>
          </Form.Group>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AssessmentVisualizations;
