/**
 * Data integrity tests for the people.json genealogy data.
 * Reads content JSON directly — no React components or mocks.
 */

import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.resolve(__dirname, '../../..', 'content');

interface Person {
  id: string;
  name: string;
  gender: string | null;
  father: string | null;
  mother: string | null;
  spouseOf: string | null;
  [key: string]: unknown;
}

interface PeopleFile {
  people: Person[];
  [key: string]: unknown;
}

function loadPeople(): Person[] {
  const data: PeopleFile = JSON.parse(
    fs.readFileSync(path.join(CONTENT_DIR, 'meta', 'people.json'), 'utf-8'),
  );
  return data.people;
}

describe('people data integrity', () => {
  const people = loadPeople();
  const personIds = new Set(people.map((p) => p.id));

  it('people.json has entries', () => {
    expect(people.length).toBeGreaterThan(0);
  });

  it('no person has father or mother pointing to themselves', () => {
    const violations: string[] = [];
    for (const person of people) {
      if (person.father === person.id) {
        violations.push(`${person.id} ("${person.name}"): father points to self`);
      }
      if (person.mother === person.id) {
        violations.push(`${person.id} ("${person.name}"): mother points to self`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('all father IDs reference existing person IDs', () => {
    const violations: string[] = [];
    for (const person of people) {
      if (person.father && !personIds.has(person.father)) {
        violations.push(`${person.id} ("${person.name}"): father "${person.father}" not found`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('all mother IDs reference existing person IDs', () => {
    const violations: string[] = [];
    for (const person of people) {
      if (person.mother && !personIds.has(person.mother)) {
        violations.push(`${person.id} ("${person.name}"): mother "${person.mother}" not found`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('all spouseOf IDs reference existing person IDs', () => {
    const violations: string[] = [];
    for (const person of people) {
      if (person.spouseOf && !personIds.has(person.spouseOf)) {
        violations.push(`${person.id} ("${person.name}"): spouseOf "${person.spouseOf}" not found`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('gender values are only m, f, or null/undefined', () => {
    const validGenders = new Set(['m', 'f', 'M', 'F']);
    const violations: string[] = [];
    for (const person of people) {
      if (person.gender !== null && person.gender !== undefined && !validGenders.has(person.gender)) {
        violations.push(`${person.id} ("${person.name}"): gender is "${person.gender}"`);
      }
    }
    expect(violations).toEqual([]);
  });
});
