import "./header.css";
import { useEffect } from "react";

export const GoogleTranslate = () => {
  useEffect(() => {
    // Check if Google Translate script already exists
    if (!document.getElementById("google_translate_script")) {
      // Define the Google Translate initialization function
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en", // Default page language
            // includedLanguages: "en,es,fr,de,hi,zh-CN,ja,ru,it,pt,kn", // Specify languages
             layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL, // Horizontal layout
            autoDisplay: false, // Automatically display the widget
          },
          "google_translate_element" // ID of the container
        );
      };

      // Dynamically load the Google Translate script
      const script = document.createElement("script");
      script.id = "google_translate_script"; // Set ID to prevent multiple inclusions
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      const observer = new MutationObserver(() => {
        const targetDiv = document.querySelector(".skiptranslate.goog-te-gadget");
        if (targetDiv) {
            targetDiv.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent = ""; // Remove dynamically added text content
                }
            });
        }
    });

    // Observe changes in the body (or a more specific parent container)
    const observerTarget = document.body; // Adjust this if needed
    if (observerTarget) {
        observer.observe(observerTarget, {
            childList: true, // Watches for added/removed nodes
            subtree: true,  // Watches all child nodes and sub-nodes
        });
    }

    // Cleanup observer on unmount
    return () => observer.disconnect();

      
      }
  }, []);

  return <div id="google_translate_element" />;
};
