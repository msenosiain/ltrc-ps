import { motion } from "framer-motion"
import { itemVariants } from "../../../animations/sidebar.animations"
interface Props {
  name: string
  onClick: () => void
}

export function SidebarEquipo({ name, onClick }: Props) {
  return (
    <motion.div
      variants={itemVariants}
      onClick={onClick}
      className="ml-4 cursor-pointer text-sm text-gray-300 hover:text-white transition"
    >
      {name}
    </motion.div>
  )
}
