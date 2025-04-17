import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, Accordion, OverlayTrigger, Tooltip, Modal, InputGroup, Alert, Tabs, Tab, Dropdown, ButtonGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faInfoCircle, faSearch, faCalendarAlt, faUser, faArrowRight, faSyncAlt, faFilter, faChartLine, faDownload, faExchangeAlt, faEye, faUndo, faCheck, faFileExport, faChartBar, faTable, faListAlt } from '@fortawesome/free-solid-svg-icons';
import { Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Komponent historii zmian dla oceny RODO
 * 
 * Funkcjonalności:
 * - Możliwość porównania wyników oceny z poprzednimi wersjami
 * - Śledzenie postępu w czasie
 * - Filtrowanie i wyszukiwanie zmian
 * - Szczegółowy widok zmian dla każdego obszaru
 * - Wizualizacja trendów zmian w czasie
 * - Eksport historii zmian do PDF/CSV
 * - Przywracanie poprzednich wersji oceny
 * - Szczegółowe porównanie wersji z podświetleniem różnic
 */
const ChangeHistoryFeature = ({ assessmentId }) => {
  // Mockowe dane dla historii zmian
  const initialHistory = [
    {
      id: 1,
      date: '2025-04-15',
      user: 'Jan Kowalski',
      version: '1.0',
      description: 'Pierwsza ocena RODO',
      overallScore: 65,
      changes: [],
      status: 'Zakończona',
      areaScores: [
        { area: 'Zasady przetwarzania', score: 70 },
        { area: 'Prawa podmiotów', score: 60 },
        { area: 'Obowiązki administratora', score: 75 },
        { area: 'Bezpieczeństwo danych', score: 50 },
        { area: 'Przekazywanie danych', score: 60 },
        { area: 'Dokumentacja', score: 70 }
      ]
    },
    {
      id: 2,
      date: '2025-04-30',
      user: 'Anna Nowak',
      version: '1.1',
      description: 'Aktualizacja po wdrożeniu nowych procedur',
      overallScore: 72,
      changes: [
        { area: 'Bezpieczeństwo danych', oldScore: 50, newScore: 65, description: 'Wdrożono nowe procedury bezpieczeństwa' },
        { area: 'Dokumentacja', oldScore: 70, newScore: 85, description: 'Zaktualizowano politykę ochrony danych' }
      ],
      status: 'Zakończona',
      areaScores: [
        { area: 'Zasady przetwarzania', score: 70 },
        { area: 'Prawa podmiotów', score: 60 },
        { area: 'Obowiązki administratora', score: 75 },
        { area: 'Bezpieczeństwo danych', score: 65 },
        { area: 'Przekazywanie danych', score: 60 },
        { area: 'Dokumentacja', score: 85 }
      ]
    },
    {
      id: 3,
      date: '2025-05-15',
      user: 'Piotr Wiśniewski',
      version: '1.2',
      description: 'Aktualizacja po szkoleniach pracowników',
      overallScore: 78,
      changes: [
        { area: 'Bezpieczeństwo danych', oldScore: 65, newScore: 75, description: 'Przeprowadzono szkolenia z bezpieczeństwa' },
        { area: 'Prawa podmiotów', oldScore: 60, newScore: 70, description: 'Wdrożono nowe procedury obsługi wniosków' }
      ],
      status: 'Zakończona',
      areaScores: [
        { area: 'Zasady przetwarzania', score: 70 },
        { area: 'Prawa podmiotów', score: 70 },
        { area: 'Obowiązki administratora', score: 75 },
        { area: 'Bezpieczeństwo danych', score: 75 },
        { area: 'Przekazywanie danych', score: 60 },
        { area: 'Dokumentacja', score: 85 }
      ]
    },
    {
      id: 4,
      date: '2025-06-01',
      user: 'Magdalena Kowalczyk',
      version: '1.3',
      description: 'Aktualizacja po audycie wewnętrznym',
      overallScore: 85,
      changes: [
        { area: 'Bezpieczeństwo danych', oldScore: 75, newScore: 85, description: 'Wdrożono rekomendacje z audytu' },
        { area: 'Dokumentacja', oldScore: 85, newScore: 90, description: 'Zaktualizowano rejestry czynności przetwarzania' },
        { area: 'Zgody na przetwarzanie', oldScore: 70, newScore: 85, description: 'Przeprojektowano formularze zgód' }
      ],
      status: 'W trakcie',
      areaScores: [
        { area: 'Zasady przetwarzania', score: 70 },
        { area: 'Prawa podmiotów', score: 70 },
        { area: 'Obowiązki administratora', score: 75 },
        { area: 'Bezpieczeństwo danych', score: 85 },
        { area: 'Przekazywanie danych', score: 60 },
        { area: 'Dokumentacja', score: 90 },
        { area: 'Zgody na przetwarzanie', score: 85 }
      ]
    }
  ];

  const [historyEntries, setHistoryEntries] = useState(initialHistory);
  const [filteredEntries, setFilteredEntries] = useState(initialHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [showTrendModal, setShowTrendModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState(null);
  const [showDetailedComparisonModal, setShowDetailedComparisonModal] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [expandedChanges, setExpandedChanges] = useState({});

  // Filtrowanie wpisów historii
  useEffect(() => {
    let filtered = historyEntries;
    
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.changes.some(change => 
          change.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
          change.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    if (dateFilter) {
      filtered = filtered.filter(entry => entry.date >= dateFilter);
    }
    
    if (userFilter) {
      filtered = filtered.filter(entry => entry.user === userFilter);
    }
    
    if (statusFilter) {
      filtered = filtered.filter(entry => entry.status === statusFilter);
    }
    
    setFilteredEntries(filtered);
  }, [historyEntries, searchTerm, dateFilter, userFilter, statusFilter]);

  // Obsługa wyboru wersji do porównania
  const handleVersionSelect = (id) => {
    if (selectedVersions.includes(id)) {
      setSelectedVersions(selectedVersions.filter(v => v !== id));
    } else {
      if (selectedVersions.length < 2) {
        setSelectedVersions([...selectedVersions, id]);
      } else {
        // Jeśli już wybrano 2 wersje, zastąp najstarszą
        setSelectedVersions([selectedVersions[1], id]);
      }
    }
  };

  // Przygotowanie danych do porównania
  const comparisonData = () => {
    if (selectedVersions.length !== 2) return null;
    
    const [olderVersionId, newerVersionId] = selectedVersions.sort((a, b) => a - b);
    const olderVersion = historyEntries.find(entry => entry.id === olderVersionId);
    const newerVersion = historyEntries.find(entry => entry.id === newerVersionId);
    
    if (!olderVersion || !newerVersion) return null;
    
    // Zbierz wszystkie unikalne obszary z obu wersji
    const allAreas = new Set();
    olderVersion.areaScores.forEach(score => allAreas.add(score.area));
    newerVersion.areaScores.forEach(score => allAreas.add(score.area));
    
    // Przygotuj dane porównawcze dla każdego obszaru
    const comparisonByArea = Array.from(allAreas).map(area => {
      const olderScore = olderVersion.areaScores.find(score => score.area === area)?.score || null;
      const newerScore = newerVersion.areaScores.find(score => score.area === area)?.score || null;
      
      // Znajdź opis zmiany, jeśli istnieje
      const changeDescription = newerVersion.changes.find(change => change.area === area)?.description || null;
      
      return {
        area,
        olderScore,
        newerScore,
        difference: newerScore !== null && olderScore !== null ? newerScore - olderScore : null,
        description: changeDescription
      };
    });
    
    return {
      olderVersion,
      newerVersion,
      comparisonByArea,
      overallDifference: newerVersion.overallScore - olderVersion.overallScore
    };
  };

  // Przygotowanie danych do wykresu trendów
  const prepareTrendData = () => {
    // Sortuj wpisy historii według daty
    const sortedEntries = [...historyEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Przygotuj etykiety (daty)
    const labels = sortedEntries.map(entry => new Date(entry.date).toLocaleDateString());
    
    // Przygotuj dane dla ogólnego wyniku
    const overallScores = sortedEntries.map(entry => entry.overallScore);
    
    // Jeśli wybrano konkretny obszar, przygotuj dane dla tego obszaru
    let areaScores = null;
    if (selectedArea) {
      areaScores = sortedEntries.map(entry => {
        const areaScore = entry.areaScores.find(score => score.area === selectedArea);
        return areaScore ? areaScore.score : null;
      });
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Ogólny wynik',
          data: overallScores,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: false,
          tension: 0.1
        },
        ...(areaScores ? [{
          label: `Obszar: ${selectedArea}`,
          data: areaScores,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: false,
          tension: 0.1
        }] : [])
      ]
    };
  };

  // Obsługa przywracania wersji
  const handleRestoreVersion = () => {
    if (!versionToRestore) return;
    
    // W rzeczywistej aplikacji tutaj byłaby logika przywracania wersji
    // Na potrzeby mockowe wyświetlamy tylko komunikat
    alert(`Przywrócono wersję ${versionToRestore.version} z dnia ${new Date(versionToRestore.date).toLocaleDateString()}`);
    
    setShowRestoreModal(false);
    setVersionToRestore(null);
  };

  // Eksport historii zmian do PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Tytuł
    doc.setFontSize(18);
    doc.text('Historia zmian oceny RODO', 14, 22);
    
    // Data wygenerowania
    doc.setFontSize(10);
    doc.text(`Wygenerowano: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Tabela
    const tableColumn = ["Data", "Użytkownik", "Wersja", "Opis", "Wynik", "Status"];
    const tableRows = [];
    
    filteredEntries.forEach(entry => {
      const entryData = [
        new Date(entry.date).toLocaleDateString(),
        entry.user,
        entry.version,
        entry.description,
        `${entry.overallScore}%`,
        entry.status
      ];
      tableRows.push(entryData);
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 35 }
    });
    
    // Zapisz PDF
    doc.save('historia-zmian-rodo.pdf');
  };

  // Eksport porównania do PDF
  const exportComparisonToPDF = () => {
    if (!comparisonMode || selectedVersions.length !== 2) return;
    
    const comparison = comparisonData();
    if (!comparison) return;
    
    const doc = new jsPDF();
    
    // Tytuł
    doc.setFontSize(18);
    doc.text(`Porównanie wersji ${comparison.olderVersion.version} i ${comparison.newerVersion.version}`, 14, 22);
    
    // Data wygenerowania
    doc.setFontSize(10);
    doc.text(`Wygenerowano: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Informacje o wersjach
    doc.setFontSize(12);
    doc.text(`Wersja ${comparison.olderVersion.version} (${new Date(comparison.olderVersion.date).toLocaleDateString()}) - Wynik: ${comparison.olderVersion.overallScore}%`, 14, 40);
    doc.text(`Wersja ${comparison.newerVersion.version} (${new Date(comparison.newerVersion.date).toLocaleDateString()}) - Wynik: ${comparison.newerVersion.overallScore}%`, 14, 48);
    doc.text(`Zmiana ogólnego wyniku: ${comparison.overallDifference > 0 ? '+' : ''}${comparison.overallDifference}%`, 14, 56);
    
    // Tabela porównawcza
    const tableColumn = ["Obszar", `Wynik w ${comparison.olderVersion.version}`, `Wynik w ${comparison.newerVersion.version}`, "Zmiana", "Opis zmiany"];
    const tableRows = [];
    
    comparison.comparisonByArea.forEach(item => {
      const itemData = [
        item.area,
        item.olderScore !== null ? `${item.olderScore}%` : 'Brak danych',
        item.newerScore !== null ? `${item.newerScore}%` : 'Brak danych',
        item.difference !== null ? `${item.difference > 0 ? '+' : ''}${item.difference}%` : 'Brak danych',
        item.description || 'Brak opisu'
      ];
      tableRows.push(itemData);
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 65,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 65 }
    });
    
    // Zapisz PDF
    doc.save(`porownanie-wersji-${comparison.olderVersion.version}-${comparison.newerVersion.version}.pdf`);
  };

  // Unikalni użytkownicy do filtrowania
  const uniqueUsers = [...new Set(historyEntries.map(entry => entry.user))];
  
  // Dane porównawcze
  const comparison = comparisonMode && selectedVersions.length === 2 ? comparisonData() : null;

  // Unikalne obszary do wyboru w trendach
  const uniqueAreas = [...new Set(historyEntries.flatMap(entry => entry.areaScores.map(score => score.area)))];

  // Obsługa rozwijania/zwijania zmian
  const toggleExpandChanges = (entryId) => {
    setExpandedChanges(prev => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
  };

  // Opcje wykresu trendów
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
        text: selectedArea ? `Trend zgodności w czasie - ${selectedArea}` : 'Trend ogólnego wyniku w czasie'
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <Card className="mb-4 change-history-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FontAwesomeIcon icon={faHistory} className="me-2" />
          Historia zmian
        </h5>
        <div>
          <ButtonGroup className="me-2">
            <Button 
              variant={comparisonMode ? "primary" : "outline-primary"} 
              size="sm"
              onClick={() => setComparisonMode(!comparisonMode)}
              disabled={selectedVersions.length !== 2}
            >
              <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
              {comparisonMode ? "Wyłącz porównanie" : "Porównaj wersje"}
            </Button>
            <Button 
              variant="outline-info" 
              size="sm"
              onClick={() => setShowTrendModal(true)}
            >
              <FontAwesomeIcon icon={faChartLine} className="me-1" />
              Trendy
            </Button>
          </ButtonGroup>
          
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle variant="outline-secondary" size="sm" id="export-dropdown">
              <FontAwesomeIcon icon={faFileExport} className="me-1" />
              Eksportuj
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={exportToPDF}>
                Eksportuj historię do PDF
              </Dropdown.Item>
              {comparisonMode && selectedVersions.length === 2 && (
                <Dropdown.Item onClick={exportComparisonToPDF}>
                  Eksportuj porównanie do PDF
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Card.Header>
      <Card.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab 
            eventKey="history" 
            title={
              <span>
                <FontAwesomeIcon icon={faHistory} className="me-1" />
                Historia zmian
              </span>
            }
          >
            {!comparisonMode && (
              <>
                <p className="text-muted mb-3">
                  Historia zmian pozwala na śledzenie postępu w czasie i porównywanie wyników oceny RODO.
                  Wybierz dwie wersje, aby porównać zmiany między nimi.
                </p>
                
                <Row className="mb-4">
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faSearch} />
                        </InputGroup.Text>
                        <Form.Control 
                          type="text" 
                          placeholder="Szukaj w historii zmian..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faCalendarAlt} />
                        </InputGroup.Text>
                        <Form.Control 
                          type="date" 
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faUser} />
                        </InputGroup.Text>
                        <Form.Select 
                          value={userFilter}
                          onChange={(e) => setUserFilter(e.target.value)}
                        >
                          <option value="">Wszyscy użytkownicy</option>
                          {uniqueUsers.map((user, index) => (
                            <option key={index} value={user}>{user}</option>
                          ))}
                        </Form.Select>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faFilter} />
                        </InputGroup.Text>
                        <Form.Select 
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="">Wszystkie statusy</option>
                          <option value="Zakończona">Zakończona</option>
                          <option value="W trakcie">W trakcie</option>
                        </Form.Select>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-flex align-items-center">
                    <Button 
                      variant="outline-secondary" 
                      className="w-100"
                      onClick={() => {
                        setSearchTerm('');
                        setDateFilter('');
                        setUserFilter('');
                        setStatusFilter('');
                      }}
                    >
                      <FontAwesomeIcon icon={faSyncAlt} className="me-1" />
                      Resetuj filtry
                    </Button>
                  </Col>
                </Row>
                
                {filteredEntries.length > 0 ? (
                  <div className="table-responsive">
                    <Table striped hover className="history-table">
                      <thead>
                        <tr>
                          <th style={{width: '5%'}}></th>
                          <th style={{width: '10%'}}>Data</th>
                          <th style={{width: '15%'}}>Użytkownik</th>
                          <th style={{width: '10%'}}>Wersja</th>
                          <th style={{width: '30%'}}>Opis</th>
                          <th style={{width: '10%'}}>Wynik</th>
                          <th style={{width: '10%'}}>Status</th>
                          <th style={{width: '10%'}}>Akcje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEntries.map(entry => (
                          <React.Fragment key={entry.id}>
                            <tr>
                              <td>
                                <Form.Check 
                                  type="checkbox"
                                  checked={selectedVersions.includes(entry.id)}
                                  onChange={() => handleVersionSelect(entry.id)}
                                  disabled={selectedVersions.length >= 2 && !selectedVersions.includes(entry.id)}
                                />
                              </td>
                              <td>{new Date(entry.date).toLocaleDateString()}</td>
                              <td>{entry.user}</td>
                              <td>{entry.version}</td>
                              <td>{entry.description}</td>
                              <td>
                                <Badge bg={
                                  entry.overallScore >= 80 ? 'success' : 
                                  entry.overallScore >= 60 ? 'warning' : 
                                  'danger'
                                }>
                                  {entry.overallScore}%
                                </Badge>
                              </td>
                              <td>
                                <Badge bg={entry.status === 'Zakończona' ? 'success' : 'warning'}>
                                  {entry.status}
                                </Badge>
                              </td>
                              <td>
                                <ButtonGroup size="sm">
                                  <Button 
                                    variant="outline-primary"
                                    onClick={() => toggleExpandChanges(entry.id)}
                                  >
                                    <FontAwesomeIcon icon={faEye} />
                                  </Button>
                                  <Button 
                                    variant="outline-secondary"
                                    onClick={() => {
                                      setVersionToRestore(entry);
                                      setShowRestoreModal(true);
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faUndo} />
                                  </Button>
                                  <Button 
                                    variant="outline-info"
                                    onClick={() => {
                                      setSelectedArea(null);
                                      setSelectedVersions([entry.id]);
                                      setShowTrendModal(true);
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faChartLine} />
                                  </Button>
                                </ButtonGroup>
                              </td>
                            </tr>
                            {expandedChanges[entry.id] && (
                              <tr>
                                <td colSpan="8" className="p-0">
                                  <div className="p-3 bg-light">
                                    <h6>Zmiany w wersji {entry.version}</h6>
                                    {entry.changes.length > 0 ? (
                                      <Table size="sm" className="mb-0">
                                        <thead>
                                          <tr>
                                            <th>Obszar</th>
                                            <th>Poprzedni wynik</th>
                                            <th></th>
                                            <th>Nowy wynik</th>
                                            <th>Zmiana</th>
                                            <th>Opis</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {entry.changes.map((change, index) => (
                                            <tr key={index}>
                                              <td>{change.area}</td>
                                              <td>
                                                <Badge bg={
                                                  change.oldScore >= 80 ? 'success' : 
                                                  change.oldScore >= 60 ? 'warning' : 
                                                  'danger'
                                                }>
                                                  {change.oldScore}%
                                                </Badge>
                                              </td>
                                              <td>
                                                <FontAwesomeIcon icon={faArrowRight} />
                                              </td>
                                              <td>
                                                <Badge bg={
                                                  change.newScore >= 80 ? 'success' : 
                                                  change.newScore >= 60 ? 'warning' : 
                                                  'danger'
                                                }>
                                                  {change.newScore}%
                                                </Badge>
                                              </td>
                                              <td>
                                                <Badge bg={
                                                  change.newScore - change.oldScore > 0 ? 'success' : 
                                                  change.newScore - change.oldScore < 0 ? 'danger' : 
                                                  'secondary'
                                                }>
                                                  {change.newScore - change.oldScore > 0 ? '+' : ''}
                                                  {change.newScore - change.oldScore}%
                                                </Badge>
                                              </td>
                                              <td>{change.description}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </Table>
                                    ) : (
                                      <p className="text-muted mb-0">Brak szczegółowych zmian dla tej wersji.</p>
                                    )}
                                    
                                    <div className="mt-3">
                                      <h6>Wyniki obszarów w wersji {entry.version}</h6>
                                      <div className="d-flex flex-wrap">
                                        {entry.areaScores.map((areaScore, index) => (
                                          <div key={index} className="me-3 mb-2">
                                            <Badge 
                                              bg={
                                                areaScore.score >= 80 ? 'success' : 
                                                areaScore.score >= 60 ? 'warning' : 
                                                'danger'
                                              }
                                              className="p-2"
                                            >
                                              {areaScore.area}: {areaScore.score}%
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <Alert variant="info">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    Brak wpisów historii spełniających kryteria filtrowania.
                  </Alert>
                )}
              </>
            )}
            
            {comparisonMode && comparison && (
              <div className="comparison-view">
                <div className="mb-4">
                  <h5 className="mb-3">Porównanie wersji {comparison.olderVersion.version} i {comparison.newerVersion.version}</h5>
                  
                  <Row className="mb-3">
                    <Col md={5}>
                      <Card className="h-100">
                        <Card.Header className="bg-light">
                          <h6 className="mb-0">
                            Wersja {comparison.olderVersion.version} ({new Date(comparison.olderVersion.date).toLocaleDateString()})
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <p><strong>Użytkownik:</strong> {comparison.olderVersion.user}</p>
                          <p><strong>Opis:</strong> {comparison.olderVersion.description}</p>
                          <p>
                            <strong>Ogólny wynik:</strong> 
                            <Badge 
                              bg={
                                comparison.olderVersion.overallScore >= 80 ? 'success' : 
                                comparison.olderVersion.overallScore >= 60 ? 'warning' : 
                                'danger'
                              }
                              className="ms-2"
                            >
                              {comparison.olderVersion.overallScore}%
                            </Badge>
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={2} className="d-flex align-items-center justify-content-center">
                      <div className="text-center">
                        <FontAwesomeIcon icon={faArrowRight} size="2x" className="mb-2" />
                        <Badge 
                          bg={
                            comparison.overallDifference > 0 ? 'success' : 
                            comparison.overallDifference < 0 ? 'danger' : 
                            'secondary'
                          }
                          className="d-block"
                        >
                          {comparison.overallDifference > 0 ? '+' : ''}
                          {comparison.overallDifference}%
                        </Badge>
                      </div>
                    </Col>
                    
                    <Col md={5}>
                      <Card className="h-100">
                        <Card.Header className="bg-light">
                          <h6 className="mb-0">
                            Wersja {comparison.newerVersion.version} ({new Date(comparison.newerVersion.date).toLocaleDateString()})
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <p><strong>Użytkownik:</strong> {comparison.newerVersion.user}</p>
                          <p><strong>Opis:</strong> {comparison.newerVersion.description}</p>
                          <p>
                            <strong>Ogólny wynik:</strong> 
                            <Badge 
                              bg={
                                comparison.newerVersion.overallScore >= 80 ? 'success' : 
                                comparison.newerVersion.overallScore >= 60 ? 'warning' : 
                                'danger'
                              }
                              className="ms-2"
                            >
                              {comparison.newerVersion.overallScore}%
                            </Badge>
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  
                  <div className="mb-3">
                    <h6>Szczegółowe porównanie obszarów</h6>
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Obszar</th>
                            <th>Wynik w {comparison.olderVersion.version}</th>
                            <th>Wynik w {comparison.newerVersion.version}</th>
                            <th>Zmiana</th>
                            <th>Opis zmiany</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparison.comparisonByArea.map((item, index) => (
                            <tr key={index}>
                              <td>{item.area}</td>
                              <td>
                                {item.olderScore !== null ? (
                                  <Badge bg={
                                    item.olderScore >= 80 ? 'success' : 
                                    item.olderScore >= 60 ? 'warning' : 
                                    'danger'
                                  }>
                                    {item.olderScore}%
                                  </Badge>
                                ) : (
                                  <span className="text-muted">Brak danych</span>
                                )}
                              </td>
                              <td>
                                {item.newerScore !== null ? (
                                  <Badge bg={
                                    item.newerScore >= 80 ? 'success' : 
                                    item.newerScore >= 60 ? 'warning' : 
                                    'danger'
                                  }>
                                    {item.newerScore}%
                                  </Badge>
                                ) : (
                                  <span className="text-muted">Brak danych</span>
                                )}
                              </td>
                              <td>
                                {item.difference !== null ? (
                                  <Badge bg={
                                    item.difference > 0 ? 'success' : 
                                    item.difference < 0 ? 'danger' : 
                                    'secondary'
                                  }>
                                    {item.difference > 0 ? '+' : ''}
                                    {item.difference}%
                                  </Badge>
                                ) : (
                                  <span className="text-muted">Brak danych</span>
                                )}
                              </td>
                              <td>
                                {item.description || (
                                  <span className="text-muted">Brak opisu zmiany</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => {
                        setComparisonMode(false);
                        setSelectedVersions([]);
                      }}
                    >
                      <FontAwesomeIcon icon={faHistory} className="me-1" />
                      Powrót do historii zmian
                    </Button>
                    
                    <Button 
                      variant="outline-primary"
                      onClick={() => {
                        setShowDetailedComparisonModal(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faEye} className="me-1" />
                      Szczegółowe porównanie
                    </Button>
                    
                    <Button 
                      variant="outline-success"
                      onClick={exportComparisonToPDF}
                    >
                      <FontAwesomeIcon icon={faFileExport} className="me-1" />
                      Eksportuj porównanie
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Tab>
          
          <Tab 
            eventKey="trends" 
            title={
              <span>
                <FontAwesomeIcon icon={faChartLine} className="me-1" />
                Trendy
              </span>
            }
          >
            <div className="mb-3">
              <p className="text-muted">
                Wykres przedstawia zmiany poziomu zgodności w czasie dla wybranego obszaru.
                Trend wzrostowy wskazuje na skuteczność wdrażanych działań naprawczych.
              </p>
              
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Wybierz obszar do analizy:</Form.Label>
                    <Form.Select 
                      value={selectedArea || ''}
                      onChange={(e) => setSelectedArea(e.target.value || null)}
                    >
                      <option value="">Ogólny wynik</option>
                      {uniqueAreas.map((area, index) => (
                        <option key={index} value={area}>{area}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <div style={{ height: '400px' }}>
                <Line 
                  data={prepareTrendData()} 
                  options={trendOptions}
                />
              </div>
              
              <div className="mt-3 alert alert-info">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                Wykres przedstawia zmiany poziomu zgodności w czasie dla wybranego obszaru.
                Trend wzrostowy wskazuje na skuteczność wdrażanych działań naprawczych.
              </div>
            </div>
          </Tab>
          
          <Tab 
            eventKey="summary" 
            title={
              <span>
                <FontAwesomeIcon icon={faChartBar} className="me-1" />
                Podsumowanie
              </span>
            }
          >
            <div className="mb-3">
              <p className="text-muted">
                Podsumowanie historii zmian pokazuje postęp w czasie i kluczowe statystyki.
              </p>
              
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="text-center h-100">
                    <Card.Body>
                      <h1 className="display-4">{historyEntries.length}</h1>
                      <p className="text-muted">Łączna liczba wersji</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center h-100">
                    <Card.Body>
                      <h1 className="display-4">
                        {historyEntries.length > 0 ? historyEntries[historyEntries.length - 1].overallScore : 0}%
                      </h1>
                      <p className="text-muted">Aktualny wynik</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center h-100">
                    <Card.Body>
                      <h1 className="display-4">
                        {historyEntries.length > 1 ? 
                          `${historyEntries[historyEntries.length - 1].overallScore - historyEntries[0].overallScore > 0 ? '+' : ''}${historyEntries[historyEntries.length - 1].overallScore - historyEntries[0].overallScore}%` : 
                          '0%'
                        }
                      </h1>
                      <p className="text-muted">Całkowita zmiana</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center h-100">
                    <Card.Body>
                      <h1 className="display-4">
                        {uniqueUsers.length}
                      </h1>
                      <p className="text-muted">Liczba użytkowników</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <div className="mb-4">
                <h6>Najnowsze zmiany</h6>
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Wersja</th>
                      <th>Użytkownik</th>
                      <th>Opis</th>
                      <th>Wynik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...historyEntries]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 3)
                      .map(entry => (
                        <tr key={entry.id}>
                          <td>{new Date(entry.date).toLocaleDateString()}</td>
                          <td>{entry.version}</td>
                          <td>{entry.user}</td>
                          <td>{entry.description}</td>
                          <td>
                            <Badge bg={
                              entry.overallScore >= 80 ? 'success' : 
                              entry.overallScore >= 60 ? 'warning' : 
                              'danger'
                            }>
                              {entry.overallScore}%
                            </Badge>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </Table>
              </div>
              
              <div className="mb-3">
                <h6>Obszary z największą poprawą</h6>
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Obszar</th>
                      <th>Początkowy wynik</th>
                      <th>Aktualny wynik</th>
                      <th>Zmiana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueAreas.map(area => {
                      const firstEntry = historyEntries
                        .filter(entry => entry.areaScores.some(score => score.area === area))
                        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
                        
                      const lastEntry = historyEntries
                        .filter(entry => entry.areaScores.some(score => score.area === area))
                        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                        
                      if (!firstEntry || !lastEntry) return null;
                      
                      const firstScore = firstEntry.areaScores.find(score => score.area === area)?.score || 0;
                      const lastScore = lastEntry.areaScores.find(score => score.area === area)?.score || 0;
                      const difference = lastScore - firstScore;
                      
                      return {
                        area,
                        firstScore,
                        lastScore,
                        difference
                      };
                    })
                    .filter(item => item !== null)
                    .sort((a, b) => b.difference - a.difference)
                    .slice(0, 3)
                    .map((item, index) => (
                      <tr key={index}>
                        <td>{item.area}</td>
                        <td>
                          <Badge bg={
                            item.firstScore >= 80 ? 'success' : 
                            item.firstScore >= 60 ? 'warning' : 
                            'danger'
                          }>
                            {item.firstScore}%
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={
                            item.lastScore >= 80 ? 'success' : 
                            item.lastScore >= 60 ? 'warning' : 
                            'danger'
                          }>
                            {item.lastScore}%
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={
                            item.difference > 0 ? 'success' : 
                            item.difference < 0 ? 'danger' : 
                            'secondary'
                          }>
                            {item.difference > 0 ? '+' : ''}
                            {item.difference}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </Tab>
        </Tabs>
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
                value={selectedArea || ''}
                onChange={(e) => setSelectedArea(e.target.value || null)}
              >
                <option value="">Ogólny wynik</option>
                {uniqueAreas.map((area, index) => (
                  <option key={index} value={area}>{area}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
          
          <div style={{ height: '400px' }}>
            <Line 
              data={prepareTrendData()} 
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
      
      {/* Modal przywracania wersji */}
      <Modal 
        show={showRestoreModal} 
        onHide={() => {
          setShowRestoreModal(false);
          setVersionToRestore(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUndo} className="me-2" />
            Przywracanie wersji
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {versionToRestore && (
            <>
              <Alert variant="warning">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                Czy na pewno chcesz przywrócić wersję {versionToRestore.version} z dnia {new Date(versionToRestore.date).toLocaleDateString()}?
              </Alert>
              <p>
                <strong>Opis wersji:</strong> {versionToRestore.description}
              </p>
              <p>
                <strong>Ogólny wynik:</strong> {versionToRestore.overallScore}%
              </p>
              <p>
                <strong>Użytkownik:</strong> {versionToRestore.user}
              </p>
              <p className="text-danger">
                <strong>Uwaga:</strong> Przywrócenie wersji spowoduje utratę wszystkich zmian wprowadzonych po tej wersji.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => {
              setShowRestoreModal(false);
              setVersionToRestore(null);
            }}
          >
            Anuluj
          </Button>
          <Button 
            variant="danger"
            onClick={handleRestoreVersion}
          >
            <FontAwesomeIcon icon={faUndo} className="me-1" />
            Przywróć wersję
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal szczegółowego porównania */}
      <Modal 
        show={showDetailedComparisonModal} 
        onHide={() => setShowDetailedComparisonModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
            Szczegółowe porównanie wersji
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {comparison && (
            <>
              <Tabs defaultActiveKey="overview" className="mb-3">
                <Tab 
                  eventKey="overview" 
                  title={
                    <span>
                      <FontAwesomeIcon icon={faTable} className="me-1" />
                      Przegląd zmian
                    </span>
                  }
                >
                  <div className="table-responsive">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Obszar</th>
                          <th>Wynik w {comparison.olderVersion.version}</th>
                          <th>Wynik w {comparison.newerVersion.version}</th>
                          <th>Zmiana</th>
                          <th>Opis zmiany</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.comparisonByArea.map((item, index) => (
                          <tr key={index}>
                            <td>{item.area}</td>
                            <td>
                              {item.olderScore !== null ? (
                                <Badge bg={
                                  item.olderScore >= 80 ? 'success' : 
                                  item.olderScore >= 60 ? 'warning' : 
                                  'danger'
                                }>
                                  {item.olderScore}%
                                </Badge>
                              ) : (
                                <span className="text-muted">Brak danych</span>
                              )}
                            </td>
                            <td>
                              {item.newerScore !== null ? (
                                <Badge bg={
                                  item.newerScore >= 80 ? 'success' : 
                                  item.newerScore >= 60 ? 'warning' : 
                                  'danger'
                                }>
                                  {item.newerScore}%
                                </Badge>
                              ) : (
                                <span className="text-muted">Brak danych</span>
                              )}
                            </td>
                            <td>
                              {item.difference !== null ? (
                                <Badge bg={
                                  item.difference > 0 ? 'success' : 
                                  item.difference < 0 ? 'danger' : 
                                  'secondary'
                                }>
                                  {item.difference > 0 ? '+' : ''}
                                  {item.difference}%
                                </Badge>
                              ) : (
                                <span className="text-muted">Brak danych</span>
                              )}
                            </td>
                            <td>
                              {item.description || (
                                <span className="text-muted">Brak opisu zmiany</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Tab>
                <Tab 
                  eventKey="sideBySide" 
                  title={
                    <span>
                      <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
                      Porównanie obok siebie
                    </span>
                  }
                >
                  <Row>
                    <Col md={6}>
                      <Card>
                        <Card.Header className="bg-light">
                          <h6 className="mb-0">
                            Wersja {comparison.olderVersion.version} ({new Date(comparison.olderVersion.date).toLocaleDateString()})
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <p><strong>Użytkownik:</strong> {comparison.olderVersion.user}</p>
                          <p><strong>Opis:</strong> {comparison.olderVersion.description}</p>
                          <p>
                            <strong>Ogólny wynik:</strong> 
                            <Badge 
                              bg={
                                comparison.olderVersion.overallScore >= 80 ? 'success' : 
                                comparison.olderVersion.overallScore >= 60 ? 'warning' : 
                                'danger'
                              }
                              className="ms-2"
                            >
                              {comparison.olderVersion.overallScore}%
                            </Badge>
                          </p>
                          
                          <h6 className="mt-4">Wyniki obszarów</h6>
                          <div className="table-responsive">
                            <Table striped hover size="sm">
                              <thead>
                                <tr>
                                  <th>Obszar</th>
                                  <th>Wynik</th>
                                </tr>
                              </thead>
                              <tbody>
                                {comparison.olderVersion.areaScores.map((areaScore, index) => (
                                  <tr key={index}>
                                    <td>{areaScore.area}</td>
                                    <td>
                                      <Badge bg={
                                        areaScore.score >= 80 ? 'success' : 
                                        areaScore.score >= 60 ? 'warning' : 
                                        'danger'
                                      }>
                                        {areaScore.score}%
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={6}>
                      <Card>
                        <Card.Header className="bg-light">
                          <h6 className="mb-0">
                            Wersja {comparison.newerVersion.version} ({new Date(comparison.newerVersion.date).toLocaleDateString()})
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <p><strong>Użytkownik:</strong> {comparison.newerVersion.user}</p>
                          <p><strong>Opis:</strong> {comparison.newerVersion.description}</p>
                          <p>
                            <strong>Ogólny wynik:</strong> 
                            <Badge 
                              bg={
                                comparison.newerVersion.overallScore >= 80 ? 'success' : 
                                comparison.newerVersion.overallScore >= 60 ? 'warning' : 
                                'danger'
                              }
                              className="ms-2"
                            >
                              {comparison.newerVersion.overallScore}%
                            </Badge>
                            <Badge 
                              bg={
                                comparison.overallDifference > 0 ? 'success' : 
                                comparison.overallDifference < 0 ? 'danger' : 
                                'secondary'
                              }
                              className="ms-2"
                            >
                              {comparison.overallDifference > 0 ? '+' : ''}
                              {comparison.overallDifference}%
                            </Badge>
                          </p>
                          
                          <h6 className="mt-4">Wyniki obszarów</h6>
                          <div className="table-responsive">
                            <Table striped hover size="sm">
                              <thead>
                                <tr>
                                  <th>Obszar</th>
                                  <th>Wynik</th>
                                  <th>Zmiana</th>
                                </tr>
                              </thead>
                              <tbody>
                                {comparison.newerVersion.areaScores.map((areaScore, index) => {
                                  const olderScore = comparison.olderVersion.areaScores.find(
                                    score => score.area === areaScore.area
                                  )?.score;
                                  
                                  const difference = olderScore !== undefined ? areaScore.score - olderScore : null;
                                  
                                  return (
                                    <tr key={index}>
                                      <td>{areaScore.area}</td>
                                      <td>
                                        <Badge bg={
                                          areaScore.score >= 80 ? 'success' : 
                                          areaScore.score >= 60 ? 'warning' : 
                                          'danger'
                                        }>
                                          {areaScore.score}%
                                        </Badge>
                                      </td>
                                      <td>
                                        {difference !== null ? (
                                          <Badge bg={
                                            difference > 0 ? 'success' : 
                                            difference < 0 ? 'danger' : 
                                            'secondary'
                                          }>
                                            {difference > 0 ? '+' : ''}
                                            {difference}%
                                          </Badge>
                                        ) : (
                                          <Badge bg="info">Nowy</Badge>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </Table>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab>
                <Tab 
                  eventKey="changes" 
                  title={
                    <span>
                      <FontAwesomeIcon icon={faListAlt} className="me-1" />
                      Lista zmian
                    </span>
                  }
                >
                  <div className="mb-3">
                    <h6>Zmiany wprowadzone w wersji {comparison.newerVersion.version}</h6>
                    {comparison.newerVersion.changes.length > 0 ? (
                      <div className="table-responsive">
                        <Table striped hover>
                          <thead>
                            <tr>
                              <th>Obszar</th>
                              <th>Poprzedni wynik</th>
                              <th>Nowy wynik</th>
                              <th>Zmiana</th>
                              <th>Opis</th>
                            </tr>
                          </thead>
                          <tbody>
                            {comparison.newerVersion.changes.map((change, index) => (
                              <tr key={index}>
                                <td>{change.area}</td>
                                <td>
                                  <Badge bg={
                                    change.oldScore >= 80 ? 'success' : 
                                    change.oldScore >= 60 ? 'warning' : 
                                    'danger'
                                  }>
                                    {change.oldScore}%
                                  </Badge>
                                </td>
                                <td>
                                  <Badge bg={
                                    change.newScore >= 80 ? 'success' : 
                                    change.newScore >= 60 ? 'warning' : 
                                    'danger'
                                  }>
                                    {change.newScore}%
                                  </Badge>
                                </td>
                                <td>
                                  <Badge bg={
                                    change.newScore - change.oldScore > 0 ? 'success' : 
                                    change.newScore - change.oldScore < 0 ? 'danger' : 
                                    'secondary'
                                  }>
                                    {change.newScore - change.oldScore > 0 ? '+' : ''}
                                    {change.newScore - change.oldScore}%
                                  </Badge>
                                </td>
                                <td>{change.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <Alert variant="info">
                        Brak szczegółowych zmian dla tej wersji.
                      </Alert>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowDetailedComparisonModal(false)}
          >
            Zamknij
          </Button>
          <Button 
            variant="outline-primary"
            onClick={exportComparisonToPDF}
          >
            <FontAwesomeIcon icon={faFileExport} className="me-1" />
            Eksportuj porównanie
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default ChangeHistoryFeature;
