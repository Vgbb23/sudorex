import React from 'react';

type OptimizedImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  priority?: boolean;
};

export const OptimizedImage = ({ priority = false, loading, decoding, ...props }: OptimizedImageProps) => (
  <img
    {...props}
    loading={priority ? 'eager' : (loading ?? 'lazy')}
    decoding={decoding ?? 'async'}
    fetchPriority={priority ? 'high' : 'auto'}
  />
);
