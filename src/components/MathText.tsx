import React, { useEffect, useRef } from 'react';

interface MathTextProps {
  text: string;
  className?: string;
}

const MathText: React.FC<MathTextProps> = ({ text, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).katex) {
      const parts = text.split(/(\$.*?\$)/g);
      const renderedHtml = parts.map(part => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1);
          try {
            return (window as any).katex.renderToString(formula, {
              throwOnError: false,
              displayMode: false
            });
          } catch (e) {
            return part;
          }
        }
        return part;
      }).join('');
      
      containerRef.current.innerHTML = renderedHtml;
    }
  }, [text]);

  return (
    <div 
      ref={containerRef} 
      className={className}
    >
      {text}
    </div>
  );
};

export default MathText;
