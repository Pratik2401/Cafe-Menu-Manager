import React, { useState } from 'react';
import { Navbar, Button, Offcanvas, Nav, Collapse, Image } from 'react-bootstrap';
import { List } from 'react-bootstrap-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaChevronDown, FaChevronUp, FaCog, FaCalendarAlt, FaChartLine, FaUsers } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";
import '../../styles/MobileHeader.css';
import Snap2EatLogo from '../../assets/images/Snap2Eat.png'; // Adjust the path as necessary

const MobileHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);

  const toggleSidebar = () => setShow(!show);
  const closeSidebar = () => setShow(false);

  const handleSectionClick = (section, subSection = null, route = null) => {
    if (section === "menu" && subSection === null) {
      setMenuOpen(!menuOpen);
      setEventsOpen(false);
    } else if (section === "events" && subSection === null) {
      setEventsOpen(!eventsOpen);
      setMenuOpen(false);
    } else {
      if (route) {
        navigate(route);
      }
      closeSidebar();
    }
  };

  // Helper function to check if current route matches
  const isActive = (route) => {
    return location.pathname === route;
  };

  return (
    <div className="mobile-header">
      <Navbar className="py-2">
        <div className="container-fluid d-flex align-items-center">
          <div className="hamburger-container">
            <Button 
              variant="link" 
              className="hamburger-btn p-0"
              onClick={toggleSidebar}
              aria-label="Menu"
            >
              <div className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </Button>
          </div>
          <Navbar.Brand className="mx-auto">Admin Dashboard</Navbar.Brand>
        </div>
      </Navbar>

      <Offcanvas show={show} onHide={closeSidebar} className="mobile-sidebar">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="fw-bold">Snap2Eat</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="SideBar-Container">
          <button
            type="button"
            className={`menu-toggle btn btn-link text-start ${
              isActive("/admin/dashboard") ? "active" : ""
            }`}
            onClick={() => handleSectionClick("dashboard", null, "/admin/dashboard")}
          >
            <MdManageAccounts size={22} color={isActive("/admin/dashboard") ? "white" : "black"} />
            <span style={{ marginLeft: '3px' }}>Admin Dashboard</span>
          </button>

          <button
            type="button"
            className={`menu-toggle btn btn-link text-start ${
              isActive("/admin/controls") ? "active" : ""
            }`}
            onClick={() => handleSectionClick("controls", null, "/admin/controls")}
          >
            <FaCog size={22} color={isActive("/admin/controls") ? "white" : "black"} />
            <span style={{ marginLeft: '3px' }}>Admin Controls</span>
          </button>

          <button
            type="button"
            className={`menu-toggle btn btn-link text-start ${
              isActive("/admin/management") ? "active" : ""
            }`}
            onClick={() => handleSectionClick("management", null, "/admin/management")}
          >
            <FaCog size={22} color={isActive("/admin/management") ? "white" : "black"} />
            <span style={{ marginLeft: '3px' }}>Management Controls</span>
          </button>

          <Nav className="flex-column">
            <button
              type="button"
              className={`menu-toggle btn btn-link text-start ${
                location.pathname.startsWith("/admin/categories") || 
                location.pathname.startsWith("/admin/subcategories") || 
                location.pathname.startsWith("/admin/items") ||
                location.pathname.startsWith("/admin/daily-offers") ||
                location.pathname.startsWith("/admin/food-categories") ||
                location.pathname.startsWith("/admin/image-uploads") ? "active" : ""
              }`}
              onClick={() => handleSectionClick("menu")}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 35 35"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24.8137 4.45527C25.1155 4.23993 25.488 4.14764 25.8554 4.19715C26.2229 4.24666 26.5576 4.43427 26.7917 4.72182C27.0257 5.00936 27.1415 5.37526 27.1154 5.7451C27.0893 6.11494 26.9233 6.46095 26.6512 6.71277L26.5082 6.82798L23.4443 9.01694C23.004 9.33019 22.6616 9.76183 22.4566 10.2618C22.2517 10.7618 22.1926 11.3096 22.2864 11.8417L22.333 12.0634L27.2082 7.18819C27.4707 6.92664 27.8228 6.77479 28.1932 6.76348C28.5635 6.75217 28.9243 6.88225 29.2022 7.1273C29.4801 7.37235 29.6543 7.71399 29.6895 8.08284C29.7246 8.45168 29.618 8.82008 29.3914 9.11319L29.2703 9.25027L24.3951 14.1255C25.4232 14.388 26.5607 14.0671 27.2914 13.2067L27.4416 13.0142L29.6305 9.95027C29.8465 9.64964 30.1687 9.44236 30.5318 9.37048C30.8949 9.29859 31.2717 9.36747 31.5859 9.56315C31.9001 9.75883 32.1282 10.0667 32.2238 10.4243C32.3194 10.7818 32.2755 11.1624 32.101 11.4888L32.0032 11.6449L29.8157 14.7103C29.0057 15.8427 27.8148 16.6453 26.4611 16.971C25.1075 17.2967 23.6818 17.1236 22.4453 16.4836L22.1828 16.3378L18.833 19.6861L24.8953 25.7499C25.1464 26.001 25.2973 26.3351 25.3195 26.6895C25.3418 27.0439 25.234 27.3943 25.0164 27.6749L24.8953 27.8119C24.6442 28.063 24.3101 28.2139 23.9557 28.2362C23.6013 28.2584 23.2509 28.1506 22.9703 27.933L22.8332 27.8119L16.771 21.7482L10.7087 27.8119C10.4575 28.063 10.1234 28.2139 9.76903 28.2362C9.41462 28.2584 9.06425 28.1506 8.78366 27.933L8.64658 27.8119C8.39549 27.5608 8.24465 27.2267 8.22237 26.8723C8.20008 26.5179 8.30788 26.1675 8.52554 25.8869L8.64658 25.7499L14.7089 19.6861L12.361 17.3382C11.7434 17.6724 11.0763 17.9052 10.3849 18.028L10.0203 18.0819C9.14782 18.1922 8.26162 18.0981 7.43173 17.807C6.60183 17.5159 5.85098 17.0359 5.23845 16.4049C3.88366 15.0486 3.10929 13.3438 2.91679 11.7061C2.7272 10.0946 3.09179 8.36798 4.27304 7.18819C5.45283 6.00694 7.17804 5.64236 8.7895 5.83194C10.4272 6.0259 12.1335 6.80027 13.4882 8.15506C14.1191 8.76743 14.599 9.51805 14.8901 10.3477C15.1811 11.1773 15.2753 12.0632 15.1653 12.9355C15.0778 13.6719 14.8635 14.3705 14.5732 14.9786L14.4216 15.2761L16.7695 17.624L20.1207 14.2757C19.4191 13.0765 19.172 11.6649 19.4248 10.2987C19.6775 8.93243 20.4132 7.70265 21.4974 6.83381L21.7482 6.64423L24.8137 4.45527Z"
                  fill={
                    location.pathname.startsWith("/admin/categories") || 
                    location.pathname.startsWith("/admin/subcategories") || 
                    location.pathname.startsWith("/admin/items") ||
                    location.pathname.startsWith("/admin/daily-offers") ||
                    location.pathname.startsWith("/admin/food-categories") ||
                    location.pathname.startsWith("/admin/image-uploads") ? "white" : "black"
                  }
                />
              </svg>
              <span style={{ marginLeft: '3px' }}>Menu {menuOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
            </button>

            <Collapse in={menuOpen}>
              <div className="menu-sub-items ms-3">
                <Nav.Link
                  href="#"
                  className={
                    location.pathname.startsWith("/admin/categories") ||
                    location.pathname.startsWith("/admin/subcategories") ||
                    location.pathname.startsWith("/admin/items") ? "active" : ""
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    handleSectionClick("menu", "category", "/admin/categories");
                  }}
                >
                  Category  Sub Category  Items
                </Nav.Link>
                <Nav.Link
                  href="#"
                  className={location.pathname.startsWith("/admin/daily-offers") ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSectionClick("menu", "daily-offers", "/admin/daily-offers");
                  }}
                >
                  Daily Offers
                </Nav.Link>
                <Nav.Link
                  href="#"
                  className={location.pathname.startsWith("/admin/food-categories") ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSectionClick("menu", "food-categories", "/admin/food-categories");
                  }}
                >
                  Food Categories
                </Nav.Link>
                <Nav.Link
                  href="#"
                  className={location.pathname.startsWith("/admin/image-uploads") ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSectionClick("menu", "image-uploads", "/admin/image-uploads");
                  }}
                >
                  Image Uploads
                </Nav.Link>
              </div>
            </Collapse>

            <button
              type="button"
              className={`menu-toggle btn btn-link text-start ${
                location.pathname.startsWith("/admin/events") ? "active" : ""
              }`}
              onClick={() => handleSectionClick("events")}
            >
              <FaCalendarAlt size={22} color={location.pathname.startsWith("/admin/events") ? "white" : "black"} />
              <span style={{ marginLeft: '3px' }}>Events {eventsOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
            </button>

            <Collapse in={eventsOpen}>
              <div className="menu-sub-items ms-3">
                <Nav.Link
                  href="#"
                  className={location.pathname === "/admin/events/new" ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSectionClick("events", "create-event", "/admin/events/new");
                  }}
                >
                  Create Event
                </Nav.Link>
                <Nav.Link
                  href="#"
                  className={location.pathname === "/admin/events" ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSectionClick("events", "manage-events", "/admin/events");
                  }}
                >
                  Manage Events
                </Nav.Link>
              </div>
            </Collapse>

            <button
              type="button"
              className={`menu-toggle btn btn-link text-start ${
                location.pathname === "/admin/analytics" ? "active" : ""
              }`}
              onClick={() => handleSectionClick("analytics", null, "/admin/analytics")}
            >
              <FaChartLine size={22} color={location.pathname === "/admin/analytics" ? "white" : "black"} />
              <span style={{ marginLeft: '3px' }}>Review Analytics</span>
            </button>

            <button
              type="button"
              className={`menu-toggle btn btn-link text-start ${
                location.pathname === "/admin/user-info" ? "active" : ""
              }`}
              onClick={() => handleSectionClick("user-info", null, "/admin/user-info")}
            >
              <FaUsers size={22} color={location.pathname === "/admin/user-info" ? "white" : "black"} />
              <span style={{ marginLeft: '3px' }}>User Info</span>
            </button>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default MobileHeader;