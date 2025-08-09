import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { act } from 'react';

// Configure React Testing Library
configure({
  asyncUtilTimeout: 1000,
});

// Ensure React.act is available globally for test utilities
declare global {
  // Augment NodeJS.Global to include the 'act' property
  // The type of 'act' is the same as imported from 'react'
  // You may need to adjust the type if you use a different React version
  // Here, we use typeof act as imported above
  // This ensures type safety for global.act
  namespace NodeJS {
    interface Global {
      act: typeof act;
    }
  }
}
