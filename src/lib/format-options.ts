export const ORDERED_CUSTOM_KEYS = [
  'category',
  'fill',
  'zipper',
  'piping',
  'ties',
  'fabric',
  'dimensions'
];

export function getOrderedCustomOptions(options: Record<string, string> | undefined | null): [string, string][] {
  if (!options) return [];
  
  const entries = Object.entries(options).filter(([k, v]) => 
    k !== 'shape' && k !== 'fabricMeters' && k !== 'FabricMeters' && v
  );

  return entries.sort((a, b) => {
    const indexA = ORDERED_CUSTOM_KEYS.indexOf(a[0].toLowerCase());
    const indexB = ORDERED_CUSTOM_KEYS.indexOf(b[0].toLowerCase());
    
    // If both are in the array, sort by their index
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    // If only A is in the array, it comes first
    if (indexA !== -1) return -1;
    // If only B is in the array, it comes first
    if (indexB !== -1) return 1;
    // If neither is in the array, preserve original order or sort alphabetically
    return 0;
  });
}
