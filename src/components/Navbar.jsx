import PropTypes from "prop-types";
import { Search, Bell, Menu } from "lucide-react";

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  const userInitial = "IR";

  return (
    <div className="p-2 bg-white border-b border-borderPrimary fixed z-10 w-full">
      <div className="mx-auto flex items-center justify-between px-4 py-2 max-w-6xl">
        {/* Mobile menu button - only shown on small screens */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-gray-100 mr-2"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        {/* Search Box - adjusted for mobile */}
        <div
          className={`relative flex-1 max-w-md ${
            isSidebarOpen ? "mx-4 md:mx-20" : "-mx-0 md:-mx-60"
          }`}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="text-sm block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-font2 focus:border-transparent"
            placeholder="Search..."
          />
        </div>

        {/* Right side icons - adjusted for mobile */}
        <div className="flex items-center space-x-2 md:space-x-4 ml-2 md:ml-0">
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {userInitial}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Navbar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Navbar;
