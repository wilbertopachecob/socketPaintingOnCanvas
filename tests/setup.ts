import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { act } from 'react';

// Configure React Testing Library
configure({
  asyncUtilTimeout: 1000,
});

// Ensure React.act is available globally for test utilities
(global as any).act = act;
