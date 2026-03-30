import { useState } from "react";

type Category = "All" | "Languages" | "Frameworks" | "Infrastructure";

interface Tag {
  label: string;
  category: Exclude<Category, "All">;
}

const ALL_TAGS: Tag[] = [
  { label: "Python",       category: "Languages" },
  { label: "TypeScript",   category: "Languages" },
  { label: "JavaScript",   category: "Languages" },
  { label: "Rust",         category: "Languages" },
  { label: "SQL",          category: "Languages" },
  { label: "PHP",          category: "Languages" },
  { label: "Django",       category: "Frameworks" },
  { label: "React",        category: "Frameworks" },
  { label: "FastAPI",      category: "Frameworks" },
  { label: "Tailwind CSS", category: "Frameworks" },
  { label: "Flutter",      category: "Frameworks" },
  { label: "Docker",       category: "Infrastructure" },
  { label: "Coolify",      category: "Infrastructure" },
  { label: "Linux",        category: "Infrastructure" },
  { label: "MinIO S3",     category: "Infrastructure" },
  { label: "Self-hosted",  category: "Infrastructure" },
];

const CATEGORIES: Category[] = ["All", "Languages", "Frameworks", "Infrastructure"];

const styles = `
  .abt-tags-root { margin-top: 1.75rem; }

  /* ── Filter pills ── */
  .abt-filter-row {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }
  .abt-filter-btn {
    font-family: 'DM Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    padding: 0.28rem 0.8rem;
    border-radius: 999px;
    border: 1px solid var(--card-border);
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .abt-filter-btn:hover:not(.abt-filter-active) {
    border-color: rgba(255,84,255,0.35);
    color: var(--stroke-color);
  }
  .abt-filter-active {
    border-color: var(--brand) !important;
    color: var(--brand) !important;
    background: var(--tag-bg) !important;
  }

  /* ── Chips ── */
  .abt-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .abt-chip {
    font-family: 'DM Mono', monospace;
    font-size: 0.66rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.35rem 0.85rem;
    border-radius: 6px;
    border: 1px solid rgba(255,84,255,0.22);
    background: var(--tag-bg);
    color: var(--brand);
    cursor: pointer;
    user-select: none;
    /* stagger set inline */
    animation: abt-chip-in 0.28s both ease-out;
    transition: transform 0.15s, box-shadow 0.15s, background 0.15s, color 0.15s, border-color 0.15s;
  }
  .abt-chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 18px rgba(255,84,255,0.22);
    border-color: var(--brand);
  }
  .abt-chip-on {
    background: var(--brand);
    color: #fff;
    border-color: var(--brand);
    box-shadow: 0 4px 18px rgba(255,84,255,0.38);
  }
  .abt-chip-on:hover {
    transform: translateY(-2px);
    opacity: 0.88;
  }

  @keyframes abt-chip-in {
    from { opacity: 0; transform: translateY(7px) scale(0.94); }
    to   { opacity: 1; transform: translateY(0)  scale(1);    }
  }

  /* ── Hint line ── */
  .abt-hint {
    font-family: 'DM Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin-top: 0.75rem;
    opacity: 0.65;
    animation: abt-chip-in 0.2s both ease-out;
  }
`;

export default function AboutTags() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [animKey, setAnimKey] = useState(0);

  const visible =
    activeCategory === "All"
      ? ALL_TAGS
      : ALL_TAGS.filter((t) => t.category === activeCategory);

  function switchCategory(cat: Category) {
    if (cat === activeCategory) return;
    setActiveCategory(cat);
    setAnimKey((k) => k + 1);
  }

  function toggleChip(label: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <div className="abt-tags-root">
      <style>{styles}</style>

      {/* Category filter */}
      <div className="abt-filter-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`abt-filter-btn${activeCategory === cat ? " abt-filter-active" : ""}`}
            onClick={() => switchCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Chips - key forces re-mount -> re-runs stagger animation on filter change */}
      <div className="abt-chips" key={animKey}>
        {visible.map((tag, i) => (
          <span
            key={tag.label}
            className={`abt-chip${selected.has(tag.label) ? " abt-chip-on" : ""}`}
            style={{ animationDelay: `${i * 38}ms` }}
            onClick={() => toggleChip(tag.label)}
          >
            {tag.label}
          </span>
        ))}
      </div>

      {selected.size > 0 && (
        <p className="abt-hint" key={selected.size}>
          {selected.size} selected - click again to deselect
        </p>
      )}
    </div>
  );
}
