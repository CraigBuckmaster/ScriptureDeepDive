/**
 * DiscoveryImageGallery — Thin wrapper around ContentImageGallery
 * for archaeological discoveries.
 *
 * Accepts ArchaeologyImage[] (which has the same shape needed by
 * ContentImageGallery) and delegates rendering.
 *
 * Part of Epic #1071 (#1088).
 */

import React from 'react';
import type { ArchaeologyImage } from '../types';
import { ContentImageGallery } from './ContentImageGallery';

interface Props {
  images: ArchaeologyImage[];
}

export function DiscoveryImageGallery({ images }: Props) {
  return <ContentImageGallery images={images} />;
}
