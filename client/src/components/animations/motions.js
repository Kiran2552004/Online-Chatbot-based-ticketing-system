import { motion } from 'framer-motion';

// Container variants for stagger animations
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Fade in animation
export const fadeIn = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Slide up animation
export const slideUp = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Slide down animation
export const slideDown = {
  hidden: {
    opacity: 0,
    y: -50,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Slide from right (for user messages)
export const slideInRight = {
  hidden: {
    opacity: 0,
    x: 50,
    scale: 0.9,
  },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Slide from left with bounce (for bot messages)
export const slideInLeft = {
  hidden: {
    opacity: 0,
    x: -50,
    scale: 0.9,
  },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

// Pop in animation
export const popIn = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

// Zoom in from center
export const zoomIn = {
  hidden: {
    opacity: 0,
    scale: 0.5,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Scale on hover
export const hoverScale = {
  scale: 1.05,
  transition: {
    duration: 0.2,
    ease: [0.25, 0.1, 0.25, 1],
  },
};

// Lift on hover (for cards)
export const hoverLift = {
  y: -8,
  transition: {
    duration: 0.2,
    ease: [0.25, 0.1, 0.25, 1],
  },
};

// Tap animation
export const tap = {
  scale: 0.95,
};

// Page transition
export const pageTransition = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Rotate animation
export const rotate = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
};

// Pulse animation
export const pulse = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Glow pulse animation
export const glowPulse = {
  boxShadow: [
    '0 0 20px rgba(168, 85, 247, 0.4)',
    '0 0 40px rgba(168, 85, 247, 0.8)',
    '0 0 20px rgba(168, 85, 247, 0.4)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Typing dots animation
export const typingDots = {
  animate: {
    transition: {
      staggerChildren: 0.2,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};

export const dot = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Motion components for easy usage
export const MotionDiv = motion.div;
export const MotionButton = motion.button;
export const MotionSpan = motion.span;


