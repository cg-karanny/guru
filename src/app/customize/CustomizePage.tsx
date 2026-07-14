'use client';

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

/** Shapes with display name (used in DB shape field) */
type ShapeDef = { key: string; label: string; icon?: string };
const SHAPES: ShapeDef[] = [
  { key: 'Rectangle', label: 'Throw Pillow' },
  { key: 'Box', label: 'Rectangle' },
  { key: 'Trapezium', label: 'Trapezium' },
  { key: 'T Cushion', label: 'T Shape' },
  { key: 'L Shape', label: 'L Shape' },
  { key: 'Triangle', label: 'Triangle' },
  { key: 'Round', label: 'Round' },
  { key: 'Pillow', label: 'Pillow' },
];

/** Dimension dropdown ranges  (start, end, step in inches) */
const DIM_CONFIG = {
  length: { start: 6, end: 120, step: 1, label: 'Length (in)' },
  width: { start: 6, end: 120, step: 1, label: 'Width (in)' },
  bottomWidth: { start: 6, end: 120, step: 1, label: 'Bottom Width (in)' },
  topWidth: { start: 6, end: 120, step: 1, label: 'Top Width (in)' },
  thickness: { start: 1, end: 12, step: 0.5, label: 'Thickness (in)' },
  ear: { start: 2, end: 24, step: 1, label: 'Ear (in)' },
  diameter: { start: 6, end: 120, step: 1, label: 'Diameter (in)' },
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
};

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
      const slant = Math.sqrt(Math.pow(F7, 2) + Math.pow(F32 - F33, 2));
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

function range(start: number, end: number, step: number): number[] {
  const arr: number[] = [];
  for (let v = start; v <= end; v = Math.round((v + step) * 1000) / 1000) arr.push(v);
  return arr;
}

function DimSelect({
  field, value, onChange
}: {
  field: keyof typeof DIM_CONFIG;
  value: number;
  onChange: (v: number) => void;
}) {
  const cfg = DIM_CONFIG[field];
  const opts = range(cfg.start, cfg.end, cfg.step);
  return (
    <div className={styles.dimGroup}>
      <label className={`form-label ${styles.dimLabel}`}>{cfg.label}</label>
      <select
        className={`form-control ${styles.dimSelect}`}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      >
        {opts.map(v => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
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
    setMounted(true);
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpload) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'contents' }}>
      <button
        className={`${styles.imgOptionCard} ${selected ? styles.imgOptionSelected : ''}`}
        onClick={onClick}
      >
        <div className={styles.imgOptionImgWrapper}>
          {displayImg ? (
            <img src={displayImg} alt={label} className={styles.imgOptionImg} />
          ) : (
            <div className={styles.imgOptionPlaceholder} style={{ backgroundColor: 'var(--gray-100)', opacity: 0.5 }}>
            </div>
          )}
        </div>
        <span className={styles.imgOptionLabel}>{label}</span>
      </button>

      {isAdmin && (
        <div
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
  const { addItem } = useCart();

  /* ── State ── */
  const [step, setStep] = useState(1);
  const topRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (topRef.current) {
      const y = topRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [step]);

  // Step 1 – read ?type= and &shape= params
  const typeParam = searchParams.get('type');
  const shapeParam = searchParams.get('shape');
  const defaultCat = CATEGORIES.find(c => c.toLowerCase().replace(/\s+/g, '-') === typeParam?.toLowerCase()) ?? 'Indoor';
  const defaultShape = SHAPES.find(s =>
    s.key.toLowerCase().replace(/\s+/g, '-') === shapeParam?.toLowerCase() ||
    s.label.toLowerCase().replace(/\s+/g, '-') === shapeParam?.toLowerCase()
  )?.key ?? 'Rectangle';
  const [category, setCategory] = useState(defaultCat);
  const [shape, setShape] = useState<string>(defaultShape);

  // Step 2 – Dimensions
  const [dims, setDims] = useState<Dims>({
    length: 20, width: 20, bottomWidth: 16, topWidth: 12,
    thickness: 3, ear: 6, diameter: 20,
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
          // Allow identifying shapes, fills, zippers, pipings, ties by their normalized key
          const key = item.key.replace(/^(shape|fill|zipper|piping|ties)_/, '').toLowerCase();
          map[key] = item.url;
        });
        setStepImages(map);
      })
      .catch(() => { });
  }, [stepImagesRefreshKey]);

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
  const isThrowPillow = shape === 'Rectangle' || shape === 'Pillow';

  /* ── Ensure fill is valid for shape ── */
  useEffect(() => {
    if (isThrowPillow) {
      if (fill === 'High Density Foam' || fill === 'Dry Fast Foam') {
        setFill('Fiber Fill');
      }
    }
  }, [shape, isThrowPillow]);

  /* ── PRICE COMPUTATION ── */
  const lookupDim = calcMax(shape, dims); // Q8/Q4: max dimension used for lookups
  const multiplierDim = calcMin(shape, dims); // R8/R4: min dimension used as multiplier
  const fabricMeters = calcFabricMeters(shape, dims);
  const sewingCost = calcSewing(lookupDim, quantity);
  const fiberfillCost = calcFiberfill(shape, fill, dims, lookupDim, multiplierDim, quantity);
  const pipingCost = calcPiping(piping, lookupDim, quantity);
  const tiesCost = calcTies(ties);
  const fabricCost = selectedFabric ? selectedFabric.price * fabricMeters * quantity : 0;
  const baseCostSum = sewingCost + fiberfillCost + pipingCost + fabricCost;
  const totalPrice = (baseCostSum * 4.5) + tiesCost;

  /* ── Active brand fabrics ── */
  const currentBrand = brands[brandIdx];
  const visibleFabrics = currentBrand?.fabrics.slice(0, fabricsShown) ?? [];

  const handleImageUpload = async (key: string, file: File) => {
    // INSTANT UPDATE: Create object URL immediately for instant preview
    const objectUrl = URL.createObjectURL(file);
    const normalizedKey = key.toLowerCase().replace(/ /g, '_');

    // Show image immediately
    setStepImages(prev => ({
      ...prev,
      [normalizedKey]: objectUrl
    }));

    const fd = new FormData();
    fd.append('file', file);
    // Determine type string for DB
    let prefix = 'shape_';
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
    } catch (err: any) {
      // Upload failed - revert to previous state
      URL.revokeObjectURL(objectUrl);
      setStepImages(prev => {
        const newState = { ...prev };
        delete newState[normalizedKey];
        return newState;
      });
      alert(`Upload failed: ${err.message}`);
    }
  };

  /* ── Add to cart ── */

  const buildCartDetails = () => ({
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
    switch (shape) {
      case 'Rectangle':
      case 'Box':
      case 'Pillow':
        return `Length: ${dims.length}", Width: ${dims.width}", Thickness: ${dims.thickness}"`;
      case 'Trapezium':
        return `Length: ${dims.length}", Bottom Width: ${dims.bottomWidth}", Top Width: ${dims.topWidth}", Thickness: ${dims.thickness}"`;
      case 'T Cushion':
      case 'L Shape':
        return `Length: ${dims.length}", Bottom Width: ${dims.bottomWidth}", Top Width: ${dims.topWidth}", Thickness: ${dims.thickness}", Ear: ${dims.ear}"`;
      case 'Round':
        return `Diameter: ${dims.diameter}", Thickness: ${dims.thickness}"`;
      case 'Triangle':
        return `Length: ${dims.length}", Width: ${dims.width}", Thickness: ${dims.thickness}"`;
      default:
        return '';
    }
  };

  const handleAddToCart = () => {
    if (!selectedFabric) {
      alert('Please select a fabric before adding to cart.');
      return;
    }
    const cartId = `custom-${Date.now()}`;
    const shapeImgKey = shape.toLowerCase().replace(/ /g, '_');
    const displayImage = stepImages[shapeImgKey] || '';

    addItem({
      id: cartId,
      name: `Custom ${SHAPES.find(s => s.key === shape)?.label ?? shape} Cushion`,
      price: Math.max(totalPrice, 0),
      quantity,
      image: displayImage,
      category: 'Custom',
      customOptions: buildCartDetails() as Record<string, string>,
    });
    router.push('/cart');
  };

  const handleBuyNow = () => {
    if (!selectedFabric) {
      alert('Please select a fabric before proceeding.');
      return;
    }
    const cartId = `custom-${Date.now()}`;
    const shapeImgKey = shape.toLowerCase().replace(/ /g, '_');
    const displayImage = stepImages[shapeImgKey] || '';

    addItem({
      id: cartId,
      name: `Custom ${SHAPES.find(s => s.key === shape)?.label ?? shape} Cushion`,
      price: Math.max(totalPrice, 0),
      quantity,
      image: displayImage,
      category: 'Custom',
      customOptions: buildCartDetails() as Record<string, string>,
    });
    router.push('/cart?checkout=1');
  };

  const canGoNext = () => {
    if (step === 4 && !selectedFabric) return false;
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
                if (i + 1 > 4 && !selectedFabric) {
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

            {/* STEP 1 – Category & Shape */}
            {step === 1 && (
              <div className={styles.stepContent}>
                <h2>Type &amp; Shape</h2>

                <div className="form-group">
                  <label className="form-label">Cushion Type</label>
                  <div className={styles.optionGrid}>
                    {CATEGORIES.map(c => (
                      <button
                        key={c}
                        className={`${styles.optionBtn} ${category === c ? styles.selected : ''}`}
                        onClick={() => setCategory(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Shape</label>
                  <div className={styles.shapeGrid}>
                    {SHAPES.filter(s => {
                      if (s.key === 'Pillow' && category !== 'Pet Bed') return false;
                      if (category === 'Pet Bed') return ['Box', 'Round', 'Pillow'].includes(s.key);
                      return true;
                    }).map(s => {
                      const imgKey = s.key.toLowerCase().replace(/ /g, '_');
                      const imgUrl = stepImages[imgKey];
                      return (
                        <div key={s.key} className={styles.shapeCard} style={{ position: 'relative' }}>
                          <ImgOptionCard
                            opt={s}
                            selected={shape === s.key}
                            onClick={() => setShape(s.key)}
                            stepImgUrl={imgUrl}
                            isAdmin={isAdmin}
                            onUpload={(f) => handleImageUpload(s.key, f)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button className="btn btn-primary" onClick={() => setStep(2)} id="step1-next">
                  Next: Dimensions →
                </button>
              </div>
            )}

            {/* STEP 2 – Dimensions (shape-specific) */}
            {step === 2 && (
              <div className={styles.stepContent}>
                <h2 style={{ marginBottom: '0.5rem', marginTop: 0 }}>Dimensions</h2>
                <p className={styles.stepSubtext} style={{ marginTop: 0, marginBottom: '1rem' }}>
                  Configuring for: <strong style={{ color: 'var(--brand-primary)' }}>{SHAPES.find(s => s.key === shape)?.label}</strong>
                </p>
                {stepImages[shape.toLowerCase().replace(/ /g, '_')] && (
                  <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '0.5rem', marginBottom: '1.5rem' }}>
                    <img
                      src={stepImages[shape.toLowerCase().replace(/ /g, '_')]}
                      alt={shape}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                )}

                <div className={styles.dimsGrid}>
                  {/* Common: quantity always shown */}

                  {/* Rectangle / Throw Pillow / Pillow */}
                  {(shape === 'Rectangle' || shape === 'Box' || shape === 'Pillow') && (<>
                    <DimSelect field="length" value={dims.length} onChange={v => setDims(d => ({ ...d, length: v }))} />
                    <DimSelect field="width" value={dims.width} onChange={v => setDims(d => ({ ...d, width: v }))} />
                    <DimSelect field="thickness" value={dims.thickness} onChange={v => setDims(d => ({ ...d, thickness: v }))} />
                  </>)}

                  {/* Trapezium */}
                  {shape === 'Trapezium' && (<>
                    <DimSelect field="length" value={dims.length} onChange={v => setDims(d => ({ ...d, length: v }))} />
                    <DimSelect field="bottomWidth" value={dims.bottomWidth} onChange={v => setDims(d => ({ ...d, bottomWidth: v }))} />
                    <DimSelect field="topWidth" value={dims.topWidth} onChange={v => setDims(d => ({ ...d, topWidth: v }))} />
                    <DimSelect field="thickness" value={dims.thickness} onChange={v => setDims(d => ({ ...d, thickness: v }))} />
                  </>)}

                  {/* T Cushion */}
                  {shape === 'T Cushion' && (<>
                    <DimSelect field="length" value={dims.length} onChange={v => setDims(d => ({ ...d, length: v }))} />
                    <DimSelect field="bottomWidth" value={dims.bottomWidth} onChange={v => setDims(d => ({ ...d, bottomWidth: v }))} />
                    <DimSelect field="topWidth" value={dims.topWidth} onChange={v => setDims(d => ({ ...d, topWidth: v }))} />
                    <DimSelect field="thickness" value={dims.thickness} onChange={v => setDims(d => ({ ...d, thickness: v }))} />
                    <DimSelect field="ear" value={dims.ear} onChange={v => setDims(d => ({ ...d, ear: v }))} />
                  </>)}

                  {/* L Shape */}
                  {shape === 'L Shape' && (<>
                    <DimSelect field="length" value={dims.length} onChange={v => setDims(d => ({ ...d, length: v }))} />
                    <DimSelect field="bottomWidth" value={dims.bottomWidth} onChange={v => setDims(d => ({ ...d, bottomWidth: v }))} />
                    <DimSelect field="topWidth" value={dims.topWidth} onChange={v => setDims(d => ({ ...d, topWidth: v }))} />
                    <DimSelect field="thickness" value={dims.thickness} onChange={v => setDims(d => ({ ...d, thickness: v }))} />
                    <DimSelect field="ear" value={dims.ear} onChange={v => setDims(d => ({ ...d, ear: v }))} />
                  </>)}

                  {/* Triangle */}
                  {shape === 'Triangle' && (<>
                    <DimSelect field="length" value={dims.length} onChange={v => setDims(d => ({ ...d, length: v }))} />
                    <DimSelect field="width" value={dims.width} onChange={v => setDims(d => ({ ...d, width: v }))} />
                    <DimSelect field="thickness" value={dims.thickness} onChange={v => setDims(d => ({ ...d, thickness: v }))} />
                  </>)}

                  {/* Round */}
                  {shape === 'Round' && (<>
                    <DimSelect field="diameter" value={dims.diameter} onChange={v => setDims(d => ({ ...d, diameter: v }))} />
                    <DimSelect field="thickness" value={dims.thickness} onChange={v => setDims(d => ({ ...d, thickness: v }))} />
                  </>)}
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
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(3)} id="step2-next">Next: Fill Type →</button>
                </div>
              </div>
            )}

            {/* STEP 3 – Fill Type */}
            {step === 3 && (
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
                  <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(4)} id="step3-next">Next: Fabric →</button>
                </div>
              </div>
            )}

            {/* STEP 4 – Fabric Brand & Swatches */}
            {step === 4 && (
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
                  <button className="btn btn-outline" onClick={() => setStep(3)}>← Back</button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (!selectedFabric) {
                        alert('Please select a fabric to continue.');
                        return;
                      }
                      setStep(5);
                    }}
                    id="step4-next"
                  >
                    Next: Zipper →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5 – Zipper */}
            {step === 5 && (
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
                  <button className="btn btn-outline" onClick={() => setStep(4)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(6)} id="step5-next">Next: Piping →</button>
                </div>
              </div>
            )}

            {/* STEP 6 – Piping */}
            {step === 6 && (
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
                  <button className="btn btn-outline" onClick={() => setStep(5)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(7)} id="step6-next">Next: Ties →</button>
                </div>
              </div>
            )}

            {/* STEP 7 – Ties + Final CTA */}
            {step === 7 && (
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
                    <div><span>Category</span><strong>{category}</strong></div>
                    <div><span>Shape</span><strong>{SHAPES.find(s => s.key === shape)?.label}</strong></div>
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
                  <button className="btn btn-outline" onClick={() => setStep(6)}>← Back</button>
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

            {step === 7 && (
              <div className={styles.priceCTAs}>
                <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '.5rem' }} onClick={handleBuyNow}>
                  Buy Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
