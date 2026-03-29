/**
 * db/content/people.ts — People queries (genealogy tree, person detail).
 */

import { getDb } from '../database';
import type { Person } from '../../types';

export async function getAllPeople(): Promise<Person[]> {
  return getDb().getAllAsync<Person>(
    'SELECT * FROM people ORDER BY name'
  );
}

export async function getPerson(id: string): Promise<Person | null> {
  return getDb().getFirstAsync<Person>(
    'SELECT * FROM people WHERE id = ?', [id]
  );
}

export async function getPersonChildren(parentId: string): Promise<Person[]> {
  return getDb().getAllAsync<Person>(
    'SELECT * FROM people WHERE father = ? OR mother = ? ORDER BY name',
    [parentId, parentId]
  );
}

export async function getSpousesOf(personId: string): Promise<Person[]> {
  return getDb().getAllAsync<Person>(
    'SELECT * FROM people WHERE spouse_of = ? ORDER BY name',
    [personId]
  );
}
