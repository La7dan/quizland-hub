
import React, { useEffect } from 'react';

// This component will update the page title and favicon when mounted
const TabIcon: React.FC = () => {
  useEffect(() => {
    // Set page title
    document.title = "Alshaqab Quiz System";
    
    // Set favicon
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = "/jumping-horse-favicon.svg";
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = "/jumping-horse-favicon.svg";
      document.head.appendChild(newLink);
    }
    
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  // This component doesn't render anything
  return null;
};

export default TabIcon;
