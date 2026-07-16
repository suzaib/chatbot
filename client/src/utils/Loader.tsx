import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

interface LoaderProps {
  progress?: number;
}

export default function Loader({ progress = 0 }: LoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white"
      >
        <FaWhatsapp className="h-16 w-16 text-green-500" />
      </motion.div>

      <div className="mb-4 h-2 w-64 rounded-full bg-white bg-opacity-30">
        <motion.div
          className="h-full rounded-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <p className="text-lg font-semibold text-white">
        Loading... {progress}%
      </p>
    </div>
  );
}