require('@testing-library/jest-dom');
const { configure } = require('@testing-library/react');
const { act } = require('react');

// Configure React Testing Library
configure({
  asyncUtilTimeout: 1000,
});

// Ensure React.act is available globally for test utilities
global.act = act;
