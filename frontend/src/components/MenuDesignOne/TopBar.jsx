import { useState, useEffect } from 'react';
import { getAllSocials } from '../../api/customer';
import { getImageUrl } from '../../utils/imageUrl';
import '../../styles/TopBar.css';

export default function TopBar() {
  const [socialMediaLinks, setSocialMediaLinks] = useState([]);

  useEffect(() => {
    async function fetchSocials() {
      try {
        const response = await getAllSocials();
        const socials = Array.isArray(response) ? response : (response.data || []);

        if (!Array.isArray(socials)) {
          console.error('Expected array of socials but got:', typeof socials);
          return;
        }

        // Map to objects with icon & link
        const mapped = socials.map(social => ({
          name: social.name,
          icon: social.icon,
          link: social.url,
          _id: social._id
        }));

        setSocialMediaLinks(mapped);
      } catch (error) {
        console.error('Failed to fetch social links:', error);
      }
    }

    fetchSocials();
  }, []);

  return (
    <div className="TopBarContainer">
      {socialMediaLinks.map((item) => (
        <a
          key={item._id}
          className="TopBar-Icons"
          href={item.link}
          target={item.link?.startsWith('http') ? '_blank' : undefined}
          rel={item.link?.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          <img
            src={getImageUrl(item.icon)}
            alt={item.name}
            className="TopBar-IconsImage"
            title={item.name}
            style={{
              width: '24px',
              height: '24px',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </a>
      ))}
    </div>
  );
}
