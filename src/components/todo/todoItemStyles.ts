export const todoItemStyles = {
  container: {
    base: "group flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors",
    dragging: "opacity-50",
    completed: "opacity-50",
    waiting: "opacity-30",
    animating: {
      finish: "animate-shrink-right",
      restore: "animate-shrink-left",
      delete: "animate-shrink-center"
    }
  },
  text: {
    base: "flex-1 text-sm text-white/90 break-words",
    completed: "line-through text-white/50",
    waiting: "text-white/50"
  },
  input: {
    base: "flex-1 bg-transparent text-sm text-white/90 focus:outline-none",
    completed: "line-through text-white/50",
    waiting: "text-white/50"
  },
  button: {
    base: "flex items-center justify-center w-5 h-5 rounded-full transition-colors",
    check: {
      active: "text-green-500 hover:text-green-400",
      inactive: "text-white/30 hover:text-white/50"
    }
  }
};

// Add these styles to your globals.css
/*
@keyframes shrink-right {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateX(100%) scale(0);
    opacity: 0;
  }
}

@keyframes shrink-left {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) scaleX(0);
    opacity: 0;
  }
}

@keyframes shrink-center {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

.animate-shrink-right {
  animation: shrink-right 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  pointer-events: none;
}

.animate-shrink-left {
  animation: shrink-left 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  pointer-events: none;
}

.animate-shrink-center {
  animation: shrink-center 0.3s ease-in-out forwards;
  pointer-events: none;
}
*/ 