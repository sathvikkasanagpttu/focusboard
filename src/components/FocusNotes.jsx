import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const FOCUS_SLIDES = [
  {
    title: "Deep Work & Time-Blocking",
    text: "Prioritize high-leverage tasks in uninterrupted 90-minute blocks. Guard your mental focus by scheduling dedicated intervals for asynchronous communications."
  },
  {
    title: "The 2-Minute Execution Rule",
    text: "If an incoming item requires under two minutes to conclude, resolve it immediately. Otherwise, capture it into FocusBoard and prioritize intentionally."
  },
  {
    title: "Energy & Circadian Alignment",
    text: "Match demanding analytical and creative architectural decisions to your peak energy windows. Incorporate deliberate rest to sustain deep focus."
  }
];

/**
 * FocusNotes carousel component displaying curated productivity principles.
 * Accessible with circular navigation, keyboard arrow support, and ARIA attributes.
 */
export function FocusNotes() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalSlides = FOCUS_SLIDES.length;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlePrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleNext();
    }
  };

  const activeSlide = FOCUS_SLIDES[currentIndex];

  return (
    <section
      className="focus-notes"
      aria-roledescription="carousel"
      aria-label="Daily Focus Principles"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="focus-notes__header">
        <div className="focus-notes__badge">
          <Sparkles size={14} aria-hidden="true" />
          <span>FOCUS NOTES · {currentIndex + 1} OF {totalSlides}</span>
        </div>

        <div className="focus-notes__controls">
          <button
            type="button"
            className="focus-notes__btn"
            onClick={handlePrev}
            aria-label="Previous focus note"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="focus-notes__btn"
            onClick={handleNext}
            aria-label="Next focus note"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className="focus-notes__slide"
        key={currentIndex}
        role="group"
        aria-roledescription="slide"
        aria-label={`Slide ${currentIndex + 1} of ${totalSlides}: ${activeSlide.title}`}
        aria-live="polite"
      >
        <h3 className="focus-notes__slide-title">{activeSlide.title}</h3>
        <p className="focus-notes__slide-text">{activeSlide.text}</p>
      </div>

      <div className="focus-notes__dots" role="tablist" aria-label="Slide indicators">
        {FOCUS_SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={currentIndex === index}
            aria-label={`Go to slide ${index + 1}`}
            className={`focus-notes__dot ${currentIndex === index ? 'focus-notes__dot--active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </section>
  );
}

export default FocusNotes;
