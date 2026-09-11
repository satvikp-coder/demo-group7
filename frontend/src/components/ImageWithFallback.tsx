import React, { useState } from "react";

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
  ...rest
}) => {
  const [hasError, setHasError] = useState<boolean>(false);

  const defaultFallback = fallbackSrc || getCategoryFallback(category);
  const effectiveSrc = hasError || !src ? defaultFallback : src;

  return (
    <img
      src={effectiveSrc}
      alt={alt || "Gujarat Heritage Site"}
      className={className}
      onError={(e) => {
        if (!hasError) {
          setHasError(true);
        }
        if (onError) onError(e);
      }}
      {...rest}
    />
  );
};
