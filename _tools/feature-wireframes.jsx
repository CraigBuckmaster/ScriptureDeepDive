import { useState } from "react";

const COLORS = {
  bg: "#1a1710",
  bgElevated: "#252015",
  bgPanel: "#2a2518",
  gold: "#bfa050",
  goldDim: "rgba(191,160,80,0.12)",
  goldBorder: "rgba(191,160,80,0.2)",
  text: "#e8e0d0",
  textDim: "#c0b8a0",
  textMuted: "#908878",
  white: "#f5f0e8",
  accent: {
    shadow: "#8B7355",
    type: "#B8860B",
    prophecy: "#DAA520",
    fulfillment: "#C0C0C0",
    consummation: "#E8E0D0",
    premise: "#6B8E6B",
    ground: "#7B9BAA",
    contrast: "#AA7B7B",
    inference: "#9B8BB5",
    conclusion: "#B8A060",
    ethical: "#CD5C5C",
    contradiction: "#DEB887",
    theological: "#6B8FAA",
    historical: "#8B7D6B",
    textual: "#7B8B7B",
  },
};

const statusBarStyle = {
  height: 44,
  background: COLORS.bg,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexDirection: "row",
  padding: "0 20px",
  fontSize: 12,
  color: COLORS.textMuted,
  fontFamily: "'SF Pro Text', system-ui",
};

function StatusBar() {
  return (
    <div style={statusBarStyle}>
      <span>9:41</span>
      <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <span>⚡</span>
      </span>
    </div>
  );
}

function PhoneFrame({ children, title }) {
  return (
    <div
      style={{
        width: 375,
        height: 812,
        background: COLORS.bg,
        borderRadius: 40,
        overflow: "hidden",
        border: `2px solid ${COLORS.goldBorder}`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <StatusBar />
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
        }}
      >
        {children}
      </div>
      <TabBar />
    </div>
  );
}

function TabBar() {
  const tabs = [
    { icon: "🏠", label: "Home" },
    { icon: "📖", label: "Read" },
    { icon: "🔍", label: "Explore", active: true },
    { icon: "🔎", label: "Search" },
    { icon: "⋯", label: "More" },
  ];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 0 28px",
        background: COLORS.bgElevated,
        borderTop: `1px solid ${COLORS.goldBorder}`,
      }}
    >
      {tabs.map((t) => (
        <div
          key={t.label}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          <span
            style={{
              fontSize: 10,
              color: t.active ? COLORS.gold : COLORS.textMuted,
              fontFamily: "'Source Sans 3', system-ui",
            }}
          >
            {t.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function Badge({ text, color }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 20,
        background: color + "20",
        color: color,
        fontFamily: "'Source Sans 3', system-ui",
        fontWeight: 600,
        letterSpacing: 0.3,
        textTransform: "uppercase",
      }}
    >
      {text}
    </span>
  );
}

function ScholarPill({ name }) {
  return (
    <span
      style={{
        fontSize: 11,
        padding: "3px 10px",
        borderRadius: 20,
        border: `1px solid ${COLORS.goldBorder}`,
        color: COLORS.gold,
        fontFamily: "'Source Sans 3', system-ui",
        cursor: "pointer",
      }}
    >
      {name}
    </span>
  );
}

function SectionHeader({ title }) {
  return (
    <div
      style={{
        color: COLORS.gold,
        fontSize: 13,
        fontFamily: "'Source Sans 3', system-ui",
        fontWeight: 600,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        marginTop: 20,
        marginBottom: 8,
        paddingBottom: 6,
        borderBottom: `1px solid ${COLORS.goldBorder}`,
      }}
    >
      {title}
    </div>
  );
}

// ─── FEATURE 1: Prophecy Browse ───────────────────────────────────

function ProphecyBrowseScreen() {
  const [filter, setFilter] = useState("all");
  const filters = [
    "all",
    "sacrifice",
    "kingship",
    "priesthood",
    "exodus",
    "covenant",
  ];
  const chains = [
    {
      title: "The Lamb of God",
      cat: "sacrifice",
      type: "typology",
      count: 5,
      first: "Gen 22:7",
      last: "Rev 5:6",
    },
    {
      title: "The Messianic King",
      cat: "kingship",
      type: "prophecy",
      count: 8,
      first: "Gen 49:10",
      last: "Rev 19:16",
    },
    {
      title: "Melchizedek's Priesthood",
      cat: "priesthood",
      type: "typology",
      count: 4,
      first: "Gen 14:18",
      last: "Heb 7:17",
    },
    {
      title: "The New Covenant",
      cat: "covenant",
      type: "prophecy",
      count: 6,
      first: "Jer 31:31",
      last: "Heb 8:13",
    },
    {
      title: "The Suffering Servant",
      cat: "sacrifice",
      type: "dual",
      count: 7,
      first: "Isa 42:1",
      last: "1 Pet 2:24",
    },
    {
      title: "Prophet Like Moses",
      cat: "kingship",
      type: "prophecy",
      count: 4,
      first: "Deut 18:15",
      last: "Acts 3:22",
    },
    {
      title: "The Exodus Pattern",
      cat: "exodus",
      type: "typology",
      count: 5,
      first: "Exod 12:1",
      last: "1 Cor 5:7",
    },
  ];
  const filtered =
    filter === "all" ? chains : chains.filter((c) => c.cat === filter);

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          color: COLORS.gold,
          fontSize: 22,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        Prophecy & Typology
      </div>
      <div
        style={{
          color: COLORS.textMuted,
          fontSize: 12,
          fontFamily: "'Source Sans 3', system-ui",
          marginBottom: 14,
        }}
      >
        Trace fulfillment across the canon
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              border: `1px solid ${filter === f ? COLORS.gold : COLORS.goldBorder}`,
              background: filter === f ? COLORS.gold + "20" : "transparent",
              color: filter === f ? COLORS.gold : COLORS.textMuted,
              fontSize: 11,
              fontFamily: "'Source Sans 3', system-ui",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.map((c, i) => (
        <div
          key={i}
          style={{
            background: COLORS.bgElevated,
            border: `1px solid ${COLORS.goldBorder}`,
            borderRadius: 10,
            padding: 14,
            marginBottom: 8,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 6,
            }}
          >
            <span
              style={{
                color: COLORS.text,
                fontSize: 14,
                fontFamily: "'Source Sans 3', system-ui",
                fontWeight: 600,
              }}
            >
              {c.title}
            </span>
            <Badge
              text={c.type}
              color={
                c.type === "typology"
                  ? COLORS.accent.type
                  : c.type === "prophecy"
                    ? COLORS.accent.prophecy
                    : COLORS.gold
              }
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: COLORS.textMuted,
                fontSize: 11,
                fontFamily: "'Source Sans 3', system-ui",
              }}
            >
              {c.first} → {c.last}
            </span>
            <span
              style={{
                color: COLORS.textDim,
                fontSize: 11,
                fontFamily: "'Source Sans 3', system-ui",
              }}
            >
              {c.count} links
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FEATURE 1: Prophecy Detail ───────────────────────────────────

function ProphecyDetailScreen() {
  const links = [
    {
      role: "shadow",
      ref: "Gen 22:7-8",
      label: "Abraham: 'God will provide the lamb'",
      testament: "ot",
    },
    {
      role: "type",
      ref: "Exod 12:3-7",
      label: "Passover lamb — unblemished, blood on doorposts",
      testament: "ot",
    },
    {
      role: "type",
      ref: "Lev 16:15-22",
      label: "Day of Atonement — scapegoat bears sin away",
      testament: "ot",
    },
    {
      role: "prophecy",
      ref: "Isa 53:7",
      label: "Led like a lamb to the slaughter",
      testament: "ot",
    },
    {
      role: "fulfillment",
      ref: "John 1:29",
      label: "Behold, the Lamb of God who takes away the sin of the world",
      testament: "nt",
    },
    {
      role: "fulfillment",
      ref: "1 Cor 5:7",
      label: "Christ, our Passover lamb, has been sacrificed",
      testament: "nt",
    },
    {
      role: "consummation",
      ref: "Rev 5:6",
      label: "The Lamb, standing as though slain, at the center of the throne",
      testament: "nt",
    },
  ];

  const roleColors = {
    shadow: COLORS.accent.shadow,
    type: COLORS.accent.type,
    prophecy: COLORS.accent.prophecy,
    fulfillment: COLORS.accent.fulfillment,
    consummation: COLORS.accent.consummation,
  };

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          color: COLORS.textMuted,
          fontSize: 11,
          fontFamily: "'Source Sans 3', system-ui",
          marginBottom: 4,
          cursor: "pointer",
        }}
      >
        ← Prophecy & Typology
      </div>
      <div
        style={{
          color: COLORS.gold,
          fontSize: 20,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        The Lamb of God
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <Badge text="sacrifice" color={COLORS.accent.type} />
        <Badge text="typology" color={COLORS.gold} />
      </div>
      <div
        style={{
          color: COLORS.textDim,
          fontSize: 13,
          fontFamily: "'Source Sans 3', system-ui",
          lineHeight: 1.5,
          marginBottom: 20,
          padding: "10px 12px",
          background: COLORS.bgElevated,
          borderRadius: 8,
          borderLeft: `3px solid ${COLORS.gold}`,
        }}
      >
        From Passover lamb to the Lamb who takes away the sin of the world —
        tracing God's provision of a substitute across the entire canon.
      </div>

      {/* Timeline rail */}
      <div style={{ position: "relative", paddingLeft: 28 }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: 10,
            top: 8,
            bottom: 8,
            width: 2,
            background: `linear-gradient(to bottom, ${COLORS.accent.shadow}, ${COLORS.accent.type}, ${COLORS.accent.prophecy}, ${COLORS.accent.fulfillment}, ${COLORS.accent.consummation})`,
            borderRadius: 1,
          }}
        />

        {links.map((l, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              marginBottom: 12,
              cursor: "pointer",
            }}
          >
            {/* Dot */}
            <div
              style={{
                position: "absolute",
                left: -22,
                top: 6,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: roleColors[l.role],
                border: `2px solid ${COLORS.bg}`,
                boxShadow: `0 0 6px ${roleColors[l.role]}50`,
              }}
            />
            <div
              style={{
                background: COLORS.bgElevated,
                border: `1px solid ${COLORS.goldBorder}`,
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    color: roleColors[l.role],
                    fontSize: 10,
                    fontFamily: "'Source Sans 3', system-ui",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {l.role}
                </span>
                <span
                  style={{
                    color: l.testament === "ot" ? COLORS.gold : COLORS.accent.fulfillment,
                    fontSize: 12,
                    fontFamily: "'Source Sans 3', system-ui",
                    fontWeight: 600,
                  }}
                >
                  {l.ref}
                </span>
              </div>
              <div
                style={{
                  color: COLORS.textDim,
                  fontSize: 12,
                  fontFamily: "'Source Sans 3', system-ui",
                  lineHeight: 1.4,
                }}
              >
                {l.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FEATURE 2: Enhanced Notes ────────────────────────────────────

function EnhancedNotesScreen() {
  const [view, setView] = useState("collections");
  const collections = [
    { name: "Romans Deep Dive", color: "#bfa050", notes: 14, desc: "Justification theme" },
    { name: "Covenant Theology", color: "#6B8FAA", notes: 8, desc: "Cross-testament study" },
    { name: "Sermon Prep — Hebrews", color: "#CD5C5C", notes: 6, desc: "Sunday series" },
  ];
  const tags = [
    { name: "christology", count: 12 },
    { name: "question", count: 8 },
    { name: "essay-draft", count: 5 },
    { name: "typology", count: 7 },
    { name: "cross-ref", count: 4 },
    { name: "prayer", count: 3 },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          color: COLORS.gold,
          fontSize: 22,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        My Notes
      </div>
      <div
        style={{
          color: COLORS.textMuted,
          fontSize: 12,
          fontFamily: "'Source Sans 3', system-ui",
          marginBottom: 14,
        }}
      >
        42 notes across 3 collections
      </div>

      {/* View toggle */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 16,
          background: COLORS.bgPanel,
          borderRadius: 8,
          padding: 3,
        }}
      >
        {["collections", "tags", "all"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              flex: 1,
              padding: "7px 0",
              borderRadius: 6,
              border: "none",
              background: view === v ? COLORS.bgElevated : "transparent",
              color: view === v ? COLORS.gold : COLORS.textMuted,
              fontSize: 12,
              fontFamily: "'Source Sans 3', system-ui",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "collections" && (
        <>
          <button
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: `1px dashed ${COLORS.goldBorder}`,
              background: "transparent",
              color: COLORS.gold,
              fontSize: 13,
              fontFamily: "'Source Sans 3', system-ui",
              cursor: "pointer",
              marginBottom: 12,
            }}
          >
            + New Collection
          </button>
          {collections.map((c, i) => (
            <div
              key={i}
              style={{
                background: COLORS.bgElevated,
                border: `1px solid ${COLORS.goldBorder}`,
                borderRadius: 10,
                padding: 14,
                marginBottom: 8,
                borderLeft: `3px solid ${c.color}`,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    color: COLORS.text,
                    fontSize: 14,
                    fontFamily: "'Source Sans 3', system-ui",
                    fontWeight: 600,
                  }}
                >
                  {c.name}
                </span>
                <span
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 11,
                    fontFamily: "'Source Sans 3', system-ui",
                  }}
                >
                  {c.notes} notes
                </span>
              </div>
              <div
                style={{
                  color: COLORS.textMuted,
                  fontSize: 12,
                  fontFamily: "'Source Sans 3', system-ui",
                }}
              >
                {c.desc}
              </div>
            </div>
          ))}
        </>
      )}

      {view === "tags" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {tags.map((t, i) => (
            <div
              key={i}
              style={{
                background: COLORS.bgElevated,
                border: `1px solid ${COLORS.goldBorder}`,
                borderRadius: 20,
                padding: "8px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  color: COLORS.text,
                  fontSize: 13,
                  fontFamily: "'Source Sans 3', system-ui",
                }}
              >
                {t.name}
              </span>
              <span
                style={{
                  color: COLORS.textMuted,
                  fontSize: 11,
                  fontFamily: "'Source Sans 3', system-ui",
                  background: COLORS.bgPanel,
                  borderRadius: 10,
                  padding: "1px 6px",
                }}
              >
                {t.count}
              </span>
            </div>
          ))}
        </div>
      )}

      {view === "all" && (
        <>
          {[
            {
              ref: "Rom 3:23-24",
              text: "The 'all have sinned' is not just diagnostic — it's the universal premise that makes grace universal...",
              tags: ["christology", "essay-draft"],
              collection: "Romans Deep Dive",
            },
            {
              ref: "Rom 5:12",
              text: "Adam/Christ parallel is the backbone of Paul's argument. Death entered through one man...",
              tags: ["typology", "christology"],
              collection: "Romans Deep Dive",
            },
            {
              ref: "Heb 7:3",
              text: "Without father or mother — is this literal or literary? The silence of the record is the point...",
              tags: ["question"],
              collection: "Sermon Prep — Hebrews",
            },
          ].map((n, i) => (
            <div
              key={i}
              style={{
                background: COLORS.bgElevated,
                border: `1px solid ${COLORS.goldBorder}`,
                borderRadius: 10,
                padding: 14,
                marginBottom: 8,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    color: COLORS.gold,
                    fontSize: 13,
                    fontFamily: "'Source Sans 3', system-ui",
                    fontWeight: 600,
                  }}
                >
                  {n.ref}
                </span>
                <span
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 10,
                    fontFamily: "'Source Sans 3', system-ui",
                  }}
                >
                  {n.collection}
                </span>
              </div>
              <div
                style={{
                  color: COLORS.textDim,
                  fontSize: 12,
                  fontFamily: "'Source Sans 3', system-ui",
                  lineHeight: 1.4,
                  marginBottom: 8,
                }}
              >
                {n.text}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {n.tags.map((t) => (
                  <Badge key={t} text={t} color={COLORS.gold} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── FEATURE 2: Note Editor Overlay ───────────────────────────────

function NoteEditorOverlay() {
  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          color: COLORS.textMuted,
          fontSize: 11,
          fontFamily: "'Source Sans 3', system-ui",
          marginBottom: 4,
        }}
      >
        ← Romans 8
      </div>
      <div
        style={{
          color: COLORS.gold,
          fontSize: 16,
          fontFamily: "'Playfair Display', serif",
          marginBottom: 14,
        }}
      >
        Note — Rom 8:28
      </div>

      {/* Editor area */}
      <div
        style={{
          background: COLORS.bgElevated,
          border: `1px solid ${COLORS.goldBorder}`,
          borderRadius: 10,
          padding: 14,
          marginBottom: 12,
          minHeight: 120,
        }}
      >
        <div
          style={{
            color: COLORS.text,
            fontSize: 13,
            fontFamily: "'Source Sans 3', system-ui",
            lineHeight: 1.6,
          }}
        >
          "All things work together" — the panta synergei is not passive
          optimism. Paul's argument since ch.5 has been building to this: if
          justification (5:1), union with Christ (6:1-11), freedom from law
          (7:1-6), and the Spirit's indwelling (8:1-17) are all real, then the
          logical conclusion is that God's sovereignty encompasses even
          suffering...
        </div>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            color: COLORS.textMuted,
            fontSize: 11,
            fontFamily: "'Source Sans 3', system-ui",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Tags
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Badge text="sovereignty" color={COLORS.gold} />
          <Badge text="essay-draft" color={COLORS.gold} />
          <span
            style={{
              fontSize: 11,
              padding: "2px 10px",
              borderRadius: 20,
              border: `1px dashed ${COLORS.goldBorder}`,
              color: COLORS.textMuted,
              fontFamily: "'Source Sans 3', system-ui",
              cursor: "pointer",
            }}
          >
            + add tag
          </span>
        </div>
      </div>

      {/* Collection */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            color: COLORS.textMuted,
            fontSize: 11,
            fontFamily: "'Source Sans 3', system-ui",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Collection
        </div>
        <div
          style={{
            background: COLORS.bgPanel,
            border: `1px solid ${COLORS.goldBorder}`,
            borderRadius: 8,
            padding: "8px 12px",
            color: COLORS.text,
            fontSize: 13,
            fontFamily: "'Source Sans 3', system-ui",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Romans Deep Dive</span>
          <span style={{ color: COLORS.textMuted }}>▾</span>
        </div>
      </div>

      {/* Linked notes */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            color: COLORS.textMuted,
            fontSize: 11,
            fontFamily: "'Source Sans 3', system-ui",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Linked Notes
        </div>
        <div
          style={{
            background: COLORS.bgPanel,
            border: `1px solid ${COLORS.goldBorder}`,
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              color: COLORS.textDim,
              fontSize: 12,
              fontFamily: "'Source Sans 3', system-ui",
            }}
          >
            🔗 Rom 5:3-4 — "Suffering produces perseverance..."
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            padding: "2px 10px",
            borderRadius: 20,
            border: `1px dashed ${COLORS.goldBorder}`,
            color: COLORS.textMuted,
            fontFamily: "'Source Sans 3', system-ui",
            cursor: "pointer",
          }}
        >
          + link note
        </span>
      </div>

      {/* Save button */}
      <button
        style={{
          width: "100%",
          padding: "12px 0",
          borderRadius: 8,
          border: "none",
          background: COLORS.gold,
          color: COLORS.bg,
          fontSize: 14,
          fontFamily: "'Source Sans 3', system-ui",
          fontWeight: 700,
          cursor: "pointer",
          marginTop: 8,
        }}
      >
        Save Note
      </button>
    </div>
  );
}

// ─── FEATURE 3: Discourse Panel ───────────────────────────────────

function DiscoursePanelScreen() {
  const [expanded, setExpanded] = useState({ n2: true, n3: true });
  const nodeColors = {
    premise: COLORS.accent.premise,
    ground: COLORS.accent.ground,
    contrast: COLORS.accent.contrast,
    inference: COLORS.accent.inference,
    conclusion: COLORS.accent.conclusion,
    purpose: COLORS.accent.ground,
  };

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          color: COLORS.textMuted,
          fontSize: 11,
          fontFamily: "'Source Sans 3', system-ui",
          marginBottom: 4,
        }}
      >
        ← Romans 8 · Chapter Panel
      </div>
      <div
        style={{
          color: COLORS.gold,
          fontSize: 16,
          fontFamily: "'Playfair Display', serif",
          marginBottom: 12,
        }}
      >
        Argument Flow
      </div>

      {/* Thesis */}
      <div
        style={{
          background: COLORS.gold + "15",
          border: `1px solid ${COLORS.gold}40`,
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            color: COLORS.gold,
            fontSize: 10,
            fontFamily: "'Source Sans 3', system-ui",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 4,
          }}
        >
          Thesis
        </div>
        <div
          style={{
            color: COLORS.text,
            fontSize: 13,
            fontFamily: "'Source Sans 3', system-ui",
            lineHeight: 1.4,
          }}
        >
          No condemnation for those who are in Christ Jesus
        </div>
      </div>

      {/* Argument nodes */}
      {[
        {
          id: "n1",
          type: "premise",
          range: "8:1-2",
          marker: null,
          text: "No condemnation — the law of the Spirit has set you free from the law of sin and death",
          children: [],
        },
        {
          id: "n2",
          type: "ground",
          range: "8:3-4",
          marker: "For",
          text: "God did what the law could not do — sent his Son to condemn sin in the flesh",
          children: [
            {
              id: "n2a",
              type: "purpose",
              range: "8:4",
              marker: "in order that",
              text: "The righteous requirement of the law might be fulfilled in us",
            },
          ],
        },
        {
          id: "n3",
          type: "contrast",
          range: "8:5-8",
          marker: "For",
          text: "Flesh vs. Spirit mindset — death vs. life and peace",
          children: [
            {
              id: "n3a",
              type: "ground",
              range: "8:7-8",
              marker: "because",
              text: "The mind governed by flesh is hostile to God and cannot submit to his law",
            },
          ],
        },
        {
          id: "n4",
          type: "inference",
          range: "8:9-11",
          marker: "However",
          text: "You are not in the flesh but in the Spirit — if the Spirit of God dwells in you",
          children: [],
        },
        {
          id: "n5",
          type: "conclusion",
          range: "8:12-13",
          marker: "Therefore",
          text: "We are debtors not to the flesh — put to death the deeds of the body and live",
          children: [],
        },
      ].map((node) => (
        <div key={node.id} style={{ marginBottom: 6 }}>
          <div
            style={{
              background: COLORS.bgElevated,
              border: `1px solid ${COLORS.goldBorder}`,
              borderRadius: 8,
              padding: "10px 12px",
              borderLeft: `3px solid ${nodeColors[node.type]}`,
              cursor: node.children.length ? "pointer" : "default",
            }}
            onClick={() =>
              node.children.length &&
              setExpanded((e) => ({ ...e, [node.id]: !e[node.id] }))
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Badge text={node.type} color={nodeColors[node.type]} />
                {node.marker && (
                  <span
                    style={{
                      color: nodeColors[node.type],
                      fontSize: 11,
                      fontFamily: "'Source Sans 3', system-ui",
                      fontStyle: "italic",
                    }}
                  >
                    "{node.marker}"
                  </span>
                )}
              </div>
              <span
                style={{
                  color: COLORS.gold,
                  fontSize: 11,
                  fontFamily: "'Source Sans 3', system-ui",
                  fontWeight: 600,
                }}
              >
                {node.range}
              </span>
            </div>
            <div
              style={{
                color: COLORS.textDim,
                fontSize: 12,
                fontFamily: "'Source Sans 3', system-ui",
                lineHeight: 1.4,
              }}
            >
              {node.text}
            </div>
            {node.children.length > 0 && (
              <div
                style={{
                  color: COLORS.textMuted,
                  fontSize: 10,
                  marginTop: 4,
                }}
              >
                {expanded[node.id] ? "▾" : "▸"} {node.children.length} sub-argument
                {node.children.length > 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Children */}
          {expanded[node.id] &&
            node.children.map((child) => (
              <div
                key={child.id}
                style={{
                  marginLeft: 20,
                  marginTop: 4,
                  background: COLORS.bgPanel,
                  border: `1px solid ${COLORS.goldBorder}`,
                  borderRadius: 8,
                  padding: "8px 10px",
                  borderLeft: `3px solid ${nodeColors[child.type]}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 3,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Badge text={child.type} color={nodeColors[child.type]} />
                    {child.marker && (
                      <span
                        style={{
                          color: nodeColors[child.type],
                          fontSize: 10,
                          fontFamily: "'Source Sans 3', system-ui",
                          fontStyle: "italic",
                        }}
                      >
                        "{child.marker}"
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      color: COLORS.gold,
                      fontSize: 10,
                      fontFamily: "'Source Sans 3', system-ui",
                    }}
                  >
                    {child.range}
                  </span>
                </div>
                <div
                  style={{
                    color: COLORS.textDim,
                    fontSize: 11,
                    fontFamily: "'Source Sans 3', system-ui",
                    lineHeight: 1.3,
                  }}
                >
                  {child.text}
                </div>
              </div>
            ))}
        </div>
      ))}

      {/* Note */}
      <div
        style={{
          marginTop: 12,
          padding: "10px 12px",
          background: COLORS.bgElevated,
          borderRadius: 8,
          borderLeft: `3px solid ${COLORS.textMuted}`,
        }}
      >
        <div
          style={{
            color: COLORS.textMuted,
            fontSize: 11,
            fontFamily: "'Source Sans 3', system-ui",
            lineHeight: 1.5,
          }}
        >
          Romans 8 opens with the resolution of chapters 5-7. The "therefore" of
          8:1 concludes that the believer's union with Christ (ch.6), freedom
          from the law's condemnation (ch.7), and the Spirit's life-giving power
          together eliminate condemnation.
        </div>
      </div>
    </div>
  );
}

// ─── FEATURE 4: Concept Explorer ──────────────────────────────────

function ConceptBrowseScreen() {
  const concepts = [
    { name: "Covenant", desc: "God's binding commitment to his people", words: 2, threads: 1, chapters: 18, chains: 2 },
    { name: "Sacrifice & Atonement", desc: "The cost of reconciliation", words: 2, threads: 1, chapters: 14, chains: 2 },
    { name: "Kingship", desc: "From judges to the Messianic throne", words: 1, threads: 1, chapters: 12, chains: 3 },
    { name: "Holiness", desc: "Set apart — God's character and call", words: 2, threads: 0, chapters: 15, chains: 0 },
    { name: "Exile & Return", desc: "Displacement, longing, restoration", words: 0, threads: 1, chapters: 16, chains: 1 },
    { name: "Wisdom", desc: "The pursuit of understanding", words: 1, threads: 1, chapters: 10, chains: 0 },
    { name: "Spirit of God", desc: "Ruach — breath, wind, power", words: 1, threads: 1, chapters: 11, chains: 1 },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          color: COLORS.gold,
          fontSize: 22,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        Concepts
      </div>
      <div
        style={{
          color: COLORS.textMuted,
          fontSize: 12,
          fontFamily: "'Source Sans 3', system-ui",
          marginBottom: 16,
        }}
      >
        Theological themes across the canon
      </div>

      {concepts.map((c, i) => (
        <div
          key={i}
          style={{
            background: COLORS.bgElevated,
            border: `1px solid ${COLORS.goldBorder}`,
            borderRadius: 10,
            padding: 14,
            marginBottom: 8,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              color: COLORS.text,
              fontSize: 14,
              fontFamily: "'Source Sans 3', system-ui",
              fontWeight: 600,
              marginBottom: 3,
            }}
          >
            {c.name}
          </div>
          <div
            style={{
              color: COLORS.textMuted,
              fontSize: 12,
              fontFamily: "'Source Sans 3', system-ui",
              marginBottom: 8,
            }}
          >
            {c.desc}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "words", val: c.words },
              { label: "threads", val: c.threads },
              { label: "chapters", val: c.chapters },
              { label: "chains", val: c.chains },
            ]
              .filter((x) => x.val > 0)
              .map((x) => (
                <span
                  key={x.label}
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 10,
                    fontFamily: "'Source Sans 3', system-ui",
                  }}
                >
                  <span style={{ color: COLORS.gold, fontWeight: 600 }}>
                    {x.val}
                  </span>{" "}
                  {x.label}
                </span>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FEATURE 5: Difficult Passages ───────────────────────────────

function DifficultPassagesBrowseScreen() {
  const [filter, setFilter] = useState("all");
  const filters = [
    "all",
    "ethical",
    "contradictions",
    "theological",
    "historical",
  ];
  const passages = [
    {
      title: "The Conquest of Canaan",
      cat: "ethical",
      severity: "major",
      passage: "Josh 6:21; Deut 20:16-18",
      question: "How do we reconcile God's command to destroy the Canaanites with his character of love?",
      responses: 3,
    },
    {
      title: "God Hardening Pharaoh's Heart",
      cat: "theological",
      severity: "major",
      passage: "Exod 4:21; 7:3; 9:12",
      question: "If God hardened Pharaoh's heart, how is Pharaoh responsible?",
      responses: 3,
    },
    {
      title: "Judas's Death",
      cat: "contradictions",
      severity: "moderate",
      passage: "Matt 27:5 vs Acts 1:18",
      question: "Did Judas hang himself or fall headlong?",
      responses: 2,
    },
    {
      title: "Imprecatory Psalms",
      cat: "ethical",
      severity: "major",
      passage: "Ps 137:9",
      question: "How should Christians read prayers for violence against enemies?",
      responses: 3,
    },
    {
      title: "Jephthah's Daughter",
      cat: "ethical",
      severity: "major",
      passage: "Judg 11:30-40",
      question: "Did Jephthah actually sacrifice his daughter?",
      responses: 2,
    },
  ];

  const catColors = {
    ethical: COLORS.accent.ethical,
    contradictions: COLORS.accent.contradiction,
    theological: COLORS.accent.theological,
    historical: COLORS.accent.historical,
  };

  const filtered =
    filter === "all" ? passages : passages.filter((p) => p.cat === filter);

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          color: COLORS.gold,
          fontSize: 22,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        Hard Questions
      </div>
      <div
        style={{
          color: COLORS.textMuted,
          fontSize: 12,
          fontFamily: "'Source Sans 3', system-ui",
          marginBottom: 14,
        }}
      >
        Difficult passages with scholarly responses
      </div>

      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}
      >
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              border: `1px solid ${filter === f ? COLORS.gold : COLORS.goldBorder}`,
              background: filter === f ? COLORS.gold + "20" : "transparent",
              color: filter === f ? COLORS.gold : COLORS.textMuted,
              fontSize: 11,
              fontFamily: "'Source Sans 3', system-ui",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.map((p, i) => (
        <div
          key={i}
          style={{
            background: COLORS.bgElevated,
            border: `1px solid ${COLORS.goldBorder}`,
            borderRadius: 10,
            padding: 14,
            marginBottom: 8,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                color: COLORS.text,
                fontSize: 14,
                fontFamily: "'Source Sans 3', system-ui",
                fontWeight: 600,
                flex: 1,
              }}
            >
              {p.title}
            </span>
            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
              <Badge text={p.cat} color={catColors[p.cat]} />
              {p.severity === "major" && (
                <Badge text="major" color={COLORS.accent.ethical} />
              )}
            </div>
          </div>
          <div
            style={{
              color: COLORS.gold,
              fontSize: 11,
              fontFamily: "'Source Sans 3', system-ui",
              marginBottom: 6,
            }}
          >
            {p.passage}
          </div>
          <div
            style={{
              color: COLORS.textDim,
              fontSize: 12,
              fontFamily: "'Source Sans 3', system-ui",
              lineHeight: 1.4,
              marginBottom: 6,
            }}
          >
            {p.question}
          </div>
          <div
            style={{
              color: COLORS.textMuted,
              fontSize: 10,
              fontFamily: "'Source Sans 3', system-ui",
            }}
          >
            {p.responses} scholarly responses
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FEATURE 5: Difficult Passage Detail ──────────────────────────

function DifficultPassageDetailScreen() {
  const [openResp, setOpenResp] = useState(0);

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          color: COLORS.textMuted,
          fontSize: 11,
          fontFamily: "'Source Sans 3', system-ui",
          marginBottom: 4,
          cursor: "pointer",
        }}
      >
        ← Hard Questions
      </div>

      <div
        style={{
          color: COLORS.gold,
          fontSize: 18,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        The Conquest of Canaan
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <Badge text="ethical" color={COLORS.accent.ethical} />
        <Badge text="major" color={COLORS.accent.ethical} />
      </div>

      <div
        style={{
          color: COLORS.gold,
          fontSize: 12,
          fontFamily: "'Source Sans 3', system-ui",
          marginBottom: 8,
        }}
      >
        Josh 6:21 · Deut 20:16-18
      </div>

      {/* Question */}
      <div
        style={{
          background: COLORS.bgElevated,
          border: `1px solid ${COLORS.accent.ethical}40`,
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 16,
          borderLeft: `3px solid ${COLORS.accent.ethical}`,
        }}
      >
        <div
          style={{
            color: COLORS.textMuted,
            fontSize: 10,
            fontFamily: "'Source Sans 3', system-ui",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 4,
          }}
        >
          The Question
        </div>
        <div
          style={{
            color: COLORS.text,
            fontSize: 13,
            fontFamily: "'Source Sans 3', system-ui",
            lineHeight: 1.5,
          }}
        >
          How do we reconcile God's command to destroy the Canaanites with his
          character of love and justice?
        </div>
      </div>

      <SectionHeader title="Scholarly Responses" />

      {[
        {
          tradition: "Ancient Near Eastern Context",
          summary:
            "The language of total destruction (herem) is conventional ANE warfare rhetoric — hyperbolic, not literal. Archaeological evidence shows Canaanite culture persisted. The command targets Canaanite religion (idolatry, child sacrifice), not ethnicity.",
          scholars: ["Hess", "Block"],
        },
        {
          tradition: "Progressive Revelation",
          summary:
            "God accommodated to the moral framework available in the ancient world. As revelation progresses, the ethic moves from corporate judgment toward individual accountability and enemy love.",
          scholars: ["Longman", "Calvin"],
        },
        {
          tradition: "Divine Judgment",
          summary:
            "God as moral governor has the right to judge nations. Genesis 15:16 indicates God waited 400 years for Canaanite iniquity to reach its full measure. The conquest is judicial, not genocidal.",
          scholars: ["MacArthur"],
        },
      ].map((r, i) => (
        <div
          key={i}
          style={{
            background: COLORS.bgElevated,
            border: `1px solid ${COLORS.goldBorder}`,
            borderRadius: 8,
            marginBottom: 6,
            overflow: "hidden",
          }}
        >
          <div
            onClick={() => setOpenResp(openResp === i ? -1 : i)}
            style={{
              padding: "10px 12px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: COLORS.text,
                fontSize: 13,
                fontFamily: "'Source Sans 3', system-ui",
                fontWeight: 600,
              }}
            >
              {r.tradition}
            </span>
            <span style={{ color: COLORS.textMuted, fontSize: 12 }}>
              {openResp === i ? "▾" : "▸"}
            </span>
          </div>
          {openResp === i && (
            <div
              style={{
                padding: "0 12px 12px",
              }}
            >
              <div
                style={{
                  color: COLORS.textDim,
                  fontSize: 12,
                  fontFamily: "'Source Sans 3', system-ui",
                  lineHeight: 1.5,
                  marginBottom: 8,
                }}
              >
                {r.summary}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {r.scholars.map((s) => (
                  <ScholarPill key={s} name={s} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      <SectionHeader title="Related Chapters" />
      <div style={{ display: "flex", gap: 6 }}>
        {["Joshua 6", "Deuteronomy 20"].map((ch) => (
          <div
            key={ch}
            style={{
              background: COLORS.bgElevated,
              border: `1px solid ${COLORS.goldBorder}`,
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                color: COLORS.gold,
                fontSize: 12,
                fontFamily: "'Source Sans 3', system-ui",
                fontWeight: 600,
              }}
            >
              {ch}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────

const SCREENS = {
  "1a": { label: "Prophecy Browse", component: ProphecyBrowseScreen },
  "1b": { label: "Prophecy Detail", component: ProphecyDetailScreen },
  "2a": { label: "Notes (Enhanced)", component: EnhancedNotesScreen },
  "2b": { label: "Note Editor", component: NoteEditorOverlay },
  "3": { label: "Discourse Panel", component: DiscoursePanelScreen },
  "4": { label: "Concept Browse", component: ConceptBrowseScreen },
  "5a": { label: "Hard Questions", component: DifficultPassagesBrowseScreen },
  "5b": { label: "Passage Detail", component: DifficultPassageDetailScreen },
};

export default function App() {
  const [active, setActive] = useState("1a");
  const ActiveComponent = SCREENS[active].component;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0b08",
        padding: "30px 20px",
        fontFamily: "'Source Sans 3', system-ui",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h1
            style={{
              color: COLORS.gold,
              fontSize: 28,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Companion Study — Feature Wireframes
          </h1>
          <p
            style={{
              color: COLORS.textMuted,
              fontSize: 14,
              fontFamily: "'Source Sans 3', system-ui",
            }}
          >
            5 new features · 8 screens · tap to explore
          </p>
        </div>

        {/* Feature selector */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 30,
          }}
        >
          {Object.entries(SCREENS).map(([key, val]) => {
            const featureNum = key.charAt(0);
            const featureColors = {
              "1": "#DAA520",
              "2": "#6B8FAA",
              "3": "#9B8BB5",
              "4": "#6B8E6B",
              "5": "#CD5C5C",
            };
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  border: `1px solid ${active === key ? featureColors[featureNum] : COLORS.goldBorder}`,
                  background:
                    active === key
                      ? featureColors[featureNum] + "20"
                      : "transparent",
                  color:
                    active === key
                      ? featureColors[featureNum]
                      : COLORS.textMuted,
                  fontSize: 12,
                  fontFamily: "'Source Sans 3', system-ui",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                F{featureNum}: {val.label}
              </button>
            );
          })}
        </div>

        {/* Phone frame */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <PhoneFrame>
            <ActiveComponent />
          </PhoneFrame>
        </div>

        {/* Feature legend */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            marginTop: 24,
            flexWrap: "wrap",
          }}
        >
          {[
            { num: "1", name: "Prophecy Tracker", color: "#DAA520" },
            { num: "2", name: "Research Workspace", color: "#6B8FAA" },
            { num: "3", name: "Discourse Mapping", color: "#9B8BB5" },
            { num: "4", name: "Concept Explorer", color: "#6B8E6B" },
            { num: "5", name: "Hard Questions", color: "#CD5C5C" },
          ].map((f) => (
            <div
              key={f.num}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: f.color,
                }}
              />
              <span
                style={{
                  color: COLORS.textMuted,
                  fontSize: 11,
                  fontFamily: "'Source Sans 3', system-ui",
                }}
              >
                {f.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
