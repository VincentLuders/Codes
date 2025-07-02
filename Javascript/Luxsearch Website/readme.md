# Glassmorphism CSS Parameters Guide

## Key Properties for Glass Effect

### 1. **Background Transparency** (`background`)
Controls how see-through the element is.
```css
background: rgba(255, 255, 255, 0.05);
```
- **Lower values** (0.01-0.05): More transparent, subtle glass
- **Higher values** (0.1-0.3): Less transparent, more opaque

### 2. **Backdrop Blur** (`backdrop-filter: blur()`)
Creates the frosted glass effect by blurring what's behind.
```css
backdrop-filter: blur(10px);
```
- **Lower values** (5-10px): Subtle blur, clearer background
- **Higher values** (15-30px): Strong blur, more frosted

### 3. **Color Saturation** (`backdrop-filter: saturate()`)
Enhances colors behind the glass for magnifying effect.
```css
backdrop-filter: blur(10px) saturate(1.2);
```
- **1.0**: Normal colors
- **1.2-1.5**: Slight color boost
- **1.5+**: Strong magnifying effect

### 4. **Border Opacity** (`border`)
Defines the glass edge visibility.
```css
border: 1px solid rgba(255, 255, 255, 0.2);
```
- **Lower opacity** (0.1-0.2): Subtle edges
- **Higher opacity** (0.3-0.5): More defined edges

### 5. **Shadow Layers** (`box-shadow`)
Adds depth and floating effect.
```css
box-shadow: 
    0 20px 60px rgba(31, 38, 135, 0.18),    /* Main shadow */
    0 10px 30px rgba(31, 38, 135, 0.12),    /* Mid shadow */
    0 4px 12px rgba(0, 0, 0, 0.04),         /* Subtle shadow */
    inset 0 2px 4px rgba(255, 255, 255, 0.25); /* Inner light */
```

## Quick Adjustment Examples

### Ultra Transparent Glass
```css
background: rgba(255, 255, 255, 0.02);
backdrop-filter: blur(8px) saturate(1.1);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### Frosted Glass (More Opaque)
```css
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(20px) saturate(1.3);
border: 1px solid rgba(255, 255, 255, 0.3);
```

### Crystal Clear (Minimal Blur)
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(5px) saturate(1.5);
border: 1px solid rgba(255, 255, 255, 0.25);
```

### Magnifying Glass Effect
```css
background: rgba(255, 255, 255, 0.08);
backdrop-filter: blur(12px) saturate(1.8);
border: 1px solid rgba(255, 255, 255, 0.2);
```

## Tips
- **Performance**: Lower blur values perform better
- **Readability**: Balance transparency with content visibility
- **Browser Support**: Always include `-webkit-backdrop-filter` for Safari
- **Background Elements**: Stronger colored backgrounds make glass effect more visible