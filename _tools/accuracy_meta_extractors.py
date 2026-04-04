"""
accuracy_meta_extractors.py — Claim extraction from Companion Study meta content.

Covers all content/meta/*.json files: book intros, people, scholar bios,
debate topics, difficult passages, prophecy chains, concepts, topics,
word studies, timelines, synoptic parallels, places, map stories, cross-refs.

Produces the same Claim objects as accuracy_extractors.py so they flow
through the same verification + scoring pipeline.
"""

import json
from pathlib import Path
from typing import Optional

from accuracy_extractors import Claim
from accuracy_config import META_DIR


# ─── ID Generation ──────────────────────────────────────────────────

def _meta_id(source: str, entry_id: str, index: int) -> str:
    """Generate a deterministic claim ID for meta content.

    Format: meta-{source}-{entry_id}-{index:03d}
    """
    clean_id = str(entry_id).replace(" ", "_")[:30]
    return f"meta-{source}-{clean_id}-{index:03d}"


# ─── Master Extractor ───────────────────────────────────────────────

class MetaClaimExtractor:
    """Extract verifiable claims from all content/meta/*.json files."""

    def __init__(self, meta_dir: Path = None):
        self.meta_dir = meta_dir or META_DIR

    def extract_all(self) -> list[Claim]:
        """Extract claims from every meta file."""
        claims = []
        claims.extend(self.extract_book_intros())
        claims.extend(self.extract_people())
        claims.extend(self.extract_scholar_bios())
        claims.extend(self.extract_debate_topics())
        claims.extend(self.extract_difficult_passages())
        claims.extend(self.extract_prophecy_chains())
        claims.extend(self.extract_concepts())
        claims.extend(self.extract_topics())
        claims.extend(self.extract_word_studies())
        claims.extend(self.extract_timelines())
        claims.extend(self.extract_synoptic())
        claims.extend(self.extract_places())
        claims.extend(self.extract_map_stories())
        claims.extend(self.extract_cross_refs())
        return claims

    def _load(self, filename: str):
        path = self.meta_dir / filename
        if not path.exists():
            return None
        return json.load(open(path))

    # ── Book Intros ─────────────────────────────────────────────

    def extract_book_intros(self) -> list[Claim]:
        """Extract claims from book-intros.json.

        Claim types: historical (authorship, date), scholar_attribution (theological).
        """
        data = self._load("book-intros.json")
        if not data or not isinstance(data, list):
            return []

        claims = []
        for intro in data:
            book = intro.get("book", "unknown")
            auth = intro.get("authorship", {})

            # Authorship claim
            author_text = auth.get("author", "")
            if author_text and len(author_text) > 20:
                claims.append(Claim(
                    id=_meta_id("intro", book, 0),
                    chapter_id=f"{book}_intro",
                    book_dir=book,
                    section_num=None,
                    panel_type="book_intro",
                    claim_type="historical",
                    claim_text=f"[Authorship] {author_text}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

            # Date claim
            date_text = auth.get("date", "")
            if date_text and len(date_text) > 20:
                claims.append(Claim(
                    id=_meta_id("intro", book, 1),
                    chapter_id=f"{book}_intro",
                    book_dir=book,
                    section_num=None,
                    panel_type="book_intro",
                    claim_type="timeline",
                    claim_text=f"[Date] {date_text}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

            # Section bodies
            for i, section in enumerate(intro.get("sections", [])):
                body = section.get("body", "")
                title = section.get("title", "")
                if body and len(body) > 50:
                    claims.append(Claim(
                        id=_meta_id("intro", book, 10 + i),
                        chapter_id=f"{book}_intro",
                        book_dir=book,
                        section_num=None,
                        panel_type="book_intro",
                        claim_type="historical",
                        claim_text=f"[{title}] {body}" if title else body,
                        source_attribution=None,
                        verse_ref=None,
                        verification_tier=2,
                    ))

        return claims

    # ── People ──────────────────────────────────────────────────

    def extract_people(self) -> list[Claim]:
        """Extract claims from people.json.

        Claim types: people_places (bio facts), cross_reference (refs).
        """
        data = self._load("people.json")
        if not data or not isinstance(data, dict):
            return []

        people = data.get("people", [])
        claims = []

        for i, person in enumerate(people):
            pid = person.get("id", f"person_{i}")
            name = person.get("name", "Unknown")
            bio = person.get("bio", "")

            # Bio claim
            if bio and len(bio) > 30:
                claims.append(Claim(
                    id=_meta_id("people", pid, 0),
                    chapter_id="meta_people",
                    book_dir="meta",
                    section_num=None,
                    panel_type="people",
                    claim_type="people_places",
                    claim_text=f"[{name}] {bio}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

            # Ref claims (cross-reference validation)
            for j, ref in enumerate(person.get("refs", [])):
                if ref:
                    claims.append(Claim(
                        id=_meta_id("people", pid, 100 + j),
                        chapter_id="meta_people",
                        book_dir="meta",
                        section_num=None,
                        panel_type="people",
                        claim_type="cross_reference",
                        claim_text=ref,
                        source_attribution=None,
                        verse_ref=ref,
                        verification_tier=0,
                    ))

        return claims

    # ── Scholar Bios ────────────────────────────────────────────

    def extract_scholar_bios(self) -> list[Claim]:
        """Extract claims from scholar-bios.json.

        Claim types: scholar_attribution (biographical facts about scholars).
        """
        data = self._load("scholar-bios.json")
        if not data or not isinstance(data, dict):
            return []

        claims = []
        for key, bio in data.items():
            name = bio.get("name", key)
            for i, section in enumerate(bio.get("sections", [])):
                body = section.get("body", "")
                title = section.get("title", "")
                if body and len(body) > 50:
                    claims.append(Claim(
                        id=_meta_id("scholarbio", key, i),
                        chapter_id="meta_scholars",
                        book_dir="meta",
                        section_num=None,
                        panel_type="scholar_bio",
                        claim_type="scholar_attribution",
                        claim_text=f"[{name} — {title}] {body}",
                        source_attribution=name,
                        verse_ref=None,
                        verification_tier=3,
                    ))

        return claims

    # ── Debate Topics ───────────────────────────────────────────

    def extract_debate_topics(self) -> list[Claim]:
        """Extract claims from debate-topics.json.

        Claim types: scholar_attribution (positions + proponents).
        """
        data = self._load("debate-topics.json")
        if not data or not isinstance(data, list):
            return []

        claims = []
        for topic in data:
            tid = topic.get("id", "unknown")

            # Context claim
            context = topic.get("context", "")
            if context and len(context) > 30:
                claims.append(Claim(
                    id=_meta_id("debate", tid, 0),
                    chapter_id="meta_debates",
                    book_dir=topic.get("book_id", "meta"),
                    section_num=None,
                    panel_type="debate_topic",
                    claim_type="historical",
                    claim_text=f"[{topic.get('title','')}] {context}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

            # Position claims
            for j, pos in enumerate(topic.get("positions", [])):
                argument = pos.get("argument", "")
                proponents = pos.get("proponents", "")
                label = pos.get("label", "")

                if argument and len(argument) > 30:
                    claims.append(Claim(
                        id=_meta_id("debate", tid, 10 + j * 4),
                        chapter_id="meta_debates",
                        book_dir=topic.get("book_id", "meta"),
                        section_num=None,
                        panel_type="debate_topic",
                        claim_type="scholar_attribution",
                        claim_text=f"[{topic.get('title','')} — {label}] {argument}",
                        source_attribution=proponents,
                        verse_ref=None,
                        verification_tier=3,
                    ))

                # Strengths/weaknesses
                for field, offset in [("strengths", 1), ("weaknesses", 2)]:
                    text = pos.get(field, "")
                    if text and len(text) > 30:
                        claims.append(Claim(
                            id=_meta_id("debate", tid, 10 + j * 4 + offset),
                            chapter_id="meta_debates",
                            book_dir=topic.get("book_id", "meta"),
                            section_num=None,
                            panel_type="debate_topic",
                            claim_type="scholar_attribution",
                            claim_text=f"[{label} — {field}] {text}",
                            source_attribution=proponents,
                            verse_ref=None,
                            verification_tier=2,
                        ))

            # Synthesis
            synthesis = topic.get("synthesis", "")
            if synthesis and len(synthesis) > 30:
                claims.append(Claim(
                    id=_meta_id("debate", tid, 900),
                    chapter_id="meta_debates",
                    book_dir=topic.get("book_id", "meta"),
                    section_num=None,
                    panel_type="debate_topic",
                    claim_type="historical",
                    claim_text=f"[{topic.get('title','')} — synthesis] {synthesis}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

        return claims

    # ── Difficult Passages ──────────────────────────────────────

    def extract_difficult_passages(self) -> list[Claim]:
        """Extract claims from difficult-passages.json.

        Claim types: scholar_attribution (responses attributed to scholars).
        """
        data = self._load("difficult-passages.json")
        if not data or not isinstance(data, list):
            return []

        claims = []
        for passage in data:
            pid = passage.get("id", "unknown")
            title = passage.get("title", "")

            # Context
            context = passage.get("context", "")
            if context and len(context) > 30:
                claims.append(Claim(
                    id=_meta_id("diffpsg", pid, 0),
                    chapter_id="meta_difficult",
                    book_dir="meta",
                    section_num=None,
                    panel_type="difficult_passage",
                    claim_type="historical",
                    claim_text=f"[{title}] {context}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

            # Consensus
            consensus = passage.get("consensus", "")
            if consensus and len(consensus) > 30:
                claims.append(Claim(
                    id=_meta_id("diffpsg", pid, 1),
                    chapter_id="meta_difficult",
                    book_dir="meta",
                    section_num=None,
                    panel_type="difficult_passage",
                    claim_type="historical",
                    claim_text=f"[{title} — consensus] {consensus}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

            # Responses (scholar-attributed)
            for j, resp in enumerate(passage.get("responses", [])):
                summary = resp.get("summary", "")
                scholar_id = resp.get("scholar_id", "")
                tradition = resp.get("tradition", "")

                if summary and len(summary) > 30:
                    claims.append(Claim(
                        id=_meta_id("diffpsg", pid, 10 + j * 3),
                        chapter_id="meta_difficult",
                        book_dir="meta",
                        section_num=None,
                        panel_type="difficult_passage",
                        claim_type="scholar_attribution",
                        claim_text=f"[{title} — {tradition}] {summary}",
                        source_attribution=scholar_id,
                        verse_ref=None,
                        verification_tier=3,
                    ))

                for field, offset in [("strengths", 1), ("weaknesses", 2)]:
                    text = resp.get(field, "")
                    if text and len(text) > 30:
                        claims.append(Claim(
                            id=_meta_id("diffpsg", pid, 10 + j * 3 + offset),
                            chapter_id="meta_difficult",
                            book_dir="meta",
                            section_num=None,
                            panel_type="difficult_passage",
                            claim_type="scholar_attribution",
                            claim_text=f"[{tradition} — {field}] {text}",
                            source_attribution=scholar_id,
                            verse_ref=None,
                            verification_tier=2,
                        ))

        return claims

    # ── Prophecy Chains ─────────────────────────────────────────

    def extract_prophecy_chains(self) -> list[Claim]:
        """Extract claims from prophecy-chains.json."""
        data = self._load("prophecy-chains.json")
        if not data or not isinstance(data, list):
            return []

        # Load book names for qualifying bare refs
        books_data = self._load("books.json")
        book_names = {}
        if books_data and isinstance(books_data, list):
            book_names = {b["id"]: b["name"] for b in books_data}

        claims = []
        for chain in data:
            cid = chain.get("id", "unknown")
            title = chain.get("title", "")

            # Summary
            summary = chain.get("summary", "")
            if summary and len(summary) > 30:
                claims.append(Claim(
                    id=_meta_id("prophecy", cid, 0),
                    chapter_id="meta_prophecy",
                    book_dir="meta",
                    section_num=None,
                    panel_type="prophecy_chain",
                    claim_type="historical",
                    claim_text=f"[{title}] {summary}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

            # Links — verse ref + note
            for j, link in enumerate(chain.get("links", [])):
                ref = link.get("verse_ref", "")
                note = link.get("note", "")
                link_book = link.get("book_dir", "")

                # Qualify bare refs (e.g., "3:15" → "Genesis 3:15")
                if ref and not any(c.isalpha() for c in ref) and link_book:
                    book_name = book_names.get(link_book, link_book.replace("_", " ").title())
                    ref = f"{book_name} {ref}"

                if ref:
                    claims.append(Claim(
                        id=_meta_id("prophecy", cid, 10 + j * 2),
                        chapter_id="meta_prophecy",
                        book_dir=link_book or "meta",
                        section_num=None,
                        panel_type="prophecy_chain",
                        claim_type="cross_reference",
                        claim_text=ref,
                        source_attribution=None,
                        verse_ref=ref,
                        verification_tier=0,
                    ))

                if note and len(note) > 20:
                    claims.append(Claim(
                        id=_meta_id("prophecy", cid, 10 + j * 2 + 1),
                        chapter_id="meta_prophecy",
                        book_dir=link.get("book_dir", "meta"),
                        section_num=None,
                        panel_type="prophecy_chain",
                        claim_type="cross_reference",
                        claim_text=f"[{ref}] {note}",
                        source_attribution=None,
                        verse_ref=ref,
                        verification_tier=2,
                    ))

        return claims

    # ── Concepts ────────────────────────────────────────────────

    def extract_concepts(self) -> list[Claim]:
        """Extract claims from concepts.json."""
        data = self._load("concepts.json")
        if not data or not isinstance(data, list):
            return []

        claims = []
        for concept in data:
            cid = concept.get("id", "unknown")
            title = concept.get("title", "")

            desc = concept.get("description", "")
            if desc and len(desc) > 30:
                claims.append(Claim(
                    id=_meta_id("concept", cid, 0),
                    chapter_id="meta_concepts",
                    book_dir="meta",
                    section_num=None,
                    panel_type="concept",
                    claim_type="historical",
                    claim_text=f"[{title}] {desc}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

            for j, stop in enumerate(concept.get("journey_stops", [])):
                stop_desc = stop.get("description", "")
                ref = stop.get("ref", "")
                if stop_desc and len(stop_desc) > 30:
                    claims.append(Claim(
                        id=_meta_id("concept", cid, 10 + j),
                        chapter_id="meta_concepts",
                        book_dir="meta",
                        section_num=None,
                        panel_type="concept",
                        claim_type="cross_reference",
                        claim_text=f"[{ref}] {stop_desc}" if ref else stop_desc,
                        source_attribution=None,
                        verse_ref=ref or None,
                        verification_tier=2,
                    ))

        return claims

    # ── Topics ──────────────────────────────────────────────────

    def extract_topics(self) -> list[Claim]:
        """Extract claims from topics.json."""
        data = self._load("topics.json")
        if not data or not isinstance(data, list):
            return []

        claims = []
        for topic in data:
            tid = topic.get("id", "unknown")
            title = topic.get("title", "")

            desc = topic.get("description", "")
            if desc and len(desc) > 30:
                claims.append(Claim(
                    id=_meta_id("topic", tid, 0),
                    chapter_id="meta_topics",
                    book_dir="meta",
                    section_num=None,
                    panel_type="topic",
                    claim_type="historical",
                    claim_text=f"[{title}] {desc}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

            for j, st in enumerate(topic.get("subtopics", [])):
                for k, verse in enumerate(st.get("verses", [])):
                    ref = verse.get("ref", "")
                    note = verse.get("note", "")

                    if ref:
                        claims.append(Claim(
                            id=_meta_id("topic", tid, 10 + j * 20 + k * 2),
                            chapter_id="meta_topics",
                            book_dir="meta",
                            section_num=None,
                            panel_type="topic",
                            claim_type="cross_reference",
                            claim_text=ref,
                            source_attribution=None,
                            verse_ref=ref,
                            verification_tier=0,
                        ))

                    if note and len(note) > 20:
                        claims.append(Claim(
                            id=_meta_id("topic", tid, 10 + j * 20 + k * 2 + 1),
                            chapter_id="meta_topics",
                            book_dir="meta",
                            section_num=None,
                            panel_type="topic",
                            claim_type="cross_reference",
                            claim_text=f"[{ref}] {note}",
                            source_attribution=None,
                            verse_ref=ref or None,
                            verification_tier=2,
                        ))

        return claims

    # ── Word Studies ────────────────────────────────────────────

    def extract_word_studies(self) -> list[Claim]:
        """Extract claims from word-studies.json."""
        data = self._load("word-studies.json")
        if not data or not isinstance(data, list):
            return []

        claims = []
        for ws in data:
            wid = ws.get("id", "unknown")
            word = ws.get("original", "")
            translit = ws.get("transliteration", "")
            glosses = ws.get("glosses", [])

            # Gloss claim (checkable against Strong's)
            if word and glosses:
                claims.append(Claim(
                    id=_meta_id("wordstudy", wid, 0),
                    chapter_id="meta_wordstudies",
                    book_dir="meta",
                    section_num=None,
                    panel_type="word_study",
                    claim_type="hebrew_greek",
                    claim_text=f"{word} ({translit}) = {', '.join(glosses)}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=1,
                ))

            # Note claim
            note = ws.get("note", "")
            if note and len(note) > 30:
                claims.append(Claim(
                    id=_meta_id("wordstudy", wid, 1),
                    chapter_id="meta_wordstudies",
                    book_dir="meta",
                    section_num=None,
                    panel_type="word_study",
                    claim_type="hebrew_greek",
                    claim_text=note,
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

            # Range claim
            range_text = ws.get("range", "")
            if range_text and len(range_text) > 30:
                claims.append(Claim(
                    id=_meta_id("wordstudy", wid, 2),
                    chapter_id="meta_wordstudies",
                    book_dir="meta",
                    section_num=None,
                    panel_type="word_study",
                    claim_type="hebrew_greek",
                    claim_text=range_text,
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

            # Occurrence refs
            for j, occ in enumerate(ws.get("occurrences", [])):
                ref = occ.get("ref", "")
                if ref:
                    claims.append(Claim(
                        id=_meta_id("wordstudy", wid, 10 + j),
                        chapter_id="meta_wordstudies",
                        book_dir="meta",
                        section_num=None,
                        panel_type="word_study",
                        claim_type="cross_reference",
                        claim_text=ref,
                        source_attribution=None,
                        verse_ref=ref,
                        verification_tier=0,
                    ))

        return claims

    # ── Timelines ───────────────────────────────────────────────

    def extract_timelines(self) -> list[Claim]:
        """Extract claims from timelines.json."""
        data = self._load("timelines.json")
        if not data or not isinstance(data, dict):
            return []

        claims = []

        for key in ("events", "book_events", "world_events"):
            for i, event in enumerate(data.get(key, [])):
                eid = event.get("id", f"{key}_{i}")
                name = event.get("name", "")
                year = event.get("year")
                summary = event.get("summary", "")

                if year is not None:
                    claims.append(Claim(
                        id=_meta_id("timeline", eid, 0),
                        chapter_id="meta_timelines",
                        book_dir="meta",
                        section_num=None,
                        panel_type="timeline",
                        claim_type="timeline",
                        claim_text=f"[{name}] Year: {year}",
                        source_attribution=None,
                        verse_ref=None,
                        verification_tier=2,
                    ))

                if summary and len(summary) > 30:
                    claims.append(Claim(
                        id=_meta_id("timeline", eid, 1),
                        chapter_id="meta_timelines",
                        book_dir="meta",
                        section_num=None,
                        panel_type="timeline",
                        claim_type="historical",
                        claim_text=f"[{name}] {summary}",
                        source_attribution=None,
                        verse_ref=None,
                        verification_tier=2,
                    ))

        # Timeline people (birth/death dates)
        for i, person in enumerate(data.get("timeline_people", [])):
            pid = person.get("id", f"tp_{i}")
            name = person.get("name", "")
            born = person.get("born")
            died = person.get("died")

            if born is not None or died is not None:
                date_text = f"born: {born}" if born else ""
                if died is not None:
                    date_text += f"{', ' if date_text else ''}died: {died}"
                claims.append(Claim(
                    id=_meta_id("timeline", pid, 0),
                    chapter_id="meta_timelines",
                    book_dir="meta",
                    section_num=None,
                    panel_type="timeline",
                    claim_type="timeline",
                    claim_text=f"[{name}] {date_text}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

        return claims

    # ── Synoptic ────────────────────────────────────────────────

    def extract_synoptic(self) -> list[Claim]:
        """Extract claims from synoptic.json."""
        data = self._load("synoptic.json")
        if not data or not isinstance(data, list):
            return []

        claims = []
        for entry in data:
            sid = entry.get("id", "unknown")

            # Passage refs
            for j, passage in enumerate(entry.get("passages", [])):
                ref = passage.get("ref", "")
                if ref:
                    claims.append(Claim(
                        id=_meta_id("synoptic", sid, j),
                        chapter_id="meta_synoptic",
                        book_dir=passage.get("book", "meta"),
                        section_num=None,
                        panel_type="synoptic",
                        claim_type="cross_reference",
                        claim_text=ref,
                        source_attribution=None,
                        verse_ref=ref,
                        verification_tier=0,
                    ))

            # Diff annotations
            for j, da in enumerate(entry.get("diff_annotations", [])):
                note = da.get("note", "")
                if note and len(note) > 20:
                    claims.append(Claim(
                        id=_meta_id("synoptic", sid, 100 + j),
                        chapter_id="meta_synoptic",
                        book_dir="meta",
                        section_num=None,
                        panel_type="synoptic",
                        claim_type="cross_reference",
                        claim_text=f"[{da.get('location','')}] {note}",
                        source_attribution=None,
                        verse_ref=None,
                        verification_tier=2,
                    ))

        return claims

    # ── Places ──────────────────────────────────────────────────

    def extract_places(self) -> list[Claim]:
        """Extract claims from places.json."""
        data = self._load("places.json")
        if not data or not isinstance(data, list):
            return []

        claims = []
        for place in data:
            pid = place.get("id", "unknown")
            ancient = place.get("ancient", "")
            modern = place.get("modern", "")

            if ancient and modern:
                claims.append(Claim(
                    id=_meta_id("place", pid, 0),
                    chapter_id="meta_places",
                    book_dir="meta",
                    section_num=None,
                    panel_type="place",
                    claim_type="people_places",
                    claim_text=f"{ancient} = modern: {modern} (lat: {place.get('lat')}, lon: {place.get('lon')})",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

        return claims

    # ── Map Stories ─────────────────────────────────────────────

    def extract_map_stories(self) -> list[Claim]:
        """Extract claims from map-stories.json."""
        data = self._load("map-stories.json")
        if not data or not isinstance(data, dict):
            return []

        claims = []
        for i, story in enumerate(data.get("stories", [])):
            sid = story.get("id", f"story_{i}")
            summary = story.get("summary", "")

            if summary and len(summary) > 30:
                claims.append(Claim(
                    id=_meta_id("mapstory", sid, 0),
                    chapter_id="meta_maps",
                    book_dir="meta",
                    section_num=None,
                    panel_type="map_story",
                    claim_type="historical",
                    claim_text=f"[{story.get('name','')}] {summary}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

        return claims

    # ── Cross-Refs ──────────────────────────────────────────────

    def extract_cross_refs(self) -> list[Claim]:
        """Extract claims from cross-refs.json."""
        data = self._load("cross-refs.json")
        if not data or not isinstance(data, dict):
            return []

        claims = []

        # Thread chains
        for thread in data.get("threads", []):
            tid = thread.get("id", "unknown")
            for j, link in enumerate(thread.get("chain", [])):
                ref = link.get("ref", "")
                note = link.get("note", "")

                if ref:
                    claims.append(Claim(
                        id=_meta_id("crossref", tid, j * 2),
                        chapter_id="meta_crossrefs",
                        book_dir="meta",
                        section_num=None,
                        panel_type="cross_ref_thread",
                        claim_type="cross_reference",
                        claim_text=ref,
                        source_attribution=None,
                        verse_ref=ref,
                        verification_tier=0,
                    ))

                if note and len(note) > 20:
                    claims.append(Claim(
                        id=_meta_id("crossref", tid, j * 2 + 1),
                        chapter_id="meta_crossrefs",
                        book_dir="meta",
                        section_num=None,
                        panel_type="cross_ref_thread",
                        claim_type="cross_reference",
                        claim_text=f"[{ref}] {note}",
                        source_attribution=None,
                        verse_ref=ref or None,
                        verification_tier=2,
                    ))

        # Pairs
        for j, pair in enumerate(data.get("pairs", [])):
            ref_a = pair.get("a", "")
            ref_b = pair.get("b", "")
            note = pair.get("note", "")

            for ref in (ref_a, ref_b):
                if ref:
                    claims.append(Claim(
                        id=_meta_id("crossref", f"pair_{j}", 0 if ref == ref_a else 1),
                        chapter_id="meta_crossrefs",
                        book_dir="meta",
                        section_num=None,
                        panel_type="cross_ref_pair",
                        claim_type="cross_reference",
                        claim_text=ref,
                        source_attribution=None,
                        verse_ref=ref,
                        verification_tier=0,
                    ))

            if note and len(note) > 20:
                claims.append(Claim(
                    id=_meta_id("crossref", f"pair_{j}", 2),
                    chapter_id="meta_crossrefs",
                    book_dir="meta",
                    section_num=None,
                    panel_type="cross_ref_pair",
                    claim_type="cross_reference",
                    claim_text=f"[{ref_a} ↔ {ref_b}] {note}",
                    source_attribution=None,
                    verse_ref=None,
                    verification_tier=2,
                ))

        return claims
