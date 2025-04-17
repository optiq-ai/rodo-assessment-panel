import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Panel Oceny RODO</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {currentUser ? (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/assessment">Nowa ocena</Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to="/">Strona główna</Nav.Link>
            )}
          </Nav>
          <Nav>
            {currentUser ? (
              <>
                <Navbar.Text className="me-3">
                  Zalogowany jako: <span className="text-white">{currentUser.username}</span>
                </Navbar.Text>
                <Button variant="outline-light" onClick={handleLogout}>Wyloguj</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Logowanie</Nav.Link>
                <Nav.Link as={Link} to="/register">Rejestracja</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
