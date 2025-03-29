// Re-export everything from our service modules
export * from './api'; // Updated path to use the new index.ts
export * from './tableService';
export * from './userService';
export * from './members/memberService';
export * from './evaluations'; // Updated to use the new index.ts
// export * from './cleanDatabaseService'; // Removed as requested
export * from './quiz';

// This file serves as a facade to maintain backward compatibility
// while keeping the codebase modular and maintainable

// Helper function to initialize database
export const initializeDatabase = async () => {
  try {
    console.log('Initializing database and loading quiz data...');
    // Here we could pre-fetch or pre-cache data if needed
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error };
  }
};

// Do not export the cleanDummyData function anymore
// export { cleanDummyData } from './cleanDatabaseService';
