import React from "react";
import GiscusWidget from "@giscus/react";
import { useTheme } from "@/context/theme";
import { useI18next } from "gatsby-plugin-react-i18next";

const Giscus = () => {
  const { theme } = useTheme();
  const { language } = useI18next();

  return (
    <GiscusWidget
      repo="albanpetit/albanpetit.com"
      repoId="MDEwOlJlcG9zaXRvcnkzOTY5MDM1OTc="
      category="Website comments"
      categoryId="DIC_kwDOF6hErc4CeFTI"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme={theme === "dark" ? "dark" : "light"}
      lang={language}
      loading="lazy"
    />
  );
};

export default Giscus;
