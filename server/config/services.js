// Service configuration for switching between mock and real services
const mockCommunicationService = require('../services/mockCommunicationService');
const mockCibilService = require('../services/mockCibilService');

// Future real services (to be implemented)
// const realCommunicationService = require('../services/realCommunicationService');
// const realCibilService = require('../services/realCibilService');

const config = {
  communication: {
    provider: process.env.COMMUNICATION_PROVIDER || 'mock', // 'mock' | 'real'
    mock: mockCommunicationService,
    // real: realCommunicationService // Uncomment when real service is implemented
  },
  cibil: {
    provider: process.env.CIBIL_PROVIDER || 'mock', // 'mock' | 'real'
    mock: mockCibilService,
    // real: realCibilService // Uncomment when real service is implemented
  }
};

// Get the active service based on environment configuration
const getCommunicationService = () => {
  const provider = config.communication.provider;
  const service = config.communication[provider];
  
  if (!service) {
    console.warn(`Communication service '${provider}' not found, falling back to mock`);
    return config.communication.mock;
  }
  
  console.log(`Using ${provider} communication service`);
  return service;
};

const getCibilService = () => {
  const provider = config.cibil.provider;
  const service = config.cibil[provider];
  
  if (!service) {
    console.warn(`CIBIL service '${provider}' not found, falling back to mock`);
    return config.cibil.mock;
  }
  
  console.log(`Using ${provider} CIBIL service`);
  return service;
};

module.exports = {
  config,
  getCommunicationService,
  getCibilService,
  // Export services for direct access if needed
  communicationService: getCommunicationService(),
  cibilService: getCibilService()
};





