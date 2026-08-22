// Official Color Tokens for Heritage Tourism App
export const DESIGN_TOKENS = {
  ink: "#1E2A46", // Ink Indigo (Primary dark)
  salt: "#F6F4EF", // Salt White (Background)
  madder: "#A63D40", // Madder Red (Accent)
  gold: "#C99A3B", // Stepwell Gold (Primary accent / highlight)
  stone: "#6B665B", // Stone Grey (Muted text / borders)
  charcoal: "#24211D", // Deep Charcoal (Body text / high contrast)

  // Dusk / Evening Alternate Palette (Rann of Kutch Dusk)
  duskIndigo: "#131B30", // Dusk Indigo (deeper background)
  saltGlow: "#EDE9DD", // Salt Glow (dimmed salt white, primary text on dark)
  madderEmber: "#C1544F", // Madder Ember (brightened red for visibility on dark)
  stoneMist: "#9C9686", // Stone Mist (lightened stone grey for dark legibility)
} as const;

export const SVG_COLORS = {
  ink: DESIGN_TOKENS.ink,
  salt: DESIGN_TOKENS.salt,
  madder: DESIGN_TOKENS.madder,
  gold: DESIGN_TOKENS.gold,
  stone: DESIGN_TOKENS.stone,
  charcoal: DESIGN_TOKENS.charcoal,
  white: "#FFFFFF", // Clean white for contrast elements where salt is background

  duskIndigo: DESIGN_TOKENS.duskIndigo,
  saltGlow: DESIGN_TOKENS.saltGlow,
  madderEmber: DESIGN_TOKENS.madderEmber,
  stoneMist: DESIGN_TOKENS.stoneMist,
} as const;
