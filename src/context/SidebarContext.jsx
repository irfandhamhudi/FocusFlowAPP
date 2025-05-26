// context/SidebarContext.js
import { createContext, useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const isDesktop = useMediaQuery({ minWidth: 1025 });

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isDesktop) {
      setIsOpen(true);
    } else if (isTablet) {
      setIsOpen(true);
    } else if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile, isTablet, isDesktop]);

  return (
    <SidebarContext.Provider
      value={{ isOpen, toggleSidebar, isMobile, isTablet, isDesktop }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarContext;
