# Using Scripts

Scripts are executable files that skills can include for deterministic, reusable operations.

## When to Use Scripts

Use scripts when:
- The same code gets rewritten repeatedly
- Deterministic reliability is needed
- Complex logic benefits from tested, versioned code
- Operations require specific libraries

Don't use scripts when:
- The task is simple enough for the agent to handle directly
- Flexibility is more important than consistency
- The operation varies significantly each time

## Adding Scripts

Create a `scripts/` folder in your skill:

```
my-skill/
├── SKILL.md
└── scripts/
    ├── validate.py
    ├── format.sh
    └── transform.ts
```

Scripts can be any executable format: Python, Bash, TypeScript, etc.

## Referencing Scripts in SKILL.md

Tell the agent when and how to use scripts:

```markdown
---
name: data-validator
description: Validate data files against schemas.
---

# Data Validator

## Validation

Use the validation script for checking data:

1. Fetch the script: `skillkit_get_script("data-validator", "validate.py")`
2. Run it with the data file as argument
3. Review the output for errors

The script validates against the schema in `references/schema.json`.
```

## How Scripts Are Loaded

Scripts use progressive disclosure:

1. **SKILL.md loaded** - Agent sees script is available
2. **Agent requests script** - Calls `skillkit_get_script(skill, filename)`
3. **Script content returned** - Agent can execute or adapt it

Scripts are fetched on-demand, not loaded upfront.

## Example: PDF Rotation Script

```
pdf-editor/
├── SKILL.md
└── scripts/
    └── rotate.py
```

**SKILL.md:**
```markdown
---
name: pdf-editor
description: Edit PDF files - rotate, merge, split, extract pages.
---

# PDF Editor

## Rotating Pages

To rotate PDF pages:

1. Fetch the rotation script: `skillkit_get_script("pdf-editor", "rotate.py")`
2. Run: `python rotate.py <input.pdf> <degrees> <output.pdf>`

Degrees: 90, 180, or 270 (clockwise)
```

**scripts/rotate.py:**
```python
#!/usr/bin/env python3
import sys
from pypdf import PdfReader, PdfWriter

def rotate_pdf(input_path, degrees, output_path):
    reader = PdfReader(input_path)
    writer = PdfWriter()

    for page in reader.pages:
        page.rotate(int(degrees))
        writer.add_page(page)

    with open(output_path, "wb") as f:
        writer.write(f)

if __name__ == "__main__":
    rotate_pdf(sys.argv[1], sys.argv[2], sys.argv[3])
```

## Best Practices

### Keep scripts focused
One script, one task. Easier to test and maintain.

### Include dependencies
Document required packages in SKILL.md or a requirements file.

### Handle errors gracefully
Return meaningful error messages the agent can interpret.

### Make scripts self-contained
Avoid dependencies on external state or configuration.

### Use standard I/O
Accept input as arguments or stdin, output to stdout or files.

## Script vs. Inline Code

| Aspect | Script | Inline Code |
|--------|--------|-------------|
| Consistency | Same code every time | Agent may vary approach |
| Testing | Can be tested independently | Tested per-conversation |
| Updates | Change once, applies everywhere | Must update skill instructions |
| Flexibility | Fixed behavior | Adapts to context |
| Token usage | Fetched on demand | Generated each time |

Choose scripts for critical operations where consistency matters.
