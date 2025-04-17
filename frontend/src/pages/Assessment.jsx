import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Nav, ProgressBar, Accordion } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CompactAssessmentForm from '../components/assessment/CompactAssessmentForm';
import MoreCompactAssessmentForm from '../components/assessment/MoreCompactAssessmentForm';
import RiskScoringSystem from '../components/assessment/RiskScoringSystem';
import AssessmentVisualizations from '../components/assessment/AssessmentVisualizations';
import RemedialActionsSection from '../components/assessment/RemedialActionsSection';
import ChangeHistoryFeature from '../components/assessment/ChangeHistoryFeature';
import rodoAssessmentData from '../data/rodoAssessmentData';

const Assessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [viewMode, setViewMode] = useState('area'); // 'area' or 'chapter'
  const [activeTab, setActiveTab] = useState('form'); // 'form', 'risk', 'visualizations', 'actions', 'history'

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assessment, setAssessment] = useState({
    id: id || 'new',
    name: '',
    description: '',
    status: 'DRAFT',
    chapters: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (id && id !== 'new') {
          // W rzeczywistości będzie to wywołanie do backendu
          // const response = await assessmentService.getAssessment(id);
          
          // Tymczasowe dane dla szkieletu
          const mockChapters = JSON.parse(JSON.stringify(rodoAssessmentData.chapters));
          
          setAssessment({
            id: id,
            name: 'Ocena RODO - Dział IT',
            description: 'Ocena zgodności z RODO dla działu IT',
            status: 'W TRAKCIE',
            chapters: mockChapters
          });
        } else {
          // Pobieranie struktury formularza dla nowej oceny
          // W rzeczywistości będzie to wywołanie do backendu
          // const response = await assessmentService.getAssessmentTemplate();
          
          // Tymczasowe dane dla szkieletu
          const mockChapters = JSON.parse(JSON.stringify(rodoAssessmentData.chapters));
          
          setAssessment({
            id: 'new',
            name: '',
            description: '',
            status: 'DRAFT',
            chapters: mockChapters
          });
        }
      } catch (err) {
        setError('Nie udało się pobrać danych oceny');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAssessment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequirementChange = (chapterIndex, areaIndex, requirementIndex, field, value) => {
    const updatedChapters = [...assessment.chapters];
    updatedChapters[chapterIndex].areas[areaIndex].requirements[requirementIndex][field] = value;
    setAssessment(prev => ({
      ...prev,
      chapters: updatedChapters
    }));
    updateProgress();
  };

  const handleAreaScoreChange = (chapterIndex, areaIndex, value) => {
    const updatedChapters = [...assessment.chapters];
    updatedChapters[chapterIndex].areas[areaIndex].score = value;
    setAssessment(prev => ({
      ...prev,
      chapters: updatedChapters
    }));
  };

  const handleAreaCommentChange = (chapterIndex, areaIndex, value) => {
    const updatedChapters = [...assessment.chapters];
    updatedChapters[chapterIndex].areas[areaIndex].comment = value;
    setAssessment(prev => ({
      ...prev,
      chapters: updatedChapters
    }));
  };

  // Funkcja obsługi zmiany oceny ryzyka
  const handleRiskScoreChange = (chapterIndex, areaIndex, score, riskLevel) => {
    const updatedChapters = [...assessment.chapters];
    if (!updatedChapters[chapterIndex].areas[areaIndex].riskScore) {
      updatedChapters[chapterIndex].areas[areaIndex].riskScore = {};
    }
    updatedChapters[chapterIndex].areas[areaIndex].riskScore.score = score;
    updatedChapters[chapterIndex].areas[areaIndex].riskScore.level = riskLevel;
    setAssessment(prev => ({
      ...prev,
      chapters: updatedChapters
    }));
  };

  // Funkcje nawigacji między obszarami
  const handleNextArea = () => {
    const currentChapter = assessment.chapters[currentChapterIndex];
    if (currentAreaIndex < currentChapter.areas.length - 1) {
      // Przejście do następnego obszaru w tym samym rozdziale
      setCurrentAreaIndex(currentAreaIndex + 1);
    } else if (currentChapterIndex < assessment.chapters.length - 1) {
      // Przejście do pierwszego obszaru w następnym rozdziale
      setCurrentChapterIndex(currentChapterIndex + 1);
      setCurrentAreaIndex(0);
    }
    updateProgress();
  };

  const handlePrevArea = () => {
    if (currentAreaIndex > 0) {
      // Przejście do poprzedniego obszaru w tym samym rozdziale
      setCurrentAreaIndex(currentAreaIndex - 1);
    } else if (currentChapterIndex > 0) {
      // Przejście do ostatniego obszaru w poprzednim rozdziale
      setCurrentChapterIndex(currentChapterIndex - 1);
      const prevChapter = assessment.chapters[currentChapterIndex - 1];
      setCurrentAreaIndex(prevChapter.areas.length - 1);
    }
    updateProgress();
  };

  // Funkcje nawigacji między rozdziałami
  const handleNextChapter = () => {
    if (currentChapterIndex < assessment.chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
    updateProgress();
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
    updateProgress();
  };

  // Funkcja do obliczania ogólnego postępu
  const updateProgress = () => {
    let totalRequirements = 0;
    let answeredRequirements = 0;

    assessment.chapters.forEach(chapter => {
      chapter.areas.forEach(area => {
        area.requirements.forEach(req => {
          totalRequirements++;
          if (req.value) {
            answeredRequirements++;
          }
        });
      });
    });

    const progress = totalRequirements > 0 ? Math.round((answeredRequirements / totalRequirements) * 100) : 0;
    setOverallProgress(progress);
  };

  // Funkcja eksportu oceny
  const handleExport = () => {
    // W rzeczywistości będzie to wywołanie do backendu
    // const response = await assessmentService.exportAssessment(assessment.id);
    
    // Symulacja eksportu
    const exportData = JSON.stringify(assessment, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocena-rodo-${assessment.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // W rzeczywistości będzie to wywołanie do backendu
      // const response = await assessmentService.saveAssessment(assessment);
      
      // Symulacja zapisywania
      setTimeout(() => {
        setLoading(false);
        setSaveSuccess(true);
        // Ukryj komunikat o sukcesie po 3 sekundach
        setTimeout(() => setSaveSuccess(false), 3000);
      }, 1000);
    } catch (err) {
      setError('Nie udało się zapisać oceny');
      setLoading(false);
    }
  };

  // Funkcja zmiany trybu widoku
  const toggleViewMode = () => {
    setViewMode(viewMode === 'area' ? 'chapter' : 'area');
  };

  // Obliczanie całkowitej liczby obszarów
  const calculateTotalAreas = () => {
    return assessment.chapters.reduce((total, chapter) => total + chapter.areas.length, 0);
  };

  // Obliczanie aktualnego indeksu obszaru globalnie
  const calculateCurrentAreaIndex = () => {
    return assessment.chapters.slice(0, currentChapterIndex).reduce((total, chapter) => total + chapter.areas.length, 0) + currentAreaIndex;
  };

  if (loading) {
    return (
      <Container className="my-4">
        <div className="text-center">
          <p>Ładowanie formularza oceny...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <h1 className="fade-in">{id === 'new' ? 'Nowa ocena RODO' : 'Edycja oceny RODO'}</h1>
          {error && <Alert variant="danger" className="fade-in">{error}</Alert>}
          {saveSuccess && <Alert variant="success" className="fade-in">Zmiany zostały pomyślnie zapisane!</Alert>}
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="fade-in">
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Nazwa oceny</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={assessment.name}
                    onChange={handleInputChange}
                    placeholder="Wprowadź nazwę oceny"
                    required
                    className="comment-animated"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Opis</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={assessment.description}
                    onChange={handleInputChange}
                    placeholder="Wprowadź opis oceny"
                    className="comment-animated"
                  />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {assessment.chapters.length > 0 && (
        <>
          <Row className="mb-4">
            <Col>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5>Ogólny postęp oceny:</h5>
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={toggleViewMode} 
                    className="me-3"
                  >
                    {viewMode === 'area' ? 'Przełącz na widok rozdziałów' : 'Przełącz na widok obszarów'}
                  </Button>
                  <span className="badge bg-primary">{overallProgress}%</span>
                </div>
              </div>
              <ProgressBar 
                now={overallProgress} 
                variant={overallProgress < 30 ? "danger" : overallProgress < 70 ? "warning" : "success"} 
                animated 
                style={{height: '15px'}}
              />
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <Nav variant="tabs" className="assessment-tabs">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'form'} 
                    onClick={() => setActiveTab('form')}
                  >
                    Formularz oceny
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'risk'} 
                    onClick={() => setActiveTab('risk')}
                  >
                    Ocena ryzyka
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'visualizations'} 
                    onClick={() => setActiveTab('visualizations')}
                  >
                    Wizualizacje
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'actions'} 
                    onClick={() => setActiveTab('actions')}
                  >
                    Działania naprawcze
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'history'} 
                    onClick={() => setActiveTab('history')}
                  >
                    Historia zmian
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>

          <Row>
            <Col>
              {activeTab === 'form' && (
                <>
                  {viewMode === 'area' && assessment.chapters[currentChapterIndex] && assessment.chapters[currentChapterIndex].areas[currentAreaIndex] && (
                    <CompactAssessmentForm
                      area={assessment.chapters[currentChapterIndex].areas[currentAreaIndex]}
                      chapterIndex={currentChapterIndex}
                      areaIndex={currentAreaIndex}
                      handleRequirementChange={handleRequirementChange}
                      handleAreaScoreChange={handleAreaScoreChange}
                      handleAreaCommentChange={handleAreaCommentChange}
                      totalAreas={calculateTotalAreas()}
                      currentAreaIndex={calculateCurrentAreaIndex()}
                      onNextArea={handleNextArea}
                      onPrevArea={handlePrevArea}
                      onSave={handleSave}
                      onExport={handleExport}
                    />
                  )}
                  
                  {viewMode === 'chapter' && assessment.chapters[currentChapterIndex] && (
                    <MoreCompactAssessmentForm
                      chapter={assessment.chapters[currentChapterIndex]}
                      chapterIndex={currentChapterIndex}
                      handleRequirementChange={handleRequirementChange}
                      handleAreaScoreChange={handleAreaScoreChange}
                      handleAreaCommentChange={handleAreaCommentChange}
                      totalChapters={assessment.chapters.length}
                      onNextChapter={handleNextChapter}
                      onPrevChapter={handlePrevChapter}
                      onSave={handleSave}
                      onExport={handleExport}
                    />
                  )}
                </>
              )}

              {activeTab === 'risk' && assessment.chapters[currentChapterIndex] && assessment.chapters[currentChapterIndex].areas[currentAreaIndex] && (
                <div className="fade-in">
                  <div className="mb-3 p-3 bg-light rounded">
                    <h5>Ocena ryzyka dla obszaru: {assessment.chapters[currentChapterIndex].areas[currentAreaIndex].name}</h5>
                    <p className="text-muted">
                      Rozdział: {assessment.chapters[currentChapterIndex].name} | 
                      Obszar {calculateCurrentAreaIndex() + 1} z {calculateTotalAreas()}
                    </p>
                  </div>
                  <RiskScoringSystem 
                    chapterIndex={currentChapterIndex}
                    areaIndex={currentAreaIndex}
                    area={assessment.chapters[currentChapterIndex].areas[currentAreaIndex]}
                    onScoreChange={handleRiskScoreChange}
                  />
                  <div className="d-flex justify-content-between mt-3">
                    <Button 
                      variant="outline-secondary" 
                      onClick={handlePrevArea}
                      disabled={currentChapterIndex === 0 && currentAreaIndex === 0}
                    >
                      Poprzedni obszar
                    </Button>
                    <div>
                      <Button 
                        variant="primary" 
                        className="me-2"
                        onClick={handleSave}
                      >
                        Zapisz ocenę
                      </Button>
                      <Button 
                        variant="outline-primary"
                        onClick={handleExport}
                      >
                        Eksportuj
                      </Button>
                    </div>
                    <Button 
                      variant="outline-secondary" 
                      onClick={handleNextArea}
                      disabled={currentChapterIndex === assessment.chapters.length - 1 && 
                                currentAreaIndex === assessment.chapters[currentChapterIndex].areas.length - 1}
                    >
                      Następny obszar
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'visualizations' && (
                <div className="fade-in">
                  <AssessmentVisualizations assessmentData={assessment} />
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="fade-in">
                  <RemedialActionsSection assessmentData={assessment} />
                </div>
              )}

              {activeTab === 'history' && (
                <div className="fade-in">
                  <ChangeHistoryFeature assessmentId={assessment.id} />
                </div>
              )}
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Assessment;
