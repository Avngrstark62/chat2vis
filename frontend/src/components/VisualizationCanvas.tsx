import React, { useRef, useEffect, useState } from 'react';
import type { VisualizationSpec, Layer } from '../api/index';

interface VisualizationCanvasProps {
  visualizationSpec: VisualizationSpec | null;
  className?: string;
}

export const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({
  visualizationSpec,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  const play = () => {
    if (!visualizationSpec) return;
    console.log('Playing animation, duration:', visualizationSpec.duration);
    setIsPlaying(true);
    startTimeRef.current = Date.now() - currentTime;
    animate();
  };

  const pause = () => {
    setIsPlaying(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const reset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    updateVisualization(0);
  };

  const animate = () => {
    if (!visualizationSpec || !startTimeRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const clampedTime = Math.min(elapsed, visualizationSpec.duration);

    setCurrentTime(clampedTime);
    updateVisualization(clampedTime);

    if (clampedTime < visualizationSpec.duration) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
    }
  };

  const updateVisualization = (time: number) => {
    if (!visualizationSpec || !svgRef.current) return;

    console.log('Updating visualization at time:', time, 'layers:', visualizationSpec.layers?.length);
    const svg = svgRef.current;
    
    // Clear all content except defs
    const children = Array.from(svg.children);
    children.forEach(child => {
      if (child.tagName !== 'defs') {
        svg.removeChild(child);
      }
    });

    if (!visualizationSpec.layers || !Array.isArray(visualizationSpec.layers)) return;

    visualizationSpec.layers.forEach((layer, index) => {
      try {
        console.log(`Processing layer ${index}:`, layer.type, layer.id);
        const element = createLayerElement(layer, time);
        if (element) {
          svg.appendChild(element);
          console.log(`Added element for layer ${layer.id}`);
        } else {
          console.warn(`No element created for layer ${layer.id}`);
        }
      } catch (error) {
        console.error('Error creating layer element:', error, layer);
      }
    });
  };

  const createLayerElement = (layer: Layer, time: number): SVGElement | null => {
    const { type, props, animations = [] } = layer;
    const animatedProps: Record<string, any> = { ...props };

    // Set initial opacity to 0 if there's an opacity animation starting later
    const opacityAnimation = animations.find(anim => anim.property === 'opacity');
    if (opacityAnimation && time < opacityAnimation.start) {
      animatedProps.opacity = 0;
    }

    animations.forEach(animation => {
      const { property, from, to, start, end } = animation;

      // Skip non-numeric animations for properties that shouldn't be animated
      if (property === 'fill' || property === 'stroke' || property === 'text') {
        return; // Skip these properties as they're not meant to be interpolated
      }

      // Only interpolate numeric properties
      if (typeof from !== 'number' || typeof to !== 'number') {
        console.warn(`Skipping non-numeric animation for property ${property}:`, { from, to });
        return;
      }

      if (time >= start && time <= end) {
        const progress = (time - start) / (end - start);
        animatedProps[property] = from + (to - from) * progress;
      } else if (time > end) {
        animatedProps[property] = to;
      } else {
        animatedProps[property] = from;
      }
    });

    let element: SVGElement | null = null;

    switch (type) {
      case 'circle':
        element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        element.setAttribute('cx', String(animatedProps.x || 0));
        element.setAttribute('cy', String(animatedProps.y || 0));
        element.setAttribute('r', String(animatedProps.r || 10));
        element.setAttribute('fill', animatedProps.fill || '#3498db');
        if (animatedProps.opacity !== undefined) element.setAttribute('opacity', String(animatedProps.opacity));
        break;

      case 'rect':
        element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        element.setAttribute('x', String(animatedProps.x || 0));
        element.setAttribute('y', String(animatedProps.y || 0));
        element.setAttribute('width', String(animatedProps.width || 50));
        element.setAttribute('height', String(animatedProps.height || 50));
        element.setAttribute('fill', animatedProps.fill || '#e74c3c');
        if (animatedProps.opacity !== undefined) element.setAttribute('opacity', String(animatedProps.opacity));
        break;

      case 'line':
        element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        element.setAttribute('x1', String(animatedProps.x1 || 0));
        element.setAttribute('y1', String(animatedProps.y1 || 0));
        element.setAttribute('x2', String(animatedProps.x2 || 100));
        element.setAttribute('y2', String(animatedProps.y2 || 100));
        element.setAttribute('stroke', animatedProps.stroke || '#34495e');
        element.setAttribute('stroke-width', String(animatedProps.strokeWidth || 2));
        if (animatedProps.opacity !== undefined) element.setAttribute('opacity', String(animatedProps.opacity));
        break;

      case 'text':
        element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        element.setAttribute('x', String(animatedProps.x || 0));
        element.setAttribute('y', String(animatedProps.y || 0));
        element.setAttribute('fill', animatedProps.fill || '#2c3e50');
        element.setAttribute('font-size', String(animatedProps.fontSize || 16));
        element.setAttribute('font-family', animatedProps.fontFamily || 'Arial, sans-serif');
        element.textContent = props.text || ''; // Use original props.text, not animated
        if (animatedProps.opacity !== undefined) element.setAttribute('opacity', String(animatedProps.opacity));
        break;

      case 'arrow':
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(animatedProps.x1 || 0));
        line.setAttribute('y1', String(animatedProps.y1 || 0));
        line.setAttribute('x2', String(animatedProps.x2 || 100));
        line.setAttribute('y2', String(animatedProps.y2 || 100));
        line.setAttribute('stroke', animatedProps.stroke || '#34495e');
        line.setAttribute('stroke-width', String(animatedProps.strokeWidth || 2));
        line.setAttribute('marker-end', 'url(#arrowhead)');
        group.appendChild(line);
        element = group;
        break;
    }

    if (element) element.setAttribute('id', layer.id);
    return element;
  };

  useEffect(() => {
    if (visualizationSpec) updateVisualization(0);
  }, [visualizationSpec]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  if (!visualizationSpec) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No visualization available</p>
      </div>
    );
  }

  const progress = visualizationSpec.duration > 0 ? (currentTime / visualizationSpec.duration) * 100 : 0;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4">
        <svg
          ref={svgRef}
          width="100%"
          height="400"
          viewBox="0 0 600 400"
          className="border border-gray-100 rounded"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#34495e" />
            </marker>
          </defs>
        </svg>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={isPlaying ? pause : play}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={reset}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Reset
            </button>
            <span className="text-sm text-gray-600">
              {Math.round(currentTime)}ms / {visualizationSpec.duration}ms
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};