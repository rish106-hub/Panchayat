export const pageVariants = {
  initial:  { opacity: 0, x: 20 },
  animate:  { opacity: 1, x: 0,   transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  exit:     { opacity: 0, x: -20, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } },
}

export const fadeUp = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0,  transition: { duration: 0.25, ease: 'easeOut' } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.18 } },
}

export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1,   transition: { duration: 0.22, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.92, transition: { duration: 0.16 } },
}

export const listContainer = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

export const listItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0,  transition: { duration: 0.22, ease: 'easeOut' } },
}

export const toastVariants = {
  initial: { opacity: 0, y: 32,  scale: 0.94 },
  animate: { opacity: 1, y: 0,   scale: 1,    transition: { type: 'spring', stiffness: 380, damping: 30 } },
  exit:    { opacity: 0, y: 16,  scale: 0.96, transition: { duration: 0.18 } },
}

export const checkSpring = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
  delay: 0.12,
}
