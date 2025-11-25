'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function useGSAP() {
  return {
    animateDeath: (element: HTMLElement | null, onComplete?: () => void) => {
      if (!element) return

      const tl = gsap.timeline({
        onComplete,
      })

      tl.to(element, {
        scale: 0.8,
        rotation: 5,
        duration: 0.2,
        ease: 'power2.out',
      })
        .to(element, {
          x: -20,
          rotation: -10,
          duration: 0.15,
          ease: 'power2.in',
        })
        .to(element, {
          x: 20,
          rotation: 10,
          duration: 0.15,
          ease: 'power2.inOut',
        })
        .to(element, {
          x: 0,
          rotation: 0,
          scale: 1,
          opacity: 0.3,
          duration: 0.3,
          ease: 'power2.in',
        })
        .to(element, {
          y: 100,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
        })
    },

    animateReveal: (element: HTMLElement | null) => {
      if (!element) return

      gsap.fromTo(
        element,
        {
          scale: 0,
          opacity: 0,
          rotation: -180,
        },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.6,
          ease: 'back.out(1.7)',
        }
      )
    },

    animateGameClear: (element: HTMLElement | null) => {
      if (!element) return

      gsap.fromTo(
        element,
        {
          scale: 0,
          opacity: 0,
          y: -50,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)',
        }
      )
    },

    animateGameOver: (element: HTMLElement | null) => {
      if (!element) return

      const tl = gsap.timeline()

      tl.fromTo(
        element,
        {
          scale: 0,
          opacity: 0,
        },
        {
          scale: 1.2,
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
        }
      )
        .to(element, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.in',
        })
        .to(
          element,
          {
            x: -10,
            duration: 0.1,
            ease: 'power2.inOut',
          },
          '-=0.2'
        )
        .to(
          element,
          {
            x: 10,
            duration: 0.1,
            ease: 'power2.inOut',
          },
          '-=0.1'
        )
        .to(
          element,
          {
            x: -5,
            duration: 0.1,
            ease: 'power2.inOut',
          },
          '-=0.1'
        )
        .to(
          element,
          {
            x: 0,
            duration: 0.1,
            ease: 'power2.inOut',
          },
          '-=0.1'
        )
    },

    animateCardFlip: (element: HTMLElement | null) => {
      if (!element) return

      gsap.to(element, {
        rotationY: 360,
        duration: 0.6,
        ease: 'power2.inOut',
        transformOrigin: 'center center',
      })
    },

    animateStaggerFadeIn: (elements: HTMLElement[] | null) => {
      if (!elements || elements.length === 0) return

      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        }
      )
    },

    animatePulse: (element: HTMLElement | null, repeat: number = -1) => {
      if (!element) return

      gsap.to(element, {
        scale: 1.1,
        duration: 0.5,
        repeat,
        yoyo: true,
        ease: 'power2.inOut',
      })
    },

    animateShake: (element: HTMLElement | null) => {
      if (!element) return

      gsap.to(element, {
        x: -10,
        duration: 0.1,
        ease: 'power2.inOut',
      })
      gsap.to(element, {
        x: 10,
        duration: 0.1,
        ease: 'power2.inOut',
        delay: 0.1,
      })
      gsap.to(element, {
        x: -5,
        duration: 0.1,
        ease: 'power2.inOut',
        delay: 0.2,
      })
      gsap.to(element, {
        x: 0,
        duration: 0.1,
        ease: 'power2.inOut',
        delay: 0.3,
      })
    },
  }
}

