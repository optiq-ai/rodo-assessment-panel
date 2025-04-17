import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, Accordion, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faInfoCircle, faSearch, faCalendarAlt, faUser, faArrowRight, faSyncAlt, faFilter } from '@fortawesome/free-solid-svg-icons';

/**
 * Komponent historii zmian dla oceny RODO
 * 
 * Funkcjonalności:
 * - Możliwość porównania wyników oceny z poprzednimi wersjami
 * - Śledzenie postępu w czasie
 * - Filtrowanie i wyszukiwanie zmian
 * - Szczegółowy widok zmian dla każdego obszaru
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
      status: 'Zakończona'
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
      status: 'Zakończona'
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
      status: 'Zakończona'
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
      status: 'W trakcie'
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
    olderVersion.changes.forEach(change => allAreas.add(change.area));
    newerVersion.changes.forEach(change => allAreas.add(change.area));
    
    // Przygotuj dane porównawcze dla każdego obszaru
    const comparisonByArea = Array.from(allAreas).map(area => {
      const olderChange = olderVersion.changes.find(change => change.area === area);
      const newerChange = newerVersion.changes.find(change => change.area === area);
      
      const olderScore = olderChange ? olderChange.newScore : null;
      const newerScore = newerChange ? newerChange.newScore : null;
      
      return {
        area,
        olderScore,
        newerScore,
        difference: newerScore && olderScore ? newerScore - olderScore : null,
        olderDescription: olderChange ? olderChange.description : null,
        newerDescription: newerChange ? newerChange.description : null
      };
    });
    
    return {
      olderVersion,
      newerVersion,
      comparisonByArea,
      overallDifference: newerVersion.overallScore - olderVersion.overallScore
    };
  };

  // Unikalni użytkownicy do filtrowania
  const uniqueUsers = [...new Set(historyEntries.map(entry => entry.user))];
  
  // Dane porównawcze
  const comparison = comparisonMode && selectedVersions.length === 2 ? comparisonData() : null;

  return (
    <Card className="mb-4 change-history-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FontAwesomeIcon icon={faHistory} className="me-2" />
          Historia zmian
        </h5>
        <div>
          <Button 
            variant={comparisonMode ? "primary" : "outline-primary"} 
            size="sm"
            onClick={() => setComparisonMode(!comparisonMode)}
            disabled={selectedVersions.length !== 2}
            className="me-2"
          >
            {comparisonMode ? "Wyłącz porównanie" : "Porównaj wersje"}
          </Button>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setSelectedVersions([])}
            disabled={selectedVersions.length === 0}
          >
            Wyczyść wybór
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
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
                      <th style={{width: '10%'}}>Szczegóły</th>
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
                            <Button 
                              variant="link" 
                              className="p-0"
                              data-bs-toggle="collapse"
                              data-bs-target={`#changes-${entry.id}`}
                              aria-expanded="false"
                              aria-controls={`changes-${entry.id}`}
                            >
                              Pokaż zmiany
                            </Button>
                          </td>
                        </tr>
                        {entry.changes.length > 0 && (
                          <tr className="collapse" id={`changes-${entry.id}`}>
                            <td colSpan="8" className="p-0">
                              <div className="p-3 bg-light">
                                <h6>Zmiany w wersji {entry.version}</h6>
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
              <div className="alert alert-info">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                Brak wpisów historii spełniających kryteria filtrowania.
              </div>
            )}
          </>
        )}
        
        {comparisonMode && comparison && (
          <div className="comparison-view">
            <div className="alert alert-info mb-4">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              Porównujesz wersję <strong>{comparison.olderVersion.version}</strong> ({new Date(comparison.olderVersion.date).toLocaleDateString()}) 
              z wersją <strong>{comparison.newerVersion.version}</strong> ({new Date(comparison.newerVersion.date).toLocaleDateString()}).
            </div>
            
            <Row className="mb-4">
              <Col md={6}>
                <Card className="h-100">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">Wersja {comparison.olderVersion.version}</h6>
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Data:</strong> {new Date(comparison.olderVersion.date).toLocaleDateString()}</p>
                    <p><strong>Użytkownik:</strong> {comparison.olderVersion.user}</p>
                    <p><strong>Opis:</strong> {comparison.olderVersion.description}</p>
                    <p>
                      <strong>Wynik ogólny:</strong> 
                      <Badge bg={
                        comparison.olderVersion.overallScore >= 80 ? 'success' : 
                        comparison.olderVersion.overallScore >= 60 ? 'warning' : 
                        'danger'
                      } className="ms-2">
                        {comparison.olderVersion.overallScore}%
                      </Badge>
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">Wersja {comparison.newerVersion.version}</h6>
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Data:</strong> {new Date(comparison.newerVersion.date).toLocaleDateString()}</p>
                    <p><strong>Użytkownik:</strong> {comparison.newerVersion.user}</p>
                    <p><strong>Opis:</strong> {comparison.newerVersion.description}</p>
                    <p>
                      <strong>Wynik ogólny:</strong> 
                      <Badge bg={
                        comparison.newerVersion.overallScore >= 80 ? 'success' : 
                        comparison.newerVersion.overallScore >= 60 ? 'warning' : 
                        'danger'
                      } className="ms-2">
                        {comparison.newerVersion.overallScore}%
                      </Badge>
                      <Badge bg={
                        comparison.overallDifference > 0 ? 'success' : 
                        comparison.overallDifference < 0 ? 'danger' : 
                        'secondary'
                      } className="ms-2">
                        {comparison.overallDifference > 0 ? '+' : ''}
                        {comparison.overallDifference}%
                      </Badge>
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <h6 className="mb-3">Porównanie zmian w obszarach</h6>
            
            <Accordion defaultActiveKey="0" className="mb-4">
              {comparison.comparisonByArea.map((item, index) => (
                <Accordion.Item eventKey={index.toString()} key={index}>
                  <Accordion.Header>
                    <div className="d-flex justify-content-between w-100 me-3">
                      <span>{item.area}</span>
                      <div>
                        {item.olderScore !== null && (
                          <Badge bg={
                            item.olderScore >= 80 ? 'success' : 
                            item.olderScore >= 60 ? 'warning' : 
                            'danger'
                          } className="me-2">
                            {item.olderScore}%
                          </Badge>
                        )}
                        <FontAwesomeIcon icon={faArrowRight} className="me-2" />
                        {item.newerScore !== null && (
                          <Badge bg={
                            item.newerScore >= 80 ? 'success' : 
                            item.newerScore >= 60 ? 'warning' : 
                            'danger'
                          } className="me-2">
                            {item.newerScore}%
                          </Badge>
                        )}
                        {item.difference !== null && (
                          <Badge bg={
                            item.difference > 0 ? 'success' : 
                            item.difference < 0 ? 'danger' : 
                            'secondary'
                          }>
                            {item.difference > 0 ? '+' : ''}
                            {item.difference}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      <Col md={6}>
                        <h6>Wersja {comparison.olderVersion.version}</h6>
                        <p>{item.olderDescription || 'Brak danych dla tego obszaru w tej wersji.'}</p>
                      </Col>
                      <Col md={6}>
                        <h6>Wersja {comparison.newerVersion.version}</h6>
                        <p>{item.newerDescription || 'Brak danych dla tego obszaru w tej wersji.'}</p>
                      </Col>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
            
            <div className="text-center">
              <Button 
                variant="primary" 
                onClick={() => setComparisonMode(false)}
              >
                Powrót do historii zmian
              </Button>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ChangeHistoryFeature;
