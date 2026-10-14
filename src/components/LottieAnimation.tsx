import React, { useEffect, useState } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

interface LottieAnimationProps {
  src: string; // URL путь к json файлу (например /assets/animations/gift.json)
  width?: string | number;
  height?: string | number;
  loop?: boolean;
  autoplay?: boolean;
  fallbackText?: string;
  style?: React.CSSProperties;
  lottieRef?: React.RefObject<LottieRefCurrentProps | null>;
  onComplete?: () => void;
  onClick?: () => void;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  src,
  width = 100,
  height = 100,
  loop = true,
  autoplay = true,
  fallbackText,
  style,
  lottieRef,
  onComplete,
  onClick,
}) => {
  const [animationData, setAnimationData] = useState<unknown | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted) setAnimationData(data);
      })
      .catch((err) => {
        console.warn('Lottie load error for', src, err);
        if (isMounted) setHasError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (hasError || !animationData) {
    return (
      <div
        onClick={onClick}
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
      >
        {fallbackText ? <span>{fallbackText}</span> : null}
      </div>
    );
  }

  return (
    <div onClick={onClick} style={{ width, height, ...style }}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        onComplete={onComplete}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
