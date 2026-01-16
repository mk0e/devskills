import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "SkillKit",
  tagline: "Share AI skills across your team and tools",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  markdown: {
    mermaid: true,
  },

  url: "https://skillkit.dev",
  baseUrl: "/",

  organizationName: "anthropics",
  projectName: "skillkit-mcp",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  themes: [
    "@docusaurus/theme-mermaid",
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: "/",
        highlightSearchTermsOnTargetPage: true,
        searchBarShortcutHint: true,
      },
    ],
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          path: "../docs",
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          // Uncomment to add "Edit this page" links pointing to GitHub
          // editUrl: "https://github.com/anthropics/skillkit-mcp/edit/main/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/skillkit-social-card.png",
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "SkillKit",
      logo: {
        alt: "SkillKit Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/anthropics/skillkit-mcp",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Quick Start",
              to: "/getting-started/quick-start",
            },
            {
              label: "Creating Skills",
              to: "/guide/creating-your-first-skill",
            },
          ],
        },
        {
          title: "Resources",
          items: [
            {
              label: "Agent Skills",
              href: "https://agentskills.io",
            },
            {
              label: "MCP Protocol",
              href: "https://modelcontextprotocol.io",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/anthropics/skillkit-mcp",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Anthropic. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "json", "yaml", "python", "typescript"],
    },
    mermaid: {
      theme: { light: "neutral", dark: "dark" },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
