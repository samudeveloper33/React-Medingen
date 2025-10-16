import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleSocialClick = (platform) => {
    // Handle social media links
    const socialLinks = {
      instagram: 'https://instagram.com/medingen',
      facebook: 'https://facebook.com/medingen',
      youtube: 'https://youtube.com/medingen',
      linkedin: 'https://linkedin.com/company/medingen'
    };
    
    if (socialLinks[platform]) {
      window.open(socialLinks[platform], '_blank');
    }
  };

  const handleLinkClick = (section) => {
    // Handle navigation clicks - only handle home scroll, others do nothing
    switch(section) {
      case 'home':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      default:
        // Other links do nothing - no alerts or actions
        break;
    }
  };


  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          {/* Brand Section */}
          <div className="footer__brand">
            <div className="footer__logo">
              <div className="footer__logo-icon">
                <span className="footer__logo-text">MIG</span>
              </div>
              <span className="footer__brand-name">Medingen</span>
            </div>
            <p className="footer__tagline">
              Saves you health and wealth
            </p>
          </div>

          {/* Links Grid */}
          <div className="footer__links">
            {/* Website Section */}
            <div className="footer__section">
              <h3 className="footer__section-title">Website</h3>
              <ul className="footer__section-links">
                <li>
                  <button 
                    className="footer__link"
                    onClick={() => handleLinkClick('home')}
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button 
                    className="footer__link"
                    onClick={() => handleLinkClick('features')}
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button 
                    className="footer__link"
                    onClick={() => handleLinkClick('how-it-works')}
                  >
                    How it works
                  </button>
                </li>
                <li>
                  <button 
                    className="footer__link"
                    onClick={() => handleLinkClick('sitemap')}
                  >
                    Sitemap
                  </button>
                </li>
              </ul>
            </div>

            {/* Our Policies Section */}
            <div className="footer__section">
              <h3 className="footer__section-title">Our Policies</h3>
              <ul className="footer__section-links">
                <li>
                  <button 
                    className="footer__link"
                    onClick={() => handleLinkClick('privacy-policies')}
                  >
                    Privacy Policies
                  </button>
                </li>
                <li>
                  <button 
                    className="footer__link"
                    onClick={() => handleLinkClick('terms-conditions')}
                  >
                    Terms and Conditions
                  </button>
                </li>
                <li>
                  <button 
                    className="footer__link"
                    onClick={() => handleLinkClick('grievance-policy')}
                  >
                    Grievance Redressal Policy
                  </button>
                </li>
                <li>
                  <button 
                    className="footer__link"
                    onClick={() => handleLinkClick('return-policy')}
                  >
                    Return Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Follow Us Section */}
            <div className="footer__section">
              <h3 className="footer__section-title">Follow Us</h3>
              <ul className="footer__section-links">
                <li>
                  <button 
                    className="footer__link footer__social-link"
                    onClick={() => handleSocialClick('instagram')}
                  >
                    Instagram
                  </button>
                </li>
                <li>
                  <button 
                    className="footer__link footer__social-link"
                    onClick={() => handleSocialClick('facebook')}
                  >
                    Facebook
                  </button>
                </li>
                <li>
                  <button 
                    className="footer__link footer__social-link"
                    onClick={() => handleSocialClick('youtube')}
                  >
                    YouTube
                  </button>
                </li>
                <li>
                  <button 
                    className="footer__link footer__social-link"
                    onClick={() => handleSocialClick('linkedin')}
                  >
                    LinkedIn
                  </button>
                </li>
              </ul>
            </div>

            {/* More Section */}
            <div className="footer__section">
              <h3 className="footer__section-title">More</h3>
              <ul className="footer__section-links">
                <li>
                  <button 
                    className="footer__link"
                    onClick={() => handleLinkClick('about-us')}
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button 
                    className="footer__link"
                    onClick={() => handleLinkClick('blogs')}
                  >
                    Blogs
                  </button>
                </li>
                <li>
                  <button 
                    className="footer__link"
                    onClick={() => handleLinkClick('help-center')}
                  >
                    Help Center
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            @{currentYear} Medingen. All Rights Reserved
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
