import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import { SidebarSection } from './SidebarSection';
import { useDivisiones } from '../../../queries/useDivisiones';
import { drawerVariants, sidebarVariants } from '../../../animations/sidebar.animations';
import { toggleSidebarSection } from '../../../store/uiSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { Link } from 'react-router-dom';
import { useEjercicioCategorias } from '../../../queries/useEjerciciosCategorias';

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const openSection = useAppSelector((s) => s.ui.sidebarSection);

  const { data: divisiones } = useDivisiones();
  const { data: ejercicioCategorias } = useEjercicioCategorias();

  const content = (
    <motion.div
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="w-64 h-full bg-primary p-4 space-y-6 text-white"
    >
      {/* PLANTEL */}
      <SidebarSection
        title="Plantel"
        open={openSection === 'plantel'}
        onToggle={() => dispatch(toggleSidebarSection('plantel'))}
      >
        <Link
          to="/players"
          onClick={() => setOpen(false)}
          className="block text-sm text-gray-300 hover:text-white transition font-medium"
        >
          Jugadores
        </Link>
      </SidebarSection>

      {/* DIVISIÓN / PLANTEL */}
      <SidebarSection
        title="División / Plantel"
        open={openSection === 'divisiones'}
        onToggle={() => dispatch(toggleSidebarSection('divisiones'))}
      >
        {divisiones?.map((div) => (
          <Link
            key={div.id}
            to={`/plantel/${div.id}`}
            onClick={() => setOpen(false)}
            className="block text-sm text-gray-300 hover:text-white transition pl-2"
          >
            {div.name}
          </Link>
        ))}
      </SidebarSection>

      {/* EJERCICIOS */}
      <SidebarSection
        title="Ejercicios"
        open={openSection === 'ejercicios'}
        onToggle={() => dispatch(toggleSidebarSection('ejercicios'))}
      >
        {ejercicioCategorias?.map((cat) => (
          <Link
            key={cat.id}
            to={`/ejercicios/${cat.id}`}
            onClick={() => setOpen(false)}
            className="block text-sm text-gray-300 hover:text-white transition"
          >
            {cat.name}
          </Link>
        ))}
      </SidebarSection>
    </motion.div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block">{content}</div>

      {/* Mobile: botón hamburguesa */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-primary p-2 rounded-lg text-white"
      >
        <Menu size={22} />
      </button>

      {/* Mobile: drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            {/* Panel */}
            <motion.div
              className="fixed left-0 top-0 h-full z-50 md:hidden"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="relative h-full">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white"
                >
                  <X size={20} />
                </button>
                {content}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
