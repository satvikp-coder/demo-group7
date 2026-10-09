import React, { useState } from "react";
import { emergencyImage, imageSource, photoCredit } from "../utils/imageSources";

interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  category?: string;
  fallbackSrc?: string;
}

export const getCategoryFallback = (category?: string): string => {
  const cat = (category || "").toLowerCase();
  if (
    cat.includes("jyotirlinga") ||
    cat.includes("temple") ||
    cat.includes("religious") ||
    cat.includes("sacred")
  ) {
    return "/assets/categories/temple.svg";
  }
  if (cat.includes("stepwell") || cat.includes("vav")) {
    return "/assets/categories/stepwell.svg";
  }
  if (
    cat.includes("wildlife") ||
    cat.includes("lion") ||
    cat.includes("safari") ||
    cat.includes("forest") ||
    cat.includes("national park")
  ) {
    return "/assets/categories/wildlife.svg";
  }
  if (
    cat.includes("hotel") ||
    cat.includes("resort") ||
    cat.includes("stay") ||
    cat.includes("haveli")
  ) {
    return "/assets/categories/hotel.svg";
  }
  if (
    cat.includes("dining") ||
    cat.includes("food") ||
    cat.includes("thali") ||
    cat.includes("restaurant")
  ) {
    return "/assets/categories/dining.svg";
  }
  return "/assets/categories/monument.svg";
};

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  category,
  fallbackSrc,
  onError,
  onLoad,
  srcSet,
  style,
  ...rest
}) => {
  const original = imageSource(src);
  const candidates = [...new Set([original, imageSource(fallbackSrc), imageSource(getCategoryFallback(category)), emergencyImage].filter(Boolean))];
  const key = JSON.stringify([src, srcSet, fallbackSrc, category]);
  const [failures, setFailures] = useState<{key: string; sources: string[]}>({key, sources: []});
  const [loaded, setLoaded] = useState("");
  const failed = failures.key === key ? failures.sources : [];
  const effectiveSrc = candidates.find(candidate => !failed.includes(candidate));
  const fallback = !original || effectiveSrc !== original || original.includes("/categories/");
  const credit = effectiveSrc ? photoCredit(effectiveSrc) : undefined;
  const description = fallback ? `Photograph unavailable; generic illustration for ${alt || category || "Gujarat heritage"}` : alt || "Gujarat heritage photograph";
  // Even if a CSP/browser blocks the self-contained terminal SVG, show no broken icon.
  if (!effectiveSrc) return <span className={className} role="img" aria-label={description} data-image-state="fallback" style={{display:"block",backgroundColor:"#141E34",...style}} />;

  return (
    <img
      src={effectiveSrc}
      srcSet={fallback ? undefined : srcSet}
      alt={description}
      className={className}
      style={{backgroundColor:"#141E34",...style}}
      title={credit ? `${credit.title} — ${credit.author}, ${credit.license}. Credits: image-credits.html` : fallback ? description : rest.title}
      data-image-state={fallback ? "fallback" : loaded === key + effectiveSrc ? "photo" : "loading"}
      data-image-credit={credit?.source}
      loading={rest.loading ?? "lazy"}
      decoding={rest.decoding ?? "async"}
      onError={(e) => {
        setFailures(previous => ({key,sources:[...new Set([...(previous.key === key ? previous.sources : []),effectiveSrc])]}));
        if (onError) onError(e);
      }}
      onLoad={(e) => { setLoaded(key + effectiveSrc); onLoad?.(e); }}
      {...rest}
    />
  );
};
