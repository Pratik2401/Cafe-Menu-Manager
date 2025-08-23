import React, { useState, useEffect } from 'react'
import { getCafeSettings } from '../../api/customer'
import { getImageUrl } from '../../utils/imageUrl'
import '../../styles/Branding.css'

export default function Branding() {
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoBackgroundColor, setLogoBackgroundColor] = useState(null);
  
  useEffect(() => {
    const fetchLogoSettings = async () => {
      try {
        const response = await getCafeSettings();
        const data = response?.data?.data;
        
        if (data?.menuCustomization?.logoUrl) {
          setLogoUrl(data.menuCustomization.logoUrl);
        }
        if (data?.menuCustomization?.logoBackgroundColor) {
          setLogoBackgroundColor(data.menuCustomization.logoBackgroundColor);
        }
      } catch (error) {
        console.error('Failed to fetch logo settings:', error);
        setLogoUrl(null);
        setLogoBackgroundColor(null);
      }
    };
    
    fetchLogoSettings();
  }, []);
  
  return (
    <div className="logo-container" style={logoBackgroundColor ? { backgroundColor: logoBackgroundColor } : {}}>
      {logoUrl && <img src={getImageUrl(logoUrl)} className='LogoHeader' alt="Logo" />}
    </div>
  )
}
