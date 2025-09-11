import React from 'react';

// Import background images directly
import landingBg from '../assets/landing-bg.png';
import loginBg from '../assets/login-bg.png';
import registerBg from '../assets/register-bg.png';
import teamBg from '../assets/team-bg.png';

// This component provides background styles for different pages
const BackgroundStyles = () => {
  // Define the styles as CSS variables
  const styles = {
    landing: {
      backgroundImage: `url(${landingBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat'
    },
    login: {
      backgroundImage: `url(${loginBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat'
    },
    register: {
      backgroundImage: `url(${registerBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat'
    },
    team: {
      backgroundImage: `url(${teamBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat'
    }
  };

  return (
    <div style={{ display: 'none' }}>
      {/* This is just a placeholder to make the styles available */}
      <div className="landing-bg-styles" style={styles.landing}></div>
      <div className="login-bg-styles" style={styles.login}></div>
      <div className="register-bg-styles" style={styles.register}></div>
      <div className="team-bg-styles" style={styles.team}></div>
    </div>
  );
};

// Export the styles for direct use in components
export const backgroundStyles = {
  landing: {
    backgroundImage: `url(${landingBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat'
  },
  login: {
    backgroundImage: `url(${loginBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat'
  },
  register: {
    backgroundImage: `url(${registerBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat'
  },
  team: {
    backgroundImage: `url(${teamBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat'
  }
};

export default BackgroundStyles;
