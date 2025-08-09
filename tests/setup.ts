import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { act } from 'react';

// Configure React Testing Library to use React.act instead of ReactDOMTestUtils.act
configure({
  asyncUtilTimeout: 1000,
  // This ensures React.act is used instead of the deprecated ReactDOMTestUtils.act
  reactStrictMode: true,
});

// Ensure React.act is available globally for test utilities
(global as any).act = act;
