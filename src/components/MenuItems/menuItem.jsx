import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";

const MenuItem = ({ name, icon, path, isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = location.pathname === path;

  const handleClick = () => navigate(path);

  return (
    <li
      onClick={handleClick}
      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all mx-2 ${
        isActive
          ? "bg-font1 text-white"
          : "text-font2 hover:border hover:border-font1 hover:text-black"
      }`}
    >
      {icon}
      {isOpen && <span className="whitespace-nowrap">{name}</span>}
    </li>
  );
};

MenuItem.propTypes = {
  name: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  path: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default MenuItem;
