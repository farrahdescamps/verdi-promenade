import React, { useRef, useState, useEffect } from 'react';

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

export const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ children, className = '' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialClientXRef = useRef<number>(0);
  const pointerDownTimeRef = useRef<number>(0);
  const clickedElementRef = useRef<EventTarget | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const dragThreshold = 20; // pixels
  const clickTimeThreshold = 300; // milliseconds

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    initialClientXRef.current = e.clientX;
    pointerDownTimeRef.current = Date.now();
    clickedElementRef.current = e.target;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    const dragDistance = Math.abs(e.clientX - initialClientXRef.current);
    if (dragDistance > dragThreshold) {
      setHasDragged(true);
    }
    
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiply by 2 for faster scrolling
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false);
    
    const duration = Date.now() - pointerDownTimeRef.current;
    const finalDragDistance = Math.abs(e.clientX - initialClientXRef.current);
    
    if (!hasDragged && finalDragDistance <= dragThreshold && duration < clickTimeThreshold) {
      e.preventDefault();
      if (clickedElementRef.current) {
        clickedElementRef.current.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    }
    
    setHasDragged(false);
    clickedElementRef.current = null;
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setHasDragged(false);
      clickedElementRef.current = null;
    }
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    initialClientXRef.current = e.touches[0].clientX;
    pointerDownTimeRef.current = Date.now();
    clickedElementRef.current = e.target;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    const dragDistance = Math.abs(e.touches[0].clientX - initialClientXRef.current);
    if (dragDistance > dragThreshold) {
      setHasDragged(true);
    }
    
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    
    const duration = Date.now() - pointerDownTimeRef.current;
    const finalDragDistance = Math.abs(e.changedTouches[0].clientX - initialClientXRef.current);
    
    if (!hasDragged && finalDragDistance <= dragThreshold && duration < clickTimeThreshold) {
      e.preventDefault();
      if (clickedElementRef.current) {
        clickedElementRef.current.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    }
    
    setHasDragged(false);
    clickedElementRef.current = null;
  };

  // Écouteurs d'événements globaux pour gérer le mouseup/touchend en dehors du composant
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        setIsDragging(false);
        
        // Calculate interaction metrics
        const duration = Date.now() - pointerDownTimeRef.current;
        const finalDragDistance = Math.abs(e.clientX - initialClientXRef.current);
        
        if (!hasDragged && finalDragDistance <= dragThreshold && duration < clickTimeThreshold) {
          if (clickedElementRef.current) {
            clickedElementRef.current.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }
        }
        
        setHasDragged(false);
        clickedElementRef.current = null;
      }
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (isDragging) {
        setIsDragging(false);
        
        // Calculate interaction metrics
        const duration = Date.now() - pointerDownTimeRef.current;
        const finalDragDistance = Math.abs(e.changedTouches[0].clientX - initialClientXRef.current);
        
        if (!hasDragged && finalDragDistance <= dragThreshold && duration < clickTimeThreshold) {
          if (clickedElementRef.current) {
            clickedElementRef.current.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }
        }
        
        setHasDragged(false);
        clickedElementRef.current = null;
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dragDistance = Math.abs(e.clientX - initialClientXRef.current);
        if (dragDistance > dragThreshold) {
          setHasDragged(true);
        }
        
        if (scrollRef.current) {
          const x = e.pageX - scrollRef.current.offsetLeft;
          const walk = (x - startX) * 2;
          scrollRef.current.scrollLeft = scrollLeft - walk;
        }
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const dragDistance = Math.abs(e.touches[0].clientX - initialClientXRef.current);
        if (dragDistance > dragThreshold) {
          setHasDragged(true);
        }
        
        if (scrollRef.current) {
          const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
          const walk = (x - startX) * 2;
          scrollRef.current.scrollLeft = scrollLeft - walk;
        }
      }
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchend', handleGlobalTouchEnd);
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
    };
  }, [isDragging, startX, scrollLeft, hasDragged]);

  return (
    <div
      ref={scrollRef}
      className={`${className} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ userSelect: 'none', touchAction: 'pan-y' }}
    >
      {children}
    </div>
  );
};