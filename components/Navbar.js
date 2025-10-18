'use client';

import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const t = useTranslations("Navbar");
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const langMenuRef = useRef(null);

  // --- Aktuális nyelv detektálása az URL-ből ---
  const currentLocale = pathname.split("/")[1] || "hu";

  const flags = {
    hu: "🇭🇺",
    en: "🇬🇧",
    de: "🇩🇪",
  };

  const localeLabels = {
    hu: "HU",
    en: "EN",
    de: "DE",
  };

  // Görgetés figyelése
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Nyelvválasztó bezárása ha máshova kattintanak
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { label: t("home"), href: "#hero" },
    { label: t("venue"), href: "#venue" },
    { label: t("rsvp"), href: "#rsvp" },
    { label: t("info"), href: "#info" },
    { label: t("dresscode"), href: "#dresscode" },
    { label: t("gallery"), href: "#gallery" },
    { label: t("contact"), href: "#contact" },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const changeLocale = (locale) => {
    const currentPath = pathname.split("/").slice(2).join("/") || "";
    router.push(`/${locale}/${currentPath}`);
    setShowLangMenu(false);
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isOpen
          ? "bg-card/95 backdrop-blur-sm shadow-elegant"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="font-heading text-2xl font-bold text-foreground">
            V & T
          </div>

          {/* Desktop Menü */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="font-body text-sm text-foreground hover:bg-primary/20 hover:text-foreground transition-colors px-4 py-2 rounded-md"
              >
                {item.label}
              </button>
            ))}

            {/* Zászlós Nyelvválasztó */}
            <div className="relative ml-4 border-l border-border pl-4" ref={langMenuRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/20 transition-colors"
              >
                <span className="text-lg">{flags[currentLocale]}</span>
                <span className="font-semibold">{localeLabels[currentLocale]}</span>
                <ChevronDown size={16} className={`transition-transform ${showLangMenu ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-36 bg-card shadow-lg rounded-lg border border-border overflow-hidden z-50"
                  >
                    <button
                      onClick={() => changeLocale("hu")}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors"
                    >
                      <span>{flags.hu}</span> Magyar
                    </button>
                    <button
                      onClick={() => changeLocale("en")}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors"
                    >
                      <span>{flags.en}</span> English
                    </button>
                    <button
                      onClick={() => changeLocale("de")}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors"
                    >
                      <span>{flags.de}</span> Deutsch
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobil Menü Gomb */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-primary/20"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobil Menü */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
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

                {/* Mobil zászlós nyelvváltó */}
                <div className="pt-4 border-t border-border mt-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">{t("language")}</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => changeLocale("hu")}
                      className={`text-lg hover:scale-110 transition-transform ${
                        currentLocale === "hu" ? "opacity-100" : "opacity-70"
                      }`}
                    >
                      {flags.hu}
                    </button>
                    <button
                      onClick={() => changeLocale("en")}
                      className={`text-lg hover:scale-110 transition-transform ${
                        currentLocale === "en" ? "opacity-100" : "opacity-70"
                      }`}
                    >
                      {flags.en}
                    </button>
                    <button
                      onClick={() => changeLocale("de")}
                      className={`text-lg hover:scale-110 transition-transform ${
                        currentLocale === "de" ? "opacity-100" : "opacity-70"
                      }`}
                    >
                      {flags.de}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
