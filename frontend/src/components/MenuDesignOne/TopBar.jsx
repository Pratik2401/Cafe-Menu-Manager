import { useState, useEffect } from 'react';

import { FaInstagram, FaWhatsapp, FaEnvelope, FaPhone, FaGoogle, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';
import { getAllSocials } from '../../api/customer'; // Your API call function

import '../../styles/TopBar.css';

// Map platform names to their respective icon components
const iconMap = {
  Instagram: FaInstagram,
  WhatsApp: FaWhatsapp,
  Email: FaEnvelope,
  'Mobile Number': FaPhone,
  Google: FaGoogle,
  Maps: FaMapMarkerAlt,
  Website: FaGlobe
};

const iconColors = {
  Instagram: 'var(--bg-tertiary)',
  WhatsApp: 'var(--bg-tertiary)',
  Email: 'var(--bg-tertiary)',
  'Mobile Number': 'var(--bg-tertiary)',
  Google: 'var(--bg-tertiary)',
  Maps: 'var(--bg-tertiary)',
  Website: 'var(--bg-tertiary)',
};

export default function TopBar() {
  const [socialMediaLinks, setSocialMediaLinks] = useState([]);

  useEffect(() => {
    async function fetchSocials() {
      try {
        const response = await getAllSocials();
        const socials = response.data;

        if (!Array.isArray(socials)) {
          console.error('Expected array of socials but got:', typeof socials);
          return;
        }

        // Filter visible socials only (though they should already be filtered by the backend)
        const visibleSocials = socials;

        // Map to objects with icon & link
        const mapped = visibleSocials.map(social => {
          const IconComponent = iconMap[social.platform] || FaGlobe;
          const iconColor = iconColors[social.platform] || '#6C757D';
          
          return {
            name: social.platform,
            IconComponent,
            iconColor,
            link: social.url,
          };
        });

        setSocialMediaLinks(mapped);
      } catch (error) {
        console.error('Failed to fetch social links:', error);
      }
    }

    fetchSocials();
  }, []);

  return (
    <div className="TopBarContainer">
      {socialMediaLinks.map((item, index) => (
        <a
          key={index}
          className="TopBar-Icons"
          href={item.link}
          target={item.link?.startsWith('http') ? '_blank' : undefined}
          rel={item.link?.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          <item.IconComponent
            size={24}
            color={item.iconColor}
            className="TopBar-IconsImage"
            title={item.name}
          />
        </a>
      ))}
    </div>
  );
}
