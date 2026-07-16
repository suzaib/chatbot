import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

interface SpinnerProps {
  size?: "small" | "medium" | "large";
  color?: "light" | "dark";
}

export default function Spinner({
  size = "medium",
  color = "light",
}: SpinnerProps) {
  const sizeClasses: Record<"small" | "medium" | "large", string> = {
    small: "text-xs",
    medium: "text-lg",
    large: "text-2xl",
  };

  const colorClasses: Record<"light" | "dark", string> = {
    light: "text-white",
    dark: "text-gray-800",
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]} inline-flex`}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 0.8,
          ease: "linear",
        }}
      >
        <FaSpinner />
      </motion.div>

      <span className={`${colorClasses[color]} text-md font-medium`}>
        Loading...
      </span>
    </div>
  );
}