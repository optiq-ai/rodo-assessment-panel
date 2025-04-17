import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer mt-auto py-3 bg-dark text-white">
      <Container className="text-center">
        <p className="mb-0">Panel Oceny RODO &copy; {currentYear}</p>
        <p className="mb-0 small">Aplikacja do oceny zgodności z Rozporządzeniem o Ochronie Danych Osobowych</p>
      </Container>
    </footer>
  );
};

export default Footer;
