import { useState } from 'react';

const DiscoverCarousel = ({ images }) => {

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePrev = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prevSlide) =>
        prevSlide === 0 ? images.length - 1 : prevSlide - 1
      );
    }
  };

  const handleNext = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prevSlide) =>
        prevSlide === images.length - 1 ? 0 : prevSlide + 1
      );
    }
  };

  const handleClick = () => {
    console.log(currentSlide)
  }

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
  };

  return (
    <div className="w-full px-12 flex justify-center">
      <div id="dynamic-carousel" className="relative w-full" data-carousel="slide">
        <div className="relative h-[500px] overflow-hidden rounded-[50px]">
          {images.map((image, index) => (
            <div
              onClick={() => handleClick()} 
              key={index}
              className={`cursor-pointer absolute inset-0 transition-opacity duration-700 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              onTransitionEnd={handleTransitionEnd}
              data-carousel-item
            >
              <img
                src={image}
                className="absolute block w-full h-full object-cover"
                alt={`Slide ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3 rtl:space-x-reverse">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`w-16 h-2 rounded-lg ${
                index === currentSlide ? 'bg-black' : 'bg-gray-400'
              }`}
              aria-current={index === currentSlide}
              aria-label={`Slide ${index + 1}`}
              onClick={() => setCurrentSlide(index)}
            ></button>
          ))}
        </div>

        <button
          type="button"
          className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          onClick={handlePrev}
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover:bg-white/50">
            <svg className="w-4 h-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10" >
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" />
            </svg>
            <span className="sr-only">Previous</span>
          </span>
        </button>

        <button
          type="button"
          className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          onClick={handleNext}
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover:bg-white/50">
            <svg className="w-4 h-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10" >
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
            </svg>
            <span className="sr-only">Next</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default DiscoverCarousel;