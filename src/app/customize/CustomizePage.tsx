'use client';
import WishlistButton from '@/components/WishlistButton';
import { useWishlist } from '@/context/WishlistContext';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import styles from './customize.module.css';

/* ═══════════════════════════════════════════════════════════════
   CONFIGURATION PARAMETERS  (easy to change)
═══════════════════════════════════════════════════════════════ */

/** Step labels */
const STEP_LABELS = [
  'Type',
  'Shape',
  'Dimensions',
  'Fill Type',
  'Fabric',
  'Zipper',
  'Piping',
  'Ties',
];

/** Categories */
const CATEGORIES = ['Indoor', 'Outdoor', 'RV', 'Boat', 'Pet Bed'];

/** Product type image choices */
const CUSHION_TYPES: ImgOpt[] = [
  { key: 'Bed Cushion', label: 'Bed Cushion', img: '/images/calculator-types/bed-cushion.png' },
  { key: 'Bench Window Back', label: 'Bench Window Back', img: '/images/calculator-types/bench-window-back.png' },
  { key: 'Bench Window Seat', label: 'Bench Window Seat', img: '/images/calculator-types/bench-window-seat.png' },
  { key: 'Bench w Back', label: 'Bench w Back', img: '/images/calculator-types/bench-w-back.png' },
  { key: 'Bolster Pillow', label: 'Bolster Pillow', img: '/images/calculator-types/bolster-pillow.png' },
  { key: 'Chair No Back', label: 'Chair, No Back', img: '/images/calculator-types/chair-no-back.png' },
  { key: 'Chair', label: 'Chair', img: '/images/calculator-types/chair.png' },
  { key: 'Chaise', label: 'Chaise', img: '/images/calculator-types/chaise.png' },
  { key: 'Loveseat', label: 'Loveseat', img: '/images/calculator-types/loveseat.png' },
  { key: 'Lumbar Pillow', label: 'Lumbar Pillow', img: '/images/calculator-types/lumbar-pillow.png' },
  { key: 'Ottoman', label: 'Ottoman', img: '/images/calculator-types/ottoman.png' },
  { key: 'Pet Bed', label: 'Pet Bed', img: '/images/calculator-types/pet-bed.png' },
  { key: 'Sofa', label: 'Sofa', img: '/images/calculator-types/sofa.png' },
  { key: 'Toss Pillow', label: 'Toss Pillow', img: '/images/calculator-types/toss-pillow.png' },
];

/** Shapes with display name (used in DB shape field) */
type ShapeDef = { key: string; label: string; img?: string; icon?: string };
function getBasicShapePreview(shape: string): string {
  const orange = '#fb4a1e';
  let outline = '<rect x="34" y="28" width="132" height="72" rx="3" />';

  switch (shape) {
    case 'Round':
      outline = '<circle cx="100" cy="64" r="42" />';
      break;
    case 'Trapezium':
      outline = '<path d="M52 28 H148 L166 100 H34 Z" />';
      break;
    case 'T Cushion':
      outline = '<path d="M28 28 H172 V54 H126 V100 H74 V54 H28 Z" />';
      break;
    case 'L Shape':
      outline = '<path d="M34 28 H92 V68 H166 V100 H34 Z" />';
      break;
    case 'Triangle':
      outline = '<path d="M100 24 L168 100 H32 Z" />';
      break;
    case 'Pillow':
    case 'Rectangle':
    case 'Box':
      outline = '<rect x="34" y="28" width="132" height="72" rx="12" />';
      break;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 128"><g fill="#fff" stroke="${orange}" stroke-width="5" stroke-linejoin="round">${outline}</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const SHAPES: ShapeDef[] = [
  { key: 'Rectangle', label: 'Throw Pillow', img: getBasicShapePreview('Rectangle') },
  { key: 'Box', label: 'Rectangle', img: getBasicShapePreview('Box') },
  { key: 'Trapezium', label: 'Trapezium', img: getBasicShapePreview('Trapezium') },
  { key: 'T Cushion', label: 'T Shape', img: getBasicShapePreview('T Cushion') },
  { key: 'L Shape', label: 'L Shape', img: getBasicShapePreview('L Shape') },
  { key: 'Triangle', label: 'Triangle', img: getBasicShapePreview('Triangle') },
  { key: 'Round', label: 'Round', img: getBasicShapePreview('Round') },
  { key: 'Pillow', label: 'Pillow', img: getBasicShapePreview('Pillow') },
];

const STEP_TWO_SHAPES: ShapeDef[] = [
  { key: 'Squared Corners', label: 'Squared Corners', img: '/images/shapes/Squared Corners.png' },
  { key: 'Squared Corners 2', label: 'Squared Corners 2', img: '/images/shapes/Squared Corners (2).png' },
  { key: 'Squared Corners 3', label: 'Squared Corners 3', img: '/images/shapes/Squared Corners (3).png' },
  { key: 'Rounded Corners', label: 'Rounded Corners', img: '/images/shapes/Rounded Corners.png' },
  { key: 'Rounded Front', label: 'Rounded Front', img: '/images/shapes/Rounded Front.png' },
  { key: 'Rounded Back', label: 'Rounded Back', img: '/images/shapes/Rounded Back.png' },
  { key: 'Trapezoid', label: 'Trapezoid', img: '/images/shapes/Trapezoid.png' },
  { key: 'Rectangle 1 Break', label: 'Rectangle 1 Break', img: '/images/shapes/Rectangle 1 Break.png' },
  { key: 'Rectangle 2 Breaks', label: 'Rectangle 2 Breaks', img: '/images/shapes/Rectangle 2 Breaks.png' },
  { key: 'Rectangle 3 Breaks', label: 'Rectangle 3 Breaks', img: '/images/shapes/Rectangle 3 Breaks.png' },
  { key: 'Rounded Rectangle 1 Break', label: 'Rounded Rectangle 1 Break', img: '/images/shapes/Rounded Rectangle 1 Break.png' },
  { key: 'Rounded Rectangle 2 Breaks', label: 'Rounded Rectangle 2 Breaks', img: '/images/shapes/Rounded Rectangle 2 Breaks.png' },
  { key: 'Rounded Rectangle 3 Breaks', label: 'Rounded Rectangle 3 Breaks', img: '/images/shapes/Rounded Rectangle 3 Breaks.png' },
  { key: 'Circle', label: 'Circle', img: '/images/shapes/Circle.png' },
  { key: 'Outer Bottom Corners Rounded', label: 'Outer Bottom Corners Rounded', img: '/images/shapes/Outer Bottom Corners Rounded.png' },
  { key: 'All Bottom Corners Rounded', label: 'All Bottom Corners Rounded', img: '/images/shapes/All Bottom Corners Rounded.png' },
  { key: 'Outer Top Corners Rounded', label: 'Outer Top Corners Rounded', img: '/images/shapes/Outer Top Corners Rounded.png' },
  { key: 'All Top Corners Rounded', label: 'All Top Corners Rounded', img: '/images/shapes/All Top Corners Rounded.png' },
  { key: 'Outer Corners Rounded', label: 'Outer Corners Rounded', img: '/images/shapes/Outer Corners Rounded.png' },
  { key: 'All Corners Rounded', label: 'All Corners Rounded', img: '/images/shapes/All Corners Rounded.png' },
  { key: 'Outer Front Corners Rounded', label: 'Outer Front Corners Rounded', img: '/images/shapes/Outer Bottom Corners Rounded.png' },
  { key: 'All Front Corners Rounded', label: 'All Front Corners Rounded', img: '/images/shapes/All Bottom Corners Rounded.png' },
  { key: 'Outer Back Corners Rounded', label: 'Outer Back Corners Rounded', img: '/images/shapes/Outer Top Corners Rounded.png' },
  { key: 'All Back Corners Rounded', label: 'All Back Corners Rounded', img: '/images/shapes/All Top Corners Rounded.png' },
  { key: '1 Seat 1 Back', label: '1 Seat 1 Back', img: '/images/shapes/1 Seat 1 Back.png' },
  { key: '1 Seat 2 Back', label: '1 Seat 2 Back', img: '/images/shapes/1 Seat 2 Back.png' },
  { key: '1 Seat 3 Back', label: '1 Seat 3 Back' },
  { key: '2 Seat 1 Back', label: '2 Seat 1 Back', img: '/images/shapes/2 Seat 1 Back.png' },
  { key: '2 Seat 2 Back', label: '2 Seat 2 Back', img: '/images/shapes/2 Seat 2 Back.png' },
  { key: '3 Seat 1 Back', label: '3 Seat 1 Back', img: '/images/shapes/3 Seat 1 Back.png' },
  { key: '3 Seat 3 Back', label: '3 Seat 3 Back', img: '/images/shapes/3 Seat 3 Back.png' },
  { key: '2 Outer Bottom Corners Rounded', label: '2 Outer Bottom Corners Rounded', img: '/images/shapes/2 Outer Bottom Corners Rounded.png' },
  { key: '2 Outer Corners Rounded', label: '2 Outer Corners Rounded', img: '/images/shapes/2 Outer Corners Rounded.png' },
  { key: '2 Outer Top Corners Rounded', label: '2 Outer Top Corners Rounded', img: '/images/shapes/2 Outer Top Corners Rounded.png' },
  { key: '3 All Front Corners Rounded', label: '3 All Front Corners Rounded', img: '/images/shapes/3 AAll Front Corners Rounded.png' },
  { key: '3 All Back Corners Rounded', label: '3 All Back Corners Rounded', img: '/images/shapes/3 All Back Corners Rounded.png' },
  { key: '3 All Bottom Corners Rounded', label: '3 All Bottom Corners Rounded', img: '/images/shapes/3 All Bottom Corners Rounded.png' },
  { key: '3 All Corners Rounded', label: '3 All Corners Rounded', img: '/images/shapes/3 All Corners Rounded.png' },
  { key: '3 Outer Back Corners Rounded', label: '3 Outer Back Corners Rounded', img: '/images/shapes/3 Outer Back Corners Rounded.png' },
  { key: '3 Outer Front Corners Rounded', label: '3 Outer Front Corners Rounded', img: '/images/shapes/3 Outer Front Corners Rounded.png' },
  { key: '3 Outer Top Corners Rounded', label: '3 Outer Top Corners Rounded', img: '/images/shapes/3 Outer Top Corners Rounded.png' },
  { key: 'Rounded Bottom', label: 'Rounded Bottom' },
  { key: 'Rounded Top', label: 'Rounded Top' },
  { key: 'Pillow', label: 'Pillow' },
];

const TYPE_SHAPE_OPTIONS: Record<string, string[]> = {
  'Bench Window Seat': ['Squared Corners', 'Rounded Corners', 'Rounded Front', 'Rounded Back', 'Trapezoid'],
  'Bench Window Back': ['Squared Corners', 'Rounded Corners', 'Rounded Front', 'Rounded Back', 'Trapezoid'],
  Chaise: ['Rectangle 1 Break', 'Rectangle 2 Breaks', 'Rectangle 3 Breaks', 'Rounded Rectangle 1 Break', 'Rounded Rectangle 2 Breaks', 'Rounded Rectangle 3 Breaks'],
  'Bed Cushion': ['Squared Corners', 'Rounded Corners', 'Rounded Front', 'Rounded Back', 'Trapezoid'],
  Chair: ['Squared Corners', 'Rounded Corners', 'Rounded Top'],
  'Chair No Back': ['Squared Corners', 'Rounded Corners', 'Rounded Front', 'Rounded Back', 'Trapezoid', 'Circle'],
  Ottoman: ['Squared Corners', 'Rounded Corners'],
  'Toss Pillow': ['Pillow'],
  'Lumbar Pillow': ['Pillow'],
  'Bolster Pillow': ['Pillow'],
};

const CONFIGURATION_SHAPE_OPTIONS: Record<string, Record<string, string[]>> = {
  Loveseat: {
    '2 Seat 2 Back': ['Squared Corners', 'Outer Bottom Corners Rounded', 'All Bottom Corners Rounded', 'Outer Top Corners Rounded', 'All Top Corners Rounded', 'Outer Corners Rounded', 'All Corners Rounded'],
    '2 Seat 1 Back': ['Squared Corners', 'Outer Bottom Corners Rounded', 'All Bottom Corners Rounded', 'Outer Top Corners Rounded', 'All Top Corners Rounded', 'Outer Corners Rounded', 'All Corners Rounded'],
    '1 Seat 2 Back': ['Squared Corners', 'Outer Bottom Corners Rounded', 'All Bottom Corners Rounded', 'Outer Top Corners Rounded', 'All Top Corners Rounded', 'Outer Corners Rounded', 'All Corners Rounded'],
    '1 Seat 1 Back': ['Rounded Corners', 'Rounded Bottom', 'Rounded Top'],
  },
  Sofa: {
    '3 Seat 3 Back': ['Squared Corners', 'Outer Bottom Corners Rounded', 'All Bottom Corners Rounded', 'Outer Top Corners Rounded', 'All Top Corners Rounded', 'Outer Corners Rounded', 'All Corners Rounded'],
    '2 Seat 2 Back': ['Squared Corners', 'Outer Bottom Corners Rounded', 'All Bottom Corners Rounded', 'Outer Top Corners Rounded', 'All Top Corners Rounded', 'Outer Corners Rounded', 'All Corners Rounded'],
    '1 Seat 3 Back': ['Squared Corners', 'Outer Bottom Corners Rounded', 'All Bottom Corners Rounded', 'Outer Top Corners Rounded', 'All Top Corners Rounded', 'Outer Corners Rounded', 'All Corners Rounded'],
    '1 Seat 1 Back': ['Squared Corners', 'Rounded Bottom', 'Rounded Top', 'Rounded Corners'],
    '3 Seat 1 Back': ['Squared Corners', 'Rounded Bottom', 'Rounded Top', 'Rounded Corners'],
    '2 Seat 1 Back': ['Squared Corners', 'Rounded Bottom', 'Rounded Top', 'Rounded Corners'],
  },
};

const BACK_CORNER_STYLES = [
  'Squared Corners',
  'Outer Front Corners Rounded',
  'All Front Corners Rounded',
  'Outer Back Corners Rounded',
  'All Back Corners Rounded',
  'Outer Corners Rounded',
  'All Corners Rounded',
];

function getConfigurationPartShapes(type: string, configuration: string, part: 'back' | 'seat'): string[] {
  const configuredShapes = CONFIGURATION_SHAPE_OPTIONS[type]?.[configuration] ?? [];
  // A single-seat/single-back layout keeps the shape set provided in the workbook.
  // One-back configurations with the four-style workbook list use front/back labels
  // for the back cushion and bottom/top labels for the seat cushion.
  if (configuredShapes.some(shape => shape === 'Rounded Bottom') && configuredShapes.some(shape => shape === 'Rounded Top')) {
    return part === 'back'
      ? configuredShapes.map(shape => shape.replace('Rounded Bottom', 'Rounded Front').replace('Rounded Top', 'Rounded Back'))
      : configuredShapes;
  }
  return part === 'back' ? BACK_CORNER_STYLES : configuredShapes;
}

function getConfigurationPieceCount(configuration: string, part: 'back' | 'seat'): number {
  const match = configuration.match(part === 'back' ? /(\d+)\s*Back/i : /(\d+)\s*Seat/i);
  return match ? Math.max(1, Number(match[1])) : 1;
}

function getConfigurationShapePreview(shape: string, count: number, part: 'back' | 'seat'): string {
  const orientedShape = part === 'back'
    ? shape.replace(/Front/gi, 'Bottom').replace(/Back/gi, 'Top')
    : shape;
  const isOuterOnly = /\bOuter\b/i.test(orientedShape) && !/\bAll\b/i.test(orientedShape);
  const hasNamedEdge = /Top|Bottom|Front|Back/i.test(orientedShape);
  const roundsAllCorners = !hasNamedEdge && /Corners/i.test(orientedShape);
  const roundsTop = /Top|Back/i.test(orientedShape);
  const roundsBottom = /Bottom|Front/i.test(orientedShape);
  const isOuterPiece = (index: number) => index === 0 || index === count - 1;
  const radius = 10;
  const gap = count > 2 ? 6 : 10;
  const padding = 12;
  const width = (200 - padding * 2 - gap * (count - 1)) / count;
  const height = 62;
  const y = 21;

  const paths = Array.from({ length: count }, (_, index) => {
    const x = padding + index * (width + gap);
    const outerPiece = isOuterPiece(index);
    const useTop = (roundsAllCorners && (!isOuterOnly || outerPiece)) || (roundsTop && (!isOuterOnly || outerPiece));
    const useBottom = (roundsAllCorners && (!isOuterOnly || outerPiece)) || (roundsBottom && (!isOuterOnly || outerPiece));
    const roundTopLeft = useTop && (!isOuterOnly || index === 0);
    const roundTopRight = useTop && (!isOuterOnly || index === count - 1);
    const roundBottomRight = useBottom && (!isOuterOnly || index === count - 1);
    const roundBottomLeft = useBottom && (!isOuterOnly || index === 0);
    const tl = roundTopLeft ? radius : 0;
    const tr = roundTopRight ? radius : 0;
    const br = roundBottomRight ? radius : 0;
    const bl = roundBottomLeft ? radius : 0;

    return `<path d="M ${x + tl} ${y} H ${x + width - tr} Q ${x + width} ${y} ${x + width} ${y + tr} V ${y + height - br} Q ${x + width} ${y + height} ${x + width - br} ${y + height} H ${x + bl} Q ${x} ${y + height} ${x} ${y + height - bl} V ${y + tl} Q ${x} ${y} ${x + tl} ${y} Z" fill="#fff" stroke="#fb4a1e" stroke-width="4"/>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 104">${paths}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const getShapeOption = (key: string): ShapeDef =>
  STEP_TWO_SHAPES.find(shape => shape.key === key)
  ?? SHAPES.find(shape => shape.key === key)
  ?? { key, label: key };

function optionKey(value: string) {
  return value.toLowerCase().replace(/ /g, '_');
}

function getCalculatorShape(selectedShape: string): string {
  if (SHAPES.some(s => s.key === selectedShape)) return selectedShape;
  if (selectedShape === 'Circle') return 'Round';
  if (selectedShape === 'Trapezoid') return 'Trapezium';
  return 'Box';
}

function getShapeDisplayLabel(selectedShape: string): string {
  return SHAPES.find(s => s.key === selectedShape)?.label ?? selectedShape;
}

function parseDimensionValue(dimensions: string, label: string): number | null {
  const match = dimensions.match(new RegExp(`${label}:\\s*([0-9.]+)`, 'i'));
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function parseCartDimensions(dimensions?: string): Partial<Dims> {
  if (!dimensions) return {};

  const parsed: Partial<Dims> = {};
  const fields: Array<[keyof Dims, string]> = [
    ['length', 'Length'],
    ['width', 'Width'],
    ['bottomWidth', 'Bottom Width'],
    ['topWidth', 'Top Width'],
    ['thickness', 'Thickness'],
    ['ear', 'Ear'],
    ['diameter', 'Diameter'],
    ['depth', 'Depth'],
    ['height', 'Height'],
    ['seatThickness', 'Seat Thickness'],
    ['backHeight', 'Back Height'],
    ['backThickness', 'Back Thickness'],
    ['frontWidth', 'Front Width'],
    ['centerDepth', 'Center Depth'],
    ['backWidth', 'Back Width'],
    ['totalWidth', 'Total Width'],
    ['section1', 'Section 1'],
    ['section2', 'Section 2'],
    ['section3', 'Section 3'],
    ['section4', 'Section 4'],
  ];

  fields.forEach(([field, label]) => {
    const value = field === 'thickness'
      ? parseDimensionValue(dimensions, label) ?? parseDimensionValue(dimensions, 'Height')
      : parseDimensionValue(dimensions, label);
    if (value !== null) parsed[field] = value;
  });

  return parsed;
}

/** Dimension dropdown ranges  (start, end, step in inches) */
const DIM_CONFIG = {
  length: { start: 6, end: 120, step: 1, label: 'Length (in)' },
  width: { start: 6, end: 120, step: 1, label: 'Width (in)' },
  bottomWidth: { start: 6, end: 120, step: 1, label: 'Bottom Width (in)' },
  topWidth: { start: 6, end: 120, step: 1, label: 'Top Width (in)' },
  thickness: { start: 1, end: 12, step: 0.5, label: 'Thickness (in)' },
  ear: { start: 2, end: 24, step: 1, label: 'Ear (in)' },
  diameter: { start: 6, end: 120, step: 1, label: 'Diameter (in)' },
  depth: { start: 6, end: 120, step: 1, label: 'Depth (in)' },
  height: { start: 6, end: 120, step: 1, label: 'Height (in)' },
  seatThickness: { start: 1, end: 12, step: 0.5, label: 'Seat Thickness (in)' },
  backHeight: { start: 6, end: 120, step: 1, label: 'Back Height (in)' },
  backThickness: { start: 1, end: 12, step: 0.5, label: 'Back Thickness (in)' },
  frontWidth: { start: 6, end: 120, step: 1, label: 'Front Width (in)' },
  centerDepth: { start: 6, end: 120, step: 1, label: 'Center Depth (in)' },
  backWidth: { start: 6, end: 120, step: 1, label: 'Back Width (in)' },
  totalWidth: { start: 6, end: 240, step: 1, label: 'Total Width (in)' },
  section1: { start: 6, end: 120, step: 1, label: 'Section 1 (in)' },
  section2: { start: 6, end: 120, step: 1, label: 'Section 2 (in)' },
  section3: { start: 6, end: 120, step: 1, label: 'Section 3 (in)' },
  section4: { start: 6, end: 120, step: 1, label: 'Section 4 (in)' },
  quantity: { start: 1, end: 200, step: 1, label: 'Quantity' },
};

/** Fill options */
type FillOpt = { key: string; label: string; img?: string };
const FILL_OPTIONS: FillOpt[] = [
  { key: 'High Density Foam', label: 'High Density Foam', img: '' },
  { key: 'Dry Fast Foam', label: 'Dry Fast Foam', img: '' },
  { key: 'Fiber Fill', label: 'Fiberfill', img: '' },
  { key: 'Covers Only', label: 'Covers Only', img: '' },
];

/** Zipper positions */
type ImgOpt = { key: string; label: string; img?: string };
const ZIPPER_OPTS: ImgOpt[] = [
  { key: 'Long Side', label: 'Long Side', img: '' },
  { key: 'Short Side', label: 'Short Side', img: '' },
];

/** Piping options */
const PIPING_OPTS: ImgOpt[] = [
  { key: 'No Piping', label: 'No Piping', img: '' },
  { key: 'Piping', label: 'Piping', img: '' },
];

/** Ties options */
const TIES_OPTS: ImgOpt[] = [
  { key: 'No ties', label: 'No Ties', img: '' },
  { key: '2 Side', label: '2 Side', img: '' },
  { key: '4 Side', label: '4 Side', img: '' },
  { key: '4 Corner', label: '4 Corner', img: '' },
];

/** Fabrics per row in the grid */
const FABRICS_PER_ROW = 6;
/** Initial fabric cards shown before "Load More" */
const FABRIC_INITIAL_COUNT = 54;

/* ═══════════════════════════════════════════════════════════════
   PRICING FORMULAS  (matching PHP formulas exactly)
═══════════════════════════════════════════════════════════════ */

type Dims = {
  length: number; width: number; bottomWidth: number; topWidth: number;
  thickness: number; ear: number; diameter: number;
  depth: number; height: number; seatThickness: number; backHeight: number;
  backThickness: number; frontWidth: number; centerDepth: number; backWidth: number;
  totalWidth: number; section1: number; section2: number; section3: number; section4: number;
};

type DimensionField = Exclude<keyof typeof DIM_CONFIG, 'quantity'>;

function getDimensionFields(type: string, selectedShape: string, standaloneShape = false): DimensionField[] {
  if (standaloneShape) {
    if (selectedShape === 'Trapezium') return ['length', 'bottomWidth', 'topWidth', 'thickness'];
    if (selectedShape === 'T Cushion' || selectedShape === 'L Shape') {
      return ['length', 'bottomWidth', 'topWidth', 'thickness', 'ear'];
    }
    if (selectedShape === 'Round') return ['diameter', 'thickness'];
    if (selectedShape === 'Triangle') return ['length', 'width', 'thickness'];
    return ['length', 'width', 'thickness'];
  }
  if (selectedShape === 'Trapezoid') return ['thickness', 'frontWidth', 'centerDepth', 'backWidth'];
  if (type === 'Chaise') {
    const count = selectedShape.includes('3 Break') ? 4 : selectedShape.includes('2 Break') ? 3 : 2;
    return ['thickness', 'width', ...(['section1', 'section2', 'section3', 'section4'] as const).slice(0, count)];
  }
  if (type === 'Chair') return ['seatThickness', 'width', 'depth', 'backHeight', 'backThickness'];
  if (type === 'Loveseat' || type === 'Sofa') return ['seatThickness', 'totalWidth', 'depth', 'backHeight', 'backThickness'];
  if (type === 'Bench Window Back') return ['thickness', 'width', 'height'];
  if (type === 'Bench Window Seat' || type === 'Bed Cushion' || type === 'Chair No Back') {
    if (selectedShape === 'Circle') return ['thickness', 'width'];
    return ['thickness', 'width', 'depth'];
  }
  if (type === 'Ottoman') return ['seatThickness', 'width', 'depth'];
  if (type === 'Toss Pillow' || type === 'Lumbar Pillow' || type === 'Bolster Pillow') return ['length', 'width', 'thickness'];
  if (selectedShape === 'Trapezium') return ['length', 'bottomWidth', 'topWidth', 'thickness'];
  if (selectedShape === 'Round') return ['diameter', 'thickness'];
  if (selectedShape === 'T Cushion' || selectedShape === 'L Shape') return ['length', 'bottomWidth', 'topWidth', 'thickness', 'ear'];
  if (selectedShape === 'Triangle') return ['length', 'width', 'thickness'];
  return ['length', 'width', 'thickness'];
}

function toCalculationDims(dims: Dims, type: string, selectedShape: string, standaloneShape = false): Dims {
  if (standaloneShape) return dims;
  if (selectedShape === 'Trapezoid') {
    return { ...dims, length: dims.centerDepth, bottomWidth: dims.frontWidth, topWidth: dims.backWidth };
  }
  if (type === 'Chaise') {
    const sectionCount = selectedShape.includes('3 Break') ? 4 : selectedShape.includes('2 Break') ? 3 : 2;
    const length = [dims.section1, dims.section2, dims.section3, dims.section4].slice(0, sectionCount).reduce((sum, value) => sum + value, 0);
    return { ...dims, length, thickness: dims.thickness };
  }
  if (type === 'Loveseat' || type === 'Sofa') {
    return { ...dims, length: dims.depth, width: dims.totalWidth, thickness: dims.seatThickness };
  }
  if (type === 'Chair') return { ...dims, length: dims.depth, thickness: dims.seatThickness };
  if (type === 'Ottoman') return { ...dims, length: dims.depth, thickness: dims.seatThickness };
  if (type === 'Bench Window Back') return { ...dims, length: dims.height };
  if (type === 'Bench Window Seat' || type === 'Bed Cushion' || type === 'Chair No Back') {
    if (selectedShape === 'Circle') return { ...dims, diameter: dims.width };
    return { ...dims, length: dims.depth };
  }
  return dims;
}

function calcFabricMeters(shape: string, d: Dims): number {
  const { length: F7, width: F8, bottomWidth: F32, topWidth: F33,
    thickness: F10, ear: F34, diameter: F35 } = d;
  const denom = 54 * 12 * 3;
  switch (shape) {
    case 'Rectangle':
    case 'Box':
    case 'Pillow':
      return (2 * ((F7 * F8) + (F8 * F10) + (F10 * F7))) / denom;
    case 'Trapezium': {
      const slant = Math.sqrt(Math.pow(F7, 2) + Math.pow((F32 - F33) / 2, 2));
      return (2 * ((F32 + F33) / 2) * F7 + F10 * (F32 + F33 + 2 * slant)) / denom;
    }
    case 'T Cushion':
    case 'L Shape':
      return (2 * ((F34 * F33) + (F33 * F10) + (F34 * F10) + (F10 * (F7 - F34)) + (F8 * (F7 - F34)))) / denom;
    case 'Round':
      return ((2 * Math.PI * Math.pow(F35 / 2, 2)) + (F10 * Math.PI * F35)) / denom;
    case 'Triangle':
      return (((F7 * F8) + (F7 * F10) + (F8 * F10)) + (F10 * Math.sqrt(Math.pow(F7, 2) + Math.pow(F8, 2)))) / denom;
    default: return 0;
  }
}

function calcMin(shape: string, d: Dims): number {
  const { length: F7, width: F8, bottomWidth: F32, topWidth: F33, diameter: F35 } = d;
  switch (shape) {
    case 'Rectangle': case 'Box': case 'Pillow': return Math.min(F7, F8);
    case 'Trapezium': case 'T Cushion': case 'L Shape': return Math.min(F7, F32, F33);
    case 'Round': return F35;
    case 'Triangle': return Math.min(F7, F8);
    default: return 0;
  }
}

function calcMax(shape: string, d: Dims): number {
  const { length: F7, width: F8, bottomWidth: F32, topWidth: F33, diameter: F35 } = d;
  switch (shape) {
    case 'Rectangle': case 'Box': case 'Pillow': return Math.max(F7, F8);
    case 'Trapezium': case 'T Cushion': case 'L Shape': return Math.max(F7, F32, F33);
    case 'Round': return F35;
    case 'Triangle': return Math.max(F7, F8);
    default: return 0;
  }
}

function calcSewing(perim: number, qty: number): number {
  if (perim <= 24) return 7.5 * qty;
  if (perim <= 48) return 11.25 * qty;
  if (perim <= 72) return 15 * qty;
  if (perim <= 96) return 18.75 * qty;
  if (perim <= 120) return 21.25 * qty;
  return 0;
}

function calcFiberfill(shape: string, fill: string, d: Dims, lookupDim: number, multiplierDim: number, qty: number): number {
  const { length: F7, width: F8, bottomWidth: F32, thickness: F10, diameter: F35 } = d;

  if (fill === 'High Density Foam') {
    let rate = 0;
    if (lookupDim <= 12) rate = 0.06237;
    else if (lookupDim <= 18) rate = 0.093555;
    else if (lookupDim <= 36) rate = 0.176715;
    else if (lookupDim <= 48) rate = 0.259875;
    else if (lookupDim <= 60) rate = 0.3170475;
    else if (lookupDim <= 72) rate = 0.384615;
    else if (lookupDim <= 84) rate = 0.4521825;
    else if (lookupDim <= 96) rate = 0.51975;
    else if (lookupDim <= 108) rate = 0.5873175;
    else rate = 0.654885;
    return rate * multiplierDim * F10 * qty;
  }
  if (fill === 'Dry Fast Foam') {
    let rate = 0;
    if (lookupDim <= 12) rate = 0.081081;
    else if (lookupDim <= 18) rate = 0.1216215;
    else if (lookupDim <= 36) rate = 0.2297295;
    else if (lookupDim <= 48) rate = 0.3378375;
    else if (lookupDim <= 60) rate = 0.41216175;
    else if (lookupDim <= 72) rate = 0.4999995;
    else if (lookupDim <= 84) rate = 0.58783725;
    else if (lookupDim <= 96) rate = 0.675675;
    else if (lookupDim <= 108) rate = 0.76351275;
    else rate = 0.8513505;
    return rate * multiplierDim * F10 * qty;
  }
  if (fill === 'Fiber Fill') {
    if (shape === 'Round') return F35 * F35 * F10 * 0.003 * qty;
    if (shape === 'Rectangle' || shape === 'Box' || shape === 'Triangle' || shape === 'Pillow') return F7 * F8 * F10 * 0.003 * qty;
    return F7 * F32 * F10 * 0.003 * qty;
  }
  return 0; // Covers Only
}

function calcPiping(piping: string, perim: number, qty: number): number {
  if (piping === 'No Piping' || perim === 0) return 0;
  if (perim <= 24) return 3 * qty;
  if (perim <= 48) return 6 * qty;
  if (perim <= 72) return 7.5 * qty;
  if (perim <= 96) return 9 * qty;
  return 10 * qty;
}

function calcTies(ties: string): number {
  if (ties === '2 Side') return 20;
  if (ties === '4 Side' || ties === '4 Corner') return 30;
  return 0;
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

function DimensionInput({
  field, value, onChange, label
}: {
  field: DimensionField;
  value: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  const cfg = DIM_CONFIG[field];
  return (
    <div className={styles.dimGroup}>
      <label className={`form-label ${styles.dimLabel}`}>{label ?? cfg.label}</label>
      <input
        className={`form-control ${styles.dimSelect}`}
        type="number"
        min={cfg.start}
        max={cfg.end}
        step={cfg.step}
        value={value}
        onChange={e => {
          if (e.target.value !== '') onChange(Number(e.target.value));
        }}
        onBlur={() => onChange(Math.max(cfg.start, Math.min(cfg.end, value)))}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FABRIC TYPES
═══════════════════════════════════════════════════════════════ */

interface FabricItem {
  id: string;
  fabricId: string;
  label: string;
  price: number;
  imageUrl: string;
}

interface FabricBrand {
  id: string;
  name: string;
  fabrics: FabricItem[];
}

/* ═══════════════════════════════════════════════════════════════
   HOVER PREVIEW COMPONENT
═══════════════════════════════════════════════════════════════ */

function FabricCard({
  fabric,
  selected,
  onClick,
}: {
  fabric: FabricItem;
  selected: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
      setPos({ x: e.clientX, y: e.clientY });
      setHover(true);
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <>
      <button
        className={`${styles.fabricCard} ${selected ? styles.fabricCardSelected : ''}`}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHover(false)}
        onMouseMove={handleMouseMove}
        title={fabric.label}
      >
        <div className={styles.fabricCardImgWrapper} style={{ position: 'relative' }}>
          {fabric.imageUrl ? (
            <>
              <img
                src={fabric.imageUrl}
                alt={fabric.label}
                className={styles.fabricCardImg}
                loading="lazy"
              />
              <div
                className={styles.fabricZoomBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomed(true);
                  setHover(false);
                }}
                title="Zoom Image"
              >
                ⌕
              </div>
            </>
          ) : (
            <div className={styles.fabricCardPlaceholder}>🧵</div>
          )}
        </div>

        {/* Hover popover using Portal */}
        {hover && mounted && !zoomed && createPortal(
          <div
            className={styles.fabricHoverPopup}
            style={{ top: pos.y + 16, left: pos.x + 16 }}
          >
            {fabric.imageUrl ? (
              <img src={fabric.imageUrl} alt={fabric.label} className={styles.fabricHoverImg} />
            ) : (
              <div className={styles.fabricHoverPlaceholder}>🧵</div>
            )}
            <div className={styles.fabricHoverInfo}>
              <strong>{fabric.label}</strong>
            </div>
          </div>,
          document.body
        )}
      </button>

      {/* Zoom Modal using Portal */}
      {zoomed && mounted && createPortal(
        <div className={styles.fabricZoomModal} onClick={(e) => { e.stopPropagation(); setZoomed(false); }}>
          <div className={styles.fabricZoomContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.fabricZoomClose} onClick={(e) => { e.stopPropagation(); setZoomed(false); }}>✕</button>
            {fabric.imageUrl ? (
              <img src={fabric.imageUrl} alt={fabric.label} className={styles.fabricZoomImg} />
            ) : (
              <div className={styles.fabricZoomPlaceholder}>🧵</div>
            )}
            <div className={styles.fabricZoomLabel}>{fabric.label}</div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   IMAGE-OPTION CARD
═══════════════════════════════════════════════════════════════ */

function ImgOptionCard({
  opt, selected, onClick, stepImgUrl, isAdmin, onUpload
}: {
  opt: ImgOpt | FillOpt | ShapeDef;
  selected: boolean;
  onClick: () => void;
  stepImgUrl?: string;
  isAdmin?: boolean;
  onUpload?: (f: File) => void;
}) {
  const label = opt.label;
  const img = 'img' in opt ? opt.img : undefined;
  const displayImg = stepImgUrl || img;
  const [imageSource, setImageSource] = useState(displayImg);
  const [imageFailed, setImageFailed] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImageSource(displayImg);
    setImageFailed(false);
  }, [displayImg]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpload) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <button
        type="button"
        className={`${styles.imgOptionCard} ${selected ? styles.imgOptionSelected : ''}`}
        onClick={onClick}
      >
        <div className={styles.imgOptionImgWrapper}>
          {imageSource && !imageFailed ? (
            <img
              src={imageSource}
              alt={label}
              className={styles.imgOptionImg}
              onError={() => {
                if (stepImgUrl && img && imageSource === stepImgUrl) setImageSource(img);
                else setImageFailed(true);
              }}
            />
          ) : (
            <div className={styles.imgOptionPlaceholder} style={{ backgroundColor: 'var(--gray-100)', opacity: 0.5 }}>
            </div>
          )}
        </div>
        <span className={styles.imgOptionLabel}>{label}</span>
      </button>

      {isAdmin && onUpload && (
        <div
          title="Upload image"
          aria-label="Upload image"
          style={{ position: 'absolute', top: 5, right: 5, zIndex: 10, cursor: 'pointer', background: 'white', border: '1px solid var(--gray-300)', padding: '2px 4px', borderRadius: '4px', fontSize: '10px' }}
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
        >
          📷
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function CustomizePage({ initialStepImages = {} }: { initialStepImages?: Record<string, string> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, addItem, updateItem } = useCart();
  const { items: wishlistItems } = useWishlist();
  const editItemId = searchParams.get('edit');
  const editingCartItem = editItemId ? items.find(item => item.id === editItemId && item.category === 'Custom') : undefined;
  const savedDesign = wishlistItems.find(item => item.id === searchParams.get('wishlist') && item.category === 'Custom');
  const editingDesign = editingCartItem ?? savedDesign;

  /* ── State ── */
  const [step, setStep] = useState(1);
  const topRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (topRef.current) {
      const y = topRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [step]);

  // Step 1 – Product type
  const [cushionType, setCushionType] = useState(CUSHION_TYPES[0].key);
  const [configuration, setConfiguration] = useState('');
  const [backShape, setBackShape] = useState('');
  const [seatShape, setSeatShape] = useState('');
  const [shapePart, setShapePart] = useState<'back' | 'seat'>('back');
  const [stepOneSelection, setStepOneSelection] = useState<'type' | 'shape'>('type');

  // Step 2 – read ?type= and &shape= params
  const typeParam = searchParams.get('type');
  const shapeParam = searchParams.get('shape');
  const defaultCat = CATEGORIES.find(c => c.toLowerCase().replace(/\s+/g, '-') === typeParam?.toLowerCase()) ?? 'Indoor';
  const defaultShape = SHAPES.find(s =>
    s.key.toLowerCase().replace(/\s+/g, '-') === shapeParam?.toLowerCase() ||
    s.label.toLowerCase().replace(/\s+/g, '-') === shapeParam?.toLowerCase()
  )?.key ?? STEP_TWO_SHAPES.find(s =>
    s.key.toLowerCase().replace(/\s+/g, '-') === shapeParam?.toLowerCase() ||
    s.label.toLowerCase().replace(/\s+/g, '-') === shapeParam?.toLowerCase()
  )?.key ?? 'Rectangle';
  const [category, setCategory] = useState(defaultCat);
  const [shape, setShape] = useState<string>(defaultShape);

  // Step 2 – Dimensions
  const [dims, setDims] = useState<Dims>({
    length: 20, width: 20, bottomWidth: 16, topWidth: 12,
    thickness: 3, ear: 6, diameter: 20,
    depth: 20, height: 20, seatThickness: 3, backHeight: 20, backThickness: 3,
    frontWidth: 20, centerDepth: 20, backWidth: 16, totalWidth: 60,
    section1: 20, section2: 20, section3: 20, section4: 20,
  });
  const [quantity, setQuantity] = useState(1);

  // Step 3 – Fill
  const [fill, setFill] = useState<string>('High Density Foam');

  // Step 4 – Fabric
  const [brands, setBrands] = useState<FabricBrand[]>([]);
  const [brandIdx, setBrandIdx] = useState(0);
  const [selectedFabric, setSelectedFabric] = useState<FabricItem | null>(null);
  const [fabricsShown, setFabricsShown] = useState(FABRIC_INITIAL_COUNT);
  const [fabricsLoading, setFabricsLoading] = useState(false);

  // Step 5 – Zipper
  const [zipper, setZipper] = useState<string>('Long Side');

  // Admin Auth
  const { user, refreshMedia: globalRefreshMedia } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Step 6 – Piping
  const [piping, setPiping] = useState<string>('No Piping');

  // Step 7 – Ties
  const [ties, setTies] = useState<string>('No ties');

  // Step option images (admin-uploaded)
  const [stepImages, setStepImages] = useState<Record<string, string>>(initialStepImages);
  const [stepImagesRefreshKey, setStepImagesRefreshKey] = useState(0);
  const [marginMultiplier, setMarginMultiplier] = useState(4.5);
  const [editLoaded, setEditLoaded] = useState(false);

  const visibleCushionTypes = CUSHION_TYPES.filter(type =>
    category === 'Pet Bed' ? type.key === 'Pet Bed' : type.key !== 'Pet Bed'
  );
  const isStandaloneShapeSelection = stepOneSelection === 'shape';
  const configurations = isStandaloneShapeSelection ? undefined : CONFIGURATION_SHAPE_OPTIONS[cushionType];
  const configurationNames = configurations ? Object.keys(configurations) : [];
  const selectedConfigurationShapes = configurations?.[configuration] ?? [];
  const backPieceCount = getConfigurationPieceCount(configuration, 'back');
  const seatPieceCount = getConfigurationPieceCount(configuration, 'seat');
  const activeConfigurationShapes = configurations
    ? getConfigurationPartShapes(cushionType, configuration, shapePart)
    : selectedConfigurationShapes;
  const allowedShapeNames = TYPE_SHAPE_OPTIONS[cushionType];
  const typeShapeOptions = allowedShapeNames?.map(getShapeOption);
  const visibleShapes = SHAPES.filter(s => {
    if (s.key === 'Pillow' && category !== 'Pet Bed') return false;
    if (category === 'Pet Bed') return ['Box', 'Round', 'Pillow'].includes(s.key);
    return true;
  });

  useEffect(() => {
    if (!editingDesign || editLoaded) return;
    const options = editingDesign.customOptions;
    if (!options) return;

    if (options.type) setCushionType(options.type);
    const savedConfigurations = CONFIGURATION_SHAPE_OPTIONS[options.type ?? cushionType];
    const legacyConfiguration = savedConfigurations?.[options.shape] ? options.shape : '';
    const nextConfiguration = options.configuration || legacyConfiguration || Object.keys(savedConfigurations ?? {})[0] || '';
    setConfiguration(nextConfiguration);
    if (options.category) setCategory(options.category);
    if (options.shape) {
      const allowedForConfiguration = savedConfigurations?.[nextConfiguration] ?? [];
      const nextShape = legacyConfiguration
        ? allowedForConfiguration[0]
        : (allowedForConfiguration.length && !allowedForConfiguration.includes(options.shape)
          ? allowedForConfiguration[0]
          : options.shape);
      setShape(nextShape || options.shape);
      setStepOneSelection(SHAPES.some(s => s.key === options.shape) ? 'shape' : 'type');
    }
    const savedType = options.type ?? cushionType;
    const availableBackShapes = getConfigurationPartShapes(savedType, nextConfiguration, 'back');
    const availableSeatShapes = getConfigurationPartShapes(savedType, nextConfiguration, 'seat');
    const savedBackShape = options.backShape || '';
    const savedSeatShape = options.seatShape || options.shape || '';
    // A legacy design may not have a back shape saved. Keep it unselected so the
    // customer explicitly chooses one instead of showing a misleading checkmark.
    setBackShape(savedBackShape && availableBackShapes.includes(savedBackShape) ? savedBackShape : '');
    setSeatShape(availableSeatShapes.includes(savedSeatShape) ? savedSeatShape : availableSeatShapes[0] || '');
    setShapePart(options.backShape || options.seatShape ? 'seat' : 'back');
    if (options.fill) setFill(options.fill);
    if (options.zipper) setZipper(options.zipper);
    if (options.piping) setPiping(options.piping);
    if (options.ties) setTies(options.ties);
    if (editingDesign.quantity) setQuantity(editingDesign.quantity);

    setDims(current => ({ ...current, ...parseCartDimensions(options.dimensions) }));
    setEditLoaded(true);
  }, [editingDesign, editLoaded]);

  useEffect(() => {
    if (!editingDesign || !editLoaded || brands.length === 0) return;
    const fabricName = editingDesign.customOptions?.fabric;
    if (!fabricName || fabricName === 'No fabric') return;

    for (let brandIndex = 0; brandIndex < brands.length; brandIndex += 1) {
      const fabric = brands[brandIndex].fabrics.find(f => f.label === fabricName);
      if (fabric) {
        setBrandIdx(brandIndex);
        setSelectedFabric(fabric);
        return;
      }
    }
  }, [brands, editingDesign, editLoaded]);

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory);
    setStepOneSelection('type');

    if (nextCategory === 'Pet Bed') {
      setCushionType('Pet Bed');
      if (!['Box', 'Round', 'Pillow'].includes(shape)) {
        setShape('Box');
      }
      return;
    }

    if (cushionType === 'Pet Bed') {
      handleCushionTypeSelect(CUSHION_TYPES[0].key);
    }
    if (shape === 'Pillow') {
      setShape('Rectangle');
    }
  };

  const handleCushionTypeSelect = (nextType: string) => {
    setCushionType(nextType);
    setStepOneSelection('type');
    const nextConfigurations = CONFIGURATION_SHAPE_OPTIONS[nextType];
    const nextConfiguration = Object.keys(nextConfigurations ?? {})[0] ?? '';
    setConfiguration(nextConfiguration);
    const nextShape = nextConfigurations?.[nextConfiguration]?.[0]
      ?? TYPE_SHAPE_OPTIONS[nextType]?.[0]
      ?? (nextType === 'Pet Bed' ? 'Box' : 'Rectangle');
    setShape(nextShape);
    setBackShape('');
    setSeatShape('');
    setShapePart('back');
  };

  const handleConfigurationSelect = (nextConfiguration: string) => {
    setConfiguration(nextConfiguration);
    const firstShape = CONFIGURATION_SHAPE_OPTIONS[cushionType]?.[nextConfiguration]?.[0];
    if (firstShape) {
      setBackShape('');
      setSeatShape('');
      setShape(firstShape);
      setShapePart('back');
    }
  };

  /* ── Fetch fabrics ── */
  useEffect(() => {
    setFabricsLoading(true);
    fetch('/api/fabrics')
      .then(r => r.json())
      .then((data: FabricBrand[]) => {
        if (Array.isArray(data)) setBrands(data);
      })
      .catch(console.error)
      .finally(() => setFabricsLoading(false));
  }, []);

  /* ── Fetch step images ── */
  useEffect(() => {
    fetch('/api/media')
      .then(r => r.json())
      .then((items: { key: string; url: string }[]) => {
        const map: Record<string, string> = {};
        items.forEach(item => {
          // Allow identifying uploaded option media by their normalized key.
          const key = item.key.replace(/^(type|shape|fill|zipper|piping|ties)_/, '').toLowerCase();
          map[key] = item.url;
        });
        setStepImages(map);
      })
      .catch(() => { });
  }, [stepImagesRefreshKey]);

  /* ── Fetch calculator margin ── */
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        const nextMargin = Number(data.calculatorMarginMultiplier ?? data.marginMultiplier);
        if (Number.isFinite(nextMargin) && nextMargin > 0) {
          setMarginMultiplier(nextMargin);
        }
      })
      .catch(() => { });
  }, []);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      Object.values(stepImages).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  /* ── Is throw pillow? ── */
  const calculatorShape = getCalculatorShape(shape);
  const shapeDisplayLabel = getShapeDisplayLabel(shape);
  const dimensionFields = getDimensionFields(cushionType, shape, isStandaloneShapeSelection);
  const calculationDims = toCalculationDims(dims, cushionType, shape, isStandaloneShapeSelection);
  const isThrowPillow = calculatorShape === 'Rectangle' || calculatorShape === 'Pillow';

  /* ── Ensure fill is valid for shape ── */
  useEffect(() => {
    if (isThrowPillow) {
      if (fill === 'High Density Foam' || fill === 'Dry Fast Foam') {
        setFill('Fiber Fill');
      }
    }
  }, [calculatorShape, isThrowPillow]);

  /* ── PRICE COMPUTATION ── */
  const lookupDim = calcMax(calculatorShape, calculationDims); // Q8/Q4: max dimension used for lookups
  const multiplierDim = calcMin(calculatorShape, calculationDims); // R8/R4: min dimension used as multiplier
  const fabricMeters = calcFabricMeters(calculatorShape, calculationDims);
  const sewingCost = calcSewing(lookupDim, quantity);
  const fiberfillCost = calcFiberfill(calculatorShape, fill, calculationDims, lookupDim, multiplierDim, quantity);
  const pipingCost = calcPiping(piping, lookupDim, quantity);
  const tiesCost = calcTies(ties);
  const fabricCost = selectedFabric ? selectedFabric.price * fabricMeters * quantity : 0;
  const baseCostSum = sewingCost + fiberfillCost + pipingCost + fabricCost;
  const totalPrice = (baseCostSum * marginMultiplier) + tiesCost;

  /* ── Active brand fabrics ── */
  const currentBrand = brands[brandIdx];
  const visibleFabrics = currentBrand?.fabrics.slice(0, fabricsShown) ?? [];

  const handleImageUpload = async (key: string, file: File) => {
    // INSTANT UPDATE: Create object URL immediately for instant preview
    const objectUrl = URL.createObjectURL(file);
    const normalizedKey = optionKey(key);

    // Show image immediately
    setStepImages(prev => ({
      ...prev,
      [normalizedKey]: objectUrl
    }));

    const fd = new FormData();
    fd.append('file', file);
    // Determine type string for DB
    let prefix = 'shape_';
    if (CUSHION_TYPES.find(f => f.key === key)) prefix = 'type_';
    if (FILL_OPTIONS.find(f => f.key === key)) prefix = 'fill_';
    if (ZIPPER_OPTS.find(f => f.key === key)) prefix = 'zipper_';
    if (PIPING_OPTS.find(f => f.key === key)) prefix = 'piping_';
    if (TIES_OPTS.find(f => f.key === key)) prefix = 'ties_';

    fd.append('key', `${prefix}${normalizedKey}`);
    fd.append('type', 'image');

    try {
      const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      // Replace object URL with actual uploaded URL
      URL.revokeObjectURL(objectUrl);
      setStepImages(prev => ({
        ...prev,
        [normalizedKey]: data.url
      }));

      // Trigger refresh for all step images
      setStepImagesRefreshKey(prev => prev + 1);
      // Trigger global refresh for all media components
      if (globalRefreshMedia) globalRefreshMedia();
    } catch (err: unknown) {
      // Upload failed - revert to previous state
      URL.revokeObjectURL(objectUrl);
      setStepImages(prev => {
        const newState = { ...prev };
        delete newState[normalizedKey];
        return newState;
      });
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  /* ── Add to cart ── */

  const buildCartDetails = () => ({
    type: cushionType,
    configuration,
    ...(configurations ? { backShape, seatShape } : {}),
    category,
    shape,
    fill,
    zipper,
    piping,
    ties,
    fabric: selectedFabric?.label ?? 'No fabric',
    fabricMeters: fabricMeters.toFixed(3),
    dimensions: buildDimString(),
  });

  const buildDimString = () => {
    return dimensionFields.map(field => {
      const isShapeHeight = isStandaloneShapeSelection
        && (shape === 'T Cushion' || shape === 'L Shape')
        && field === 'thickness';
      const label = isShapeHeight ? 'Height' : DIM_CONFIG[field].label.replace(/ \(in\)$/, '');
      return `${label}: ${dims[field]}"`;
    }).join(', ');
  };

  const handleAddToCart = () => {
    if (!selectedFabric) {
      alert('Please select a fabric before adding to cart.');
      return;
    }
    const cartId = editingCartItem?.id ?? `custom-${Date.now()}`;
    const shapeImgKey = optionKey(shape);
    const displayImage = stepImages[shapeImgKey] || '';

    const nextItem = {
      id: cartId,
      name: `Custom ${cushionType}`,
      price: Math.max(totalPrice, 0),
      quantity,
      image: displayImage,
      category: 'Custom',
      customOptions: buildCartDetails() as Record<string, string>,
    };

    if (editingCartItem) {
      updateItem(editingCartItem.id, nextItem);
    } else {
      addItem(nextItem);
    }
    router.push('/cart');
  };

  const handleBuyNow = () => {
    if (!selectedFabric) {
      alert('Please select a fabric before proceeding.');
      return;
    }
    const cartId = `custom-${Date.now()}`;
    const shapeImgKey = optionKey(shape);
    const displayImage = stepImages[shapeImgKey] || '';

    addItem({
      id: cartId,
      name: `Custom ${cushionType}`,
      price: Math.max(totalPrice, 0),
      quantity,
      image: displayImage,
      category: 'Custom',
      customOptions: buildCartDetails() as Record<string, string>,
    });
    router.push('/cart?checkout=1');
  };

  const canGoNext = () => {
    if (step === 5 && !selectedFabric) return false;
    return true;
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div className={styles.page}>
      <div className="container">

        {/* Header */}
        <div className={styles.header}>
          <span className="badge">Custom Builder</span>
          <h1>Design Your Perfect Cushion</h1>
          <p>Step-by-step customization — real-time pricing as you build.</p>
        </div>

        {/* Progress bar */}
        <div className={styles.progress} ref={topRef}>
          {STEP_LABELS.map((s, i) => (
            <button
              key={i}
              className={`${styles.progressStep} ${step === i + 1 ? styles.active : ''} ${step > i + 1 ? styles.done : ''}`}
              onClick={() => {
                if (i + 1 > 5 && !selectedFabric) {
                  alert('Please select a fabric before proceeding.');
                  return;
                }
                setStep(i + 1);
              }}
            >
              <span className={styles.stepNum}>{step > i + 1 ? '✓' : i + 1}</span>
              <span className={styles.stepLabel}>{s}</span>
            </button>
          ))}
        </div>

        <div className={styles.layout}>
          {/* ── Left: step content ── */}
          <div className={styles.steps}>

            {/* STEP 1 – Type */}
            {step === 1 && (
              <div className={styles.stepContent}>
                <h2>Type</h2>

                <div className="form-group">
                  <label className="form-label">Cushion Category</label>
                  <div className={styles.optionGrid}>
                    {CATEGORIES.map(c => (
                      <button
                        key={c}
                        className={`${styles.optionBtn} ${category === c ? styles.selected : ''}`}
                        onClick={() => handleCategoryChange(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cushion Type</label>
                </div>

                <div className={styles.imgOptGrid}>
                  {visibleCushionTypes.map(opt => {
                    const imgKey = optionKey(opt.key);
                    const imgUrl = stepImages[imgKey];
                    return (
                      <ImgOptionCard
                        key={opt.key}
                        opt={opt}
                        selected={stepOneSelection === 'type' && cushionType === opt.key}
                        onClick={() => {
                          handleCushionTypeSelect(opt.key);
                        }}
                        stepImgUrl={imgUrl}
                        isAdmin={isAdmin}
                        onUpload={(f) => handleImageUpload(opt.key, f)}
                      />
                    );
                  })}

                  {visibleShapes.map(s => {
                    const imgKey = optionKey(s.key);
                    const imgUrl = stepImages[imgKey];
                    return (
                      <div key={s.key} className={styles.shapeCard} style={{ position: 'relative' }}>
                        <ImgOptionCard
                          opt={s}
                          selected={stepOneSelection === 'shape' && shape === s.key}
                          onClick={() => {
                            setShape(s.key);
                            setStepOneSelection('shape');
                          }}
                          stepImgUrl={imgUrl}
                          isAdmin={isAdmin}
                          onUpload={(f) => handleImageUpload(s.key, f)}
                        />
                      </div>
                    );
                  })}
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setStep(stepOneSelection === 'shape' ? 3 : 2)}
                  id="step1-next"
                >
                  {stepOneSelection === 'shape' ? 'Next: Dimensions →' : 'Next: Shape →'}
                </button>
              </div>
            )}

            {/* STEP 2 – Category & Shape */}
            {step === 2 && (
              <div className={styles.stepContent}>
                <h2>Shape</h2>

                {configurations ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Configuration</label>
                      <div className={styles.imgOptGrid}>
                        {configurationNames.map(name => {
                          const option = getShapeOption(name);
                          return (
                            <ImgOptionCard
                              key={name}
                              opt={option}
                              selected={configuration === name}
                              onClick={() => handleConfigurationSelect(name)}
                              stepImgUrl={stepImages[optionKey(name)]}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="form-group">
                      <div className={styles.shapePartHeader}>
                        <span className="form-label">Corner Style</span>
                        <div className={styles.shapePartTabs} role="tablist" aria-label="Choose back or seat shape">
                          <button
                            type="button"
                            role="tab"
                            aria-selected={shapePart === 'back'}
                            className={`btn btn-sm ${shapePart === 'back' ? 'btn-primary' : 'btn-outline'} ${styles.shapePartTab}`}
                            onClick={() => setShapePart('back')}
                          >
                            Back Shape{backShape && <span className={styles.shapePartCheck} aria-label="selected">✓</span>}
                          </button>
                          <button
                            type="button"
                            role="tab"
                            aria-selected={shapePart === 'seat'}
                            disabled={!backShape}
                            className={`btn btn-sm ${shapePart === 'seat' ? 'btn-primary' : 'btn-outline'} ${styles.shapePartTab}`}
                            onClick={() => setShapePart('seat')}
                          >
                            Seat Shape{seatShape && <span className={styles.shapePartCheck} aria-label="selected">✓</span>}
                          </button>
                        </div>
                      </div>
                      <p className={styles.shapePartHint}>
                        {!backShape
                          ? `Choose a shape for ${backPieceCount} back cushion${backPieceCount === 1 ? '' : 's'}.`
                          : !seatShape
                            ? `Back shape selected for ${backPieceCount} cushion${backPieceCount === 1 ? '' : 's'}. Now choose a shape for ${seatPieceCount} seat cushion${seatPieceCount === 1 ? '' : 's'}.`
                            : `Back shape: ${backPieceCount} cushion${backPieceCount === 1 ? '' : 's'}; seat shape: ${seatPieceCount} cushion${seatPieceCount === 1 ? '' : 's'}.`}
                      </p>
                      <div className={styles.imgOptGrid}>
                        {activeConfigurationShapes.map(name => {
                          const option = {
                            ...getShapeOption(name),
                            img: getConfigurationShapePreview(
                              name,
                              shapePart === 'back' ? backPieceCount : seatPieceCount,
                              shapePart
                            ),
                          };
                          const selectedPartShape = shapePart === 'back' ? backShape : seatShape;
                          return (
                            <ImgOptionCard
                              key={name}
                              opt={option}
                              selected={selectedPartShape === name}
                              onClick={() => {
                                if (shapePart === 'back') {
                                  setBackShape(name);
                                  setShapePart('seat');
                                }
                                else {
                                  setSeatShape(name);
                                  setShape(name);
                                }
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Shape</label>
                    <div className={styles.imgOptGrid}>
                      {(typeShapeOptions ?? STEP_TWO_SHAPES).map(shapeOption => (
                        <ImgOptionCard
                          key={shapeOption.key}
                          opt={shapeOption}
                          selected={shape === shapeOption.key}
                          onClick={() => setShape(shapeOption.key)}
                          stepImgUrl={stepImages[optionKey(shapeOption.key)]}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.btnRow}>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setStep(3)}
                    id="step2-next"
                    disabled={Boolean(configurations && (!backShape || !seatShape))}
                  >Next: Dimensions →</button>
                </div>
              </div>
            )}

            {/* STEP 3 – Dimensions (shape-specific) */}
            {step === 3 && (
              <div className={styles.stepContent}>
                <h2 style={{ marginBottom: '0.5rem', marginTop: 0 }}>Dimensions</h2>
                <p className={styles.stepSubtext} style={{ marginTop: 0, marginBottom: '1rem' }}>
                  Configuring for: <strong style={{ color: 'var(--brand-primary)' }}>{shapeDisplayLabel}</strong>
                </p>
                {configurations && stepOneSelection !== 'shape' ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                    {([
                      { part: 'back' as const, label: `Back cushions (${backPieceCount})`, selectedShape: backShape, count: backPieceCount },
                      { part: 'seat' as const, label: `Seat cushions (${seatPieceCount})`, selectedShape: seatShape, count: seatPieceCount },
                    ]).map(preview => (
                      <div key={preview.part} style={{ width: '100%', maxWidth: '320px', backgroundColor: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem' }}>
                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{preview.label}: {preview.selectedShape}</strong>
                        <img
                          src={getConfigurationShapePreview(preview.selectedShape, preview.count, preview.part)}
                          alt={`${preview.label}, ${preview.selectedShape}`}
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '0.5rem', marginBottom: '1.5rem' }}>
                    <img
                      src={stepImages[optionKey(shape)] || getShapeOption(shape).img || getBasicShapePreview(shape)}
                      alt={shape}
                      onError={event => {
                        const fallback = getShapeOption(shape).img || getBasicShapePreview(shape);
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallback;
                      }}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                )}

                <div className={styles.dimsGrid}>
                  {dimensionFields.map(field => (
                    <DimensionInput
                      key={field}
                      field={field}
                      value={dims[field]}
                      label={isStandaloneShapeSelection && (shape === 'T Cushion' || shape === 'L Shape') && field === 'thickness' ? 'Height (in)' : undefined}
                      onChange={value => setDims(current => ({ ...current, [field]: value }))}
                    />
                  ))}
                </div>

                {/* Fabric Meters (calculated, read-only) */}
                {/* <div className={styles.calcField}>
                  <span className={styles.calcFieldLabel}>Fabric Meters (calculated)</span>
                  <span className={styles.calcFieldValue}>{fabricMeters.toFixed(4)} m</span>
                </div> */}

                {/* Quantity */}
                <div className={styles.qtyRow}>
                  <label className="form-label">Quantity</label>
                  <div className={styles.qtyControl}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    >−</button>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, +e.target.value))}
                      className={`form-control ${styles.qtyInput}`}
                    />
                    <button
                      className={styles.qtyBtn}
                      onClick={() => setQuantity(q => Math.min(200, q + 1))}
                    >+</button>
                  </div>
                </div>

                <div className={styles.btnRow}>
                  <button className="btn btn-outline" onClick={() => setStep(stepOneSelection === 'shape' ? 1 : 2)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(4)} id="step3-next">Next: Fill Type →</button>
                </div>
              </div>
            )}

            {/* STEP 4 – Fill Type */}
            {step === 4 && (
              <div className={styles.stepContent}>
                <h2>Fill Type</h2>
                <div className={styles.imgOptGrid}>
                  {FILL_OPTIONS.map(opt => {
                    const imgUrl = stepImages[opt.key.toLowerCase().replace(/ /g, '_')];
                    const isRestrictedFoam = opt.key === 'High Density Foam' || opt.key === 'Dry Fast Foam';
                    if (isThrowPillow && isRestrictedFoam) return null;

                    return (
                      <div key={opt.key} style={{ position: 'relative' }}>
                        <ImgOptionCard
                          opt={opt}
                          selected={fill === opt.key}
                          onClick={() => setFill(opt.key)}
                          stepImgUrl={imgUrl}
                          isAdmin={isAdmin}
                          onUpload={(f) => handleImageUpload(opt.key, f)}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className={styles.btnRow}>
                  <button className="btn btn-outline" onClick={() => setStep(3)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(5)} id="step4-next">Next: Fabric →</button>
                </div>
              </div>
            )}

            {/* STEP 5 – Fabric Brand & Swatches */}
            {step === 5 && (
              <div className={styles.stepContent}>
                <h2>Select Fabric</h2>

                {fabricsLoading ? (
                  <div className={styles.loadingMsg}>Loading fabrics…</div>
                ) : brands.length === 0 ? (
                  <div className={styles.emptyMsg}>
                    No fabrics uploaded yet. An admin needs to upload fabric collections.
                  </div>
                ) : (
                  <>
                    {/* Brand tabs */}
                    <div className={styles.brandTabs}>
                      {brands.map((b, i) => (
                        <button
                          key={b.id}
                          className={`${styles.brandTab} ${brandIdx === i ? styles.brandTabActive : ''}`}
                          onClick={() => { setBrandIdx(i); setFabricsShown(FABRIC_INITIAL_COUNT); }}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>

                    {/* Fabric grid */}
                    <div
                      className={styles.fabricGrid}
                      style={{ '--fab-cols': FABRICS_PER_ROW } as React.CSSProperties}
                    >
                      {visibleFabrics.map(f => (
                        <FabricCard
                          key={f.id}
                          fabric={f}
                          selected={selectedFabric?.id === f.id}
                          onClick={() => setSelectedFabric(f)}
                        />
                      ))}
                    </div>

                    {currentBrand && currentBrand.fabrics.length > fabricsShown && (
                      <button
                        className={`btn btn-outline ${styles.loadMoreBtn}`}
                        onClick={() => setFabricsShown(n => n + FABRIC_INITIAL_COUNT)}
                      >
                        Load More ({currentBrand.fabrics.length - fabricsShown} remaining)
                      </button>
                    )}

                    {!selectedFabric && (
                      <p className={styles.selectHint}>Select a fabric to continue</p>
                    )}
                  </>
                )}

                <div className={styles.btnRow}>
                  <button className="btn btn-outline" onClick={() => setStep(4)}>← Back</button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (!selectedFabric) {
                        alert('Please select a fabric to continue.');
                        return;
                      }
                      setStep(6);
                    }}
                    id="step5-next"
                  >
                    Next: Zipper →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6 – Zipper */}
            {step === 6 && (
              <div className={styles.stepContent}>
                <h2>Zipper Position</h2>
                <div className={styles.imgOptGrid}>
                  {ZIPPER_OPTS.map(opt => {
                    const imgUrl = stepImages[opt.key.toLowerCase().replace(/ /g, '_')];
                    return (
                      <div key={opt.key} style={{ position: 'relative' }}>
                        <ImgOptionCard
                          opt={opt}
                          selected={zipper === opt.key}
                          onClick={() => setZipper(opt.key)}
                          stepImgUrl={imgUrl}
                          isAdmin={isAdmin}
                          onUpload={(f) => handleImageUpload(opt.key, f)}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className={styles.btnRow}>
                  <button className="btn btn-outline" onClick={() => setStep(5)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(7)} id="step6-next">Next: Piping →</button>
                </div>
              </div>
            )}

            {/* STEP 7 – Piping */}
            {step === 7 && (
              <div className={styles.stepContent}>
                <h2>Piping</h2>
                <div className={styles.imgOptGrid}>
                  {PIPING_OPTS.map(opt => {
                    const imgUrl = stepImages[opt.key.toLowerCase().replace(/ /g, '_')];
                    return (
                      <div key={opt.key} style={{ position: 'relative' }}>
                        <ImgOptionCard
                          opt={opt}
                          selected={piping === opt.key}
                          onClick={() => setPiping(opt.key)}
                          stepImgUrl={imgUrl}
                          isAdmin={isAdmin}
                          onUpload={(f) => handleImageUpload(opt.key, f)}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className={styles.btnRow}>
                  <button className="btn btn-outline" onClick={() => setStep(6)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(8)} id="step7-next">Next: Ties →</button>
                </div>
              </div>
            )}

            {/* STEP 8 – Ties + Final CTA */}
            {step === 8 && (
              <div className={styles.stepContent}>
                <h2>Ties</h2>
                <div className={styles.imgOptGrid}>
                  {TIES_OPTS.map(opt => {
                    const imgUrl = stepImages[opt.key.toLowerCase().replace(/ /g, '_')];
                    return (
                      <div key={opt.key} style={{ position: 'relative' }}>
                        <ImgOptionCard
                          opt={opt}
                          selected={ties === opt.key}
                          onClick={() => setTies(opt.key)}
                          stepImgUrl={imgUrl}
                          isAdmin={isAdmin}
                          onUpload={(f) => handleImageUpload(opt.key, f)}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className={styles.summary}>
                  <h3>Order Summary</h3>
                  <div className={styles.summaryRows}>
                    <div><span>Type</span><strong>{cushionType}</strong></div>
                    <div><span>Category</span><strong>{category}</strong></div>
                    {configuration && <div><span>Configuration</span><strong>{configuration}</strong></div>}
                    {configurations ? (
                      <>
                        <div><span>Back Shape</span><strong>{backShape}</strong></div>
                        <div><span>Seat Shape</span><strong>{seatShape}</strong></div>
                      </>
                    ) : <div><span>Shape</span><strong>{shapeDisplayLabel}</strong></div>}
                    <div><span>Dimensions</span><strong>{buildDimString()}</strong></div>
                    {/* <div><span>Fabric Meters</span><strong>{fabricMeters.toFixed(4)} m</strong></div> */}
                    <div><span>Fill</span><strong>{fill}</strong></div>
                    <div><span>Fabric</span><strong>{selectedFabric?.label ?? '—'}</strong></div>
                    <div><span>Zipper</span><strong>{zipper}</strong></div>
                    <div><span>Piping</span><strong>{piping}</strong></div>
                    <div><span>Ties</span><strong>{ties}</strong></div>
                    <div><span>Quantity</span><strong>{quantity}</strong></div>
                  </div>
                </div>

                <div className={styles.btnRow}>
                  <button className="btn btn-outline" onClick={() => setStep(7)}>← Back</button>
                </div>
              </div>
            )}

          </div>

          {/* ── Right: Floating Price Box ── */}
          <div className={styles.priceCard}>
            <div className={styles.priceHeader}>
              {/* <span>💰</span> */}
              <h3>Live Price Estimate</h3>
            </div>

            {/* Selected fabric preview */}
            {selectedFabric && (
              <div className={styles.fabricPreview}>
                {selectedFabric.imageUrl ? (
                  <img src={selectedFabric.imageUrl} alt={selectedFabric.label} className={styles.fabricPreviewSwatch} />
                ) : (
                  <div className={styles.fabricPreviewPlaceholder}>🧵</div>
                )}
                <div>
                  <strong>{selectedFabric.label}</strong>
                  <p>Selected</p>
                </div>
              </div>
            )}

            <div className={styles.priceRows}>
              {isAdmin && (
                <>
                  {sewingCost > 0 && (
                    <div>
                      <span>Sewing</span>
                      <span>${sewingCost.toFixed(2)}</span>
                    </div>
                  )}
                  {fiberfillCost > 0 && (
                    <div>
                      <span>{fill}</span>
                      <span>${fiberfillCost.toFixed(2)}</span>
                    </div>
                  )}
                  {pipingCost > 0 && (
                    <div>
                      <span>Piping</span>
                      <span>${pipingCost.toFixed(2)}</span>
                    </div>
                  )}
                  {tiesCost > 0 && (
                    <div>
                      <span>Ties ({ties})</span>
                      <span>${tiesCost.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              <div>
                <span>Qty × {quantity}</span>
                <span></span>
              </div>
            </div>

            <div className={styles.priceTotal}>
              <span>Estimated Total</span>
              <strong>${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>

            <div className={styles.priceNote}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Pricing is an estimate. Final Price confirmed on order.
            </div>

            <div className={styles.badges}>
              <span> Perfect Fit</span>
              <span> Free Shipping</span>
              <span> Secure</span>
            </div>

            {/* Trust Badges / Brand Images (Update the src URLs with your own images) */}
            <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1.5px solid var(--gray-100)', flexWrap: 'wrap' }}>
              <img src="https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/sunbrella/home_brand_sunbrella_1776419492154.webp" alt="Brand Partner 1" style={{ height: '28px', width: 'auto', objectFit: 'contain', opacity: 0.8 }} />
              {/* <img src="/images/placeholder-brand.webp" alt="Brand Partner 2" style={{ height: '28px', width: 'auto', objectFit: 'contain', opacity: 0.8 }} />
              <img src="/images/placeholder-brand.webp" alt="Brand Partner 3" style={{ height: '28px', width: 'auto', objectFit: 'contain', opacity: 0.8 }} /> */}
            </div>

            {step === 8 && (
              <div className={styles.priceCTAs}>
                <WishlistButton disabled={!selectedFabric} item={{
                  id: 'custom-design',
                  name: `Custom ${cushionType}`, price: Math.max(totalPrice, 0), quantity,
                  image: stepImages[optionKey(shape)] || '', category: 'Custom', customOptions: buildCartDetails(),
                }} />
                <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleAddToCart}>
                  {editingCartItem ? 'Update Design' : 'Add to Cart'}
                </button>
                {!editingCartItem && (
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: '.5rem' }} onClick={handleBuyNow}>
                    Buy Now
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
