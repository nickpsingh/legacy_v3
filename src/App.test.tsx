import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders app', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
});
