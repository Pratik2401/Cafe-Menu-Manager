import { useState, memo, useEffect } from "react";
import { Nav, Image, Collapse } from "react-bootstrap";
import { useNavigate, useLocation } from 'react-router-dom';
import "../../styles/SideBar.css";
import Snap2EatLogo from "../../assets/images/Snap2Eat.png";
import { getImageUrl } from '../../utils/imageUrl';
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaCog, 
  FaCalendarAlt, 
  FaChartLine, 
  FaUsers, 
  FaUtensils,
  FaTachometerAlt,
  FaClipboardList,
  FaTags,
  FaGift,
  FaImages,
  FaPlus,
  FaEdit
} from "react-icons/fa";
import { MdManageAccounts, MdDashboard } from "react-icons/md";

const Sidebar = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);

  // Auto-open dropdowns based on current route (only once on mount)
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Check if we're on a menu-related page and auto-open only on initial load
    if (currentPath.startsWith("/admin/categories") || 
        currentPath.startsWith("/admin/daily-offers") || 
        currentPath.startsWith("/admin/image-uploads")) {
      setMenuOpen(true);
    }
    // Check if we're on an events-related page and auto-open only on initial load
    else if (currentPath.startsWith("/admin/events")) {
      setEventsOpen(true);
    }
  }, []); // Empty dependency array means this only runs once on mount

  const handleSectionClick = (section, subSection = null, route = null) => {
    console.log('Section clicked:', section, 'Current menuOpen:', menuOpen, 'Current eventsOpen:', eventsOpen);
    
    if (section === "menu" && subSection === null) {
      // Always allow toggle of menu dropdown
      const newMenuOpen = !menuOpen;
      console.log('Setting menuOpen to:', newMenuOpen);
      setMenuOpen(newMenuOpen);
      setEventsOpen(false);
    } else if (section === "events" && subSection === null) {
      // Always allow toggle of events dropdown
      const newEventsOpen = !eventsOpen;
      console.log('Setting eventsOpen to:', newEventsOpen);
      setEventsOpen(newEventsOpen);
      setMenuOpen(false);
    } else {
      // Navigate to specific route
      if (route) {
        navigate(route);
      }
    }
  };

  const isActive = (route) => {
    return location.pathname === route;
  };

  const isMenuSectionActive = () => {
    return location.pathname.startsWith("/admin/categories") || 
           location.pathname.startsWith("/admin/daily-offers") ||
           location.pathname.startsWith("/admin/image-uploads");
  };

  const isEventsSectionActive = () => {
    return location.pathname.startsWith("/admin/events");
  };

  const getDropdownState = (itemId) => {
    const state = itemId === 'menu' ? menuOpen : itemId === 'events' ? eventsOpen : false;
    console.log('getDropdownState for', itemId, ':', state);
    return state;
  };

  const menuItems = [
    {
      id: 'controls',
      icon: <FaCog size={20} />,
      label: 'Admin Controls',
      route: '/admin/controls',
      type: 'single'
    },
    {
      id: 'management',
      icon: <MdManageAccounts size={20} />,
      label: 'Management',
      route: '/admin/management',
      type: 'single'
    },
    {
      id: 'menu',
      icon: <FaUtensils size={20} />,
      label: 'Menu Management',
      type: 'dropdown',
      isActive: isMenuSectionActive(),
      subItems: [
        { label: 'Categories', route: '/admin/categories', icon: <FaTags size={16} /> },
        { label: 'Daily Offers', route: '/admin/daily-offers', icon: <FaGift size={16} /> },
        { label: 'Image Uploads', route: '/admin/image-uploads', icon: <FaImages size={16} /> }
      ]
    },
    {
      id: 'events',
      icon: <FaCalendarAlt size={20} />,
      label: 'Event Management',
      type: 'dropdown',
      isActive: isEventsSectionActive(),
      subItems: [
        { label: 'Create Event', route: '/admin/events/new', icon: <FaPlus size={16} /> },
        { label: 'Manage Events', route: '/admin/events', icon: <FaEdit size={16} /> }
      ]
    },
    {
      id: 'analytics',
      icon: <FaChartLine size={20} />,
      label: 'Analytics',
      route: '/admin/analytics',
      type: 'single'
    },
    {
      id: 'users',
      icon: <FaUsers size={20} />,
      label: 'User Management',
      route: '/admin/user-info',
      type: 'single'
    }
  ];

  return (
    <div className="modern-sidebar">
      <div className="sidebar-header">
        <div className="brand-container">
          <Image 
            src={getImageUrl(Snap2EatLogo)} 
            className="brand-logo" 
            alt="Snap2Eat Logo" 
          />
          <div className="brand-text">
            <h5 className="brand-name">Snap2Eat</h5>
            <span className="brand-subtitle">Admin Portal</span>
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        <Nav className="modern-nav">
          {menuItems.map(item => (
            <div key={item.id} className="nav-item-container">
              {item.type === 'single' ? (
                <button
                  type="button"
                  className={`modern-nav-item ${isActive(item.route) ? 'active' : ''}`}
                  onClick={() => handleSectionClick(item.id, null, item.route)}
                >
                  <div className="nav-item-content">
                    <div className="nav-item-left">
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                    </div>
                  </div>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={`modern-nav-item ${item.isActive ? 'dropdown-parent-active' : ''}`}
                    onClick={() => handleSectionClick(item.id)}
                    aria-expanded={getDropdownState(item.id)}
                  >
                    <div className="nav-item-content">
                      <div className="nav-item-left">
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                      </div>
                      <span className="dropdown-arrow">
                        <FaChevronDown size={14} />
                      </span>
                    </div>
                  </button>
                  
                  <Collapse in={getDropdownState(item.id)}>
                    <div className="dropdown-menu">
                      <div className="dropdown-menu-content">
                        {item.subItems.map((subItem, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`dropdown-item ${
                              location.pathname === subItem.route ? 'dropdown-child-active' : ''
                            }`}
                            onClick={() => {
                              handleSectionClick(item.id, subItem.label.toLowerCase(), subItem.route);
                            }}
                          >
                            <span className="dropdown-icon">{subItem.icon}</span>
                            <span className="dropdown-label">{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </Collapse>
                </>
              )}
            </div>
          ))}
        </Nav>
      </div>

      <div className="sidebar-footer">
        <div className="admin-info">
          <div className="admin-avatar">
            <FaTachometerAlt size={16} />
          </div>
          <div className="admin-details">
            <span className="admin-name">Admin Panel</span>
            <span className="admin-status">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Sidebar;