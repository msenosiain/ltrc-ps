import type { Variants } from "framer-motion"

/* Sidebar fija (desktop) */
export const sidebarVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

/* Drawer mobile */
export const drawerVariants: Variants = {
hidden: { x: -280 },
visible: {
    x: 0,
    transition: {
    type: "spring",
    stiffness: 220,
    damping: 25
    }
},
exit: { x: -280 }
}


/* Contenedor de lista */
export const listVariants: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

/* Item individual */
export const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -10
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.15
    }
  }
}
