// components/Navbar.js
'use client';

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // A te oldaladhoz igazított menüpontok
  const navItems = [
    { label: "Kezdőlap", href: "#hero" },
    { label: "Helyszín", href: "#venue" },
    { label: "Visszajelzés", href: "#rsvp" },
    { label: "Információk", href: "#info" },
    { label: "Dress Code", href: "#dresscode" },
    { label: "Galéria", href: "#gallery" },
    { label: "Üzenet", href: "#contact" },
  ];

  const scrollToSection = (href) => {
  const element = document.querySelector(href);
  if (element) {
    const yOffset = -80; // navbar magassága
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
  setIsOpen(false);
};


  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || isOpen ? 'bg-card/95 backdrop-blur-sm shadow-elegant' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center justify-between h-20">
          <div className="font-heading text-2xl font-bold text-foreground">
            V & T
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="font-body text-sm text-foreground hover:bg-primary/20 hover:text-foreground transition-colors px-4 py-2 rounded-md"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-primary/20"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 space-y-2">
                {navItems.map((item) => (
  <a
    key={item.label}
    href={item.href}
    onClick={() => setIsOpen(false)}
    className="block w-full text-left font-body text-base text-foreground hover:bg-primary/20 hover:text-foreground transition-colors px-4 py-3 rounded-md"
  >
    {item.label}
  </a>
))}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};