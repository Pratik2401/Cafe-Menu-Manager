import { useState } from "react";
import { Offcanvas, Nav, Button, Navbar, Collapse,Image } from "react-bootstrap";
// import { MenuButtonWide } from "react-bootstrap-icons";
import "../../styles/SideBar.css";
import Snap2EatLogo from "../../assets/images/Snap2Eat.png";
import { getImageUrl } from '../../utils/imageUrl';
import { FaChevronDown, FaChevronUp, FaCog, FaCalendarAlt, FaChartLine, FaUsers } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";

export default function Sidebar({ active, setActive }) {
  const [show, setShow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);

  // const toggleSidebar = () => setShow(!show);
  const closeSidebar = () => setShow(false);

  const handleSectionClick = (section, subSection = null) => {
    
    if (section === "menu" && subSection === null) {
      // Just toggle menu submenu, don't change active
      setMenuOpen(!menuOpen);
      setEventsOpen(false);
    } else if (section === "events" && subSection === null) {
      // Just toggle events submenu, don't change active
      setEventsOpen(!eventsOpen);
      setMenuOpen(false);
    } else {
      // For submenu items or other sections, set active
      setActive(subSection || section);
      closeSidebar();
    }
  };

  const SidebarContent = (
    <>
    
  <Image src={getImageUrl(Snap2EatLogo)} className="BrandLogo"></Image>


 <button
          type="button"
          className={`menu-toggle btn btn-link text-start ${
            active === "admin-controls" ? "active" : ""
          }`}
          onClick={() => handleSectionClick("admin-controls")}
        >
          <MdManageAccounts size={22} color={active === "admin-controls" ? "white" : "black"} />
          
          <span style={{ marginLeft: '3px' }}>Admin Controls</span>
        </button>

        <button
          type="button"
          className={`menu-toggle btn btn-link text-start ${
            active === "management-controls" ? "active" : ""
          }`}
          onClick={() => handleSectionClick("management-controls")}
        >
          <FaCog size={22} color={active === "management-controls" ? "white" : "black"} />
          <span style={{ marginLeft: '3px' }}>Management Controls</span>
        </button>

        
      <Nav className="flex-column">
        <button
          type="button"
          className={`menu-toggle btn btn-link text-start ${
            active === "menu" || active === "category" || active === "daily-offers" || active === "image-uploads" ? "active" : ""
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
              fill={active === "menu" || active === "category" || active === "daily-offers" || active === "image-uploads" ? "white" : "black"}
            />
          </svg>
          <div className="SideBarContainer">
            
          <span style={{ marginLeft: '3px' }}>Menu </span>
          <span>{menuOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
          </div>
        </button>

        <Collapse in={menuOpen}>
          <div className="menu-sub-items ms-3">
            <Nav.Link
              href="#"
              className={active === "category" ? "active" : "not-active"}
              onClick={(e) => {
                e.preventDefault();
                handleSectionClick("menu", "category");
              }}
            >
              Category
            </Nav.Link>
            <Nav.Link
              href="#"
              className={active === "daily-offers" ? "active" : "not-active"}
              onClick={(e) => {
                e.preventDefault();
                handleSectionClick("menu", "daily-offers");
              }}
            >
              Daily Offers
            </Nav.Link>
            <Nav.Link
              href="#"
              className={active === "image-uploads" ? "active" : "not-active"}
              onClick={(e) => {
                e.preventDefault();
                handleSectionClick("menu", "image-uploads");
              }}
            >
              Image Uploads
            </Nav.Link>
          </div>
        </Collapse>



       

        <button
          type="button"
          className={`menu-toggle btn btn-link text-start ${
            active === "create-event" || active === "manage-events" || active === "event-registrations" ? "active" : ""
          }`}
          onClick={() => handleSectionClick("events")}
        >
             <FaCalendarAlt size={22} color={active === "create-event" || active === "manage-events" || active === "event-registrations" ? "white" : "black"} />
         
          <div className="SideBarContainer">
          <span style={{ marginLeft: '3px' }}>Events </span>
          <span>{eventsOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
          </div>
          
        </button>

        <Collapse in={eventsOpen}>
          <div className="menu-sub-items ms-3">
            <Nav.Link
              href="#"
              className={active === "create-event" ? "active" : "not-active"}
              onClick={(e) => {
                e.preventDefault();
                handleSectionClick("events", "create-event");
              }}
            >
              Create Event
            </Nav.Link>
            <Nav.Link
              href="#"
              className={active === "manage-events" ? "active" : "not-active"}
              onClick={(e) => {
                e.preventDefault();
                handleSectionClick("events", "manage-events");
              }}
            >
              Manage Events
            </Nav.Link>

          </div>
        </Collapse>

        <button
          type="button"
          className={`menu-toggle btn btn-link text-start ${
            active === "review-analytics" ? "active" : ""
          }`}
          onClick={() => handleSectionClick("review-analytics")}
        >
          <FaChartLine size={22} color={active === "review-analytics" ? "white" : "black"} />
          <span style={{ marginLeft: '3px' }}>Review Analytics</span>
        </button>

        <button
          type="button"
          className={`menu-toggle btn btn-link text-start ${
            active === "user-info" ? "active" : ""
          }`}
          onClick={() => handleSectionClick("user-info")}
        >
          <FaUsers size={22} color={active === "user-info" ? "white" : "black"} />
          <span style={{ marginLeft: '3px' }}>User Info</span>
        </button>

       
      </Nav>
    </>
  );

  return (
    <div className="SideBar-Container sidebar vh-100">
      {SidebarContent}
    </div>
  );
}