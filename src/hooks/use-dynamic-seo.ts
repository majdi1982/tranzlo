"use client";

import * as React from "react";

interface SEOConfig {
  searchEngines?: string[];
  seoKeywords?: string;
  isPublic?: boolean;
}

export function useDynamicSEO(config: SEOConfig) {
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const { searchEngines = [], seoKeywords = "", isPublic = true } = config;

    // Helper to add or update meta tag
    const setMetaTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (element) {
        element.setAttribute("content", content);
      } else {
        element = document.createElement("meta");
        element.setAttribute("name", name);
        element.setAttribute("content", content);
        document.head.appendChild(element);
      }
    };

    // Helper to remove meta tag
    const removeMetaTag = (name: string) => {
      const element = document.querySelector(`meta[name="${name}"]`);
      if (element) {
        element.remove();
      }
    };

    // 1. If profile is private, tell ALL bots not to index it
    if (!isPublic) {
      setMetaTag("robots", "noindex, nofollow");
      removeMetaTag("googlebot");
      removeMetaTag("bingbot");
      removeMetaTag("yandex");
      removeMetaTag("keywords");
      return;
    }

    // 2. Otherwise, remove generic robots noindex and set search-engine specific directives
    removeMetaTag("robots");

    // Googlebot Directive
    if (searchEngines.includes("google")) {
      setMetaTag("googlebot", "index, follow, max-image-preview:large");
    } else {
      setMetaTag("googlebot", "noindex, nofollow");
    }

    // Bingbot Directive
    if (searchEngines.includes("bing")) {
      setMetaTag("bingbot", "index, follow");
    } else {
      setMetaTag("bingbot", "noindex, nofollow");
    }

    // Yandex Directive
    if (searchEngines.includes("yandex")) {
      setMetaTag("yandex", "index, follow");
    } else {
      setMetaTag("yandex", "noindex, nofollow");
    }

    // Custom SEO Keywords
    if (seoKeywords.trim()) {
      setMetaTag("keywords", seoKeywords);
    } else {
      removeMetaTag("keywords");
    }

    // Cleanup tags on unmount
    return () => {
      removeMetaTag("googlebot");
      removeMetaTag("bingbot");
      removeMetaTag("yandex");
      removeMetaTag("keywords");
    };
  }, [config.searchEngines, config.seoKeywords, config.isPublic]);
}
