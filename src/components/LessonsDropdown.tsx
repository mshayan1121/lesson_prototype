"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  CheckCircle,
  PlayCircle,
  Lock,
} from "lucide-react";

type LessonStatus = "completed" | "current" | "locked";

interface Lesson {
  number: number;
  title: string;
  xp: number;
  href: string;
  comingSoon?: boolean;
}

const LESSONS: Lesson[] = [
  { number: 1, title: "What is a stock?", xp: 100, href: "/lesson" },
  { number: 2, title: "How to buy a stock?", xp: 100, href: "/lesson/2" },
  { number: 3, title: "What happens after?", xp: 100, href: "" },
  { number: 4, title: "The simulation", xp: 150, href: "", comingSoon: true },
];

function getLessonStatus(lesson: Lesson, pathname: string): LessonStatus {
  const isLesson1Active = pathname === "/lesson";
  const isLesson2Active = pathname === "/lesson/2";

  if (lesson.number === 1) {
    return isLesson1Active ? "current" : "completed";
  }
  if (lesson.number === 2) {
    if (isLesson1Active) return "locked";
    if (isLesson2Active) return "current";
    return "completed";
  }
  return "locked";
}

function StatusIcon({ status }: { status: LessonStatus }) {
  if (status === "completed")
    return <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />;
  if (status === "current")
    return <PlayCircle className="w-4 h-4 text-green-500 shrink-0" />;
  return <Lock className="w-4 h-4 text-gray-300 shrink-0" />;
}

export function LessonsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statuses = LESSONS.map((l) => getLessonStatus(l, pathname));
  const firstLockedIndex = statuses.findIndex((s) => s === "locked");

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="font-sans text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
      >
        Lessons
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 z-50
                       max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:w-[calc(100vw-2rem)]"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-80">
              {/* Module heading */}
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-gray-400 shrink-0" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Stock Module
                </p>
              </div>

              {/* Lesson rows */}
              <div className="flex flex-col">
                {LESSONS.map((lesson, i) => {
                  const status = statuses[i];
                  const isClickable = status !== "locked";
                  const showDivider =
                    firstLockedIndex !== -1 && i === firstLockedIndex;

                  const rowBg =
                    status === "current"
                      ? "bg-green-50 border border-green-100"
                      : "border border-transparent hover:bg-gray-50";

                  const titleColor =
                    status === "completed"
                      ? "text-green-800"
                      : status === "locked"
                      ? "text-gray-400"
                      : "text-gray-800";

                  return (
                    <div key={lesson.number}>
                      {showDivider && (
                        <div className="my-2 border-t border-gray-100" />
                      )}
                      <div
                        onClick={() => {
                          if (!isClickable) return;
                          router.push(lesson.href);
                          setOpen(false);
                        }}
                        className={[
                          "flex items-center gap-3 rounded-xl p-3 mb-1 transition-all",
                          isClickable ? "cursor-pointer" : "cursor-default",
                          rowBg,
                        ].join(" ")}
                      >
                        {/* Left: status icon + title */}
                        <StatusIcon status={status} />
                        <span
                          className={[
                            "text-sm font-semibold font-heading flex-1 leading-snug",
                            titleColor,
                          ].join(" ")}
                        >
                          {lesson.number}. {lesson.title}
                        </span>

                        {/* Right: badges */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {lesson.comingSoon && (
                            <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                              Coming soon
                            </span>
                          )}
                          <span
                            className={[
                              "text-xs font-semibold px-2 py-1 rounded-full",
                              status === "locked"
                                ? "bg-gray-100 text-gray-400"
                                : "bg-green-100 text-green-800",
                            ].join(" ")}
                          >
                            {lesson.xp} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
