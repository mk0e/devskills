import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    "index",
    {
      type: "category",
      label: "Getting Started",
      collapsed: false,
      items: [
        "getting-started/quick-start",
        "getting-started/what-is-skillkit",
        "getting-started/installation",
      ],
    },
    {
      type: "category",
      label: "Guide",
      items: [
        "guide/skill-repositories",
        "guide/creating-your-first-skill",
        "guide/using-scripts",
        "guide/using-references",
        "guide/remote-repositories",
      ],
    },
    {
      type: "category",
      label: "Integrations",
      items: [
        "integrations/overview",
        "integrations/github-copilot",
        "integrations/custom-agents",
      ],
    },
    {
      type: "category",
      label: "Reference",
      items: [
        "reference/cli",
        "reference/skill-format",
        "reference/mcp-tools",
      ],
    },
  ],
};

export default sidebars;
