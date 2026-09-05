"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const VIDEO_SRC = "/Lady_justice_Video.mp4";
const POSTER_SRC = "/hero-justice.svg";
const HERO_MEDIA_CLASS =
  "object-cover object-[55%_center] sm:object-[center_right]";
const SLIDE_LEAD_SECONDS = 1.25;
const INTRO_FALLBACK_MS = 16000;

export function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const revealedRef = useRef(false);
  const frozenRef = useRef(false);
  const safetyTimeoutRef = useRef<number>(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const revealCard = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
  }, []);

  const freezeLastFrame = useCallback(() => {
    if (frozenRef.current) return;
    frozenRef.current = true;
    const video = videoRef.current;
    if (video && !video.paused) {
      video.pause();
    }
    revealCard();
  }, [revealCard]);

  const syncIntro = useCallback(() => {
    const video = videoRef.current;
    if (!video || frozenRef.current) return;
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    if (duration - video.currentTime <= SLIDE_LEAD_SECONDS) {
      revealCard();
    }
  }, [revealCard]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (media.matches) {
        setReduceMotion(true);
        revealedRef.current = true;
        frozenRef.current = true;
        setRevealed(true);
      }
    };
    sync();
    media.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.clearTimeout(safetyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || revealed) return;
    const timeout = window.setTimeout(freezeLastFrame, INTRO_FALLBACK_MS);
    return () => window.clearTimeout(timeout);
  }, [reduceMotion, revealed, freezeLastFrame]);

  return (
    <section className="relative min-h-[442px] overflow-hidden bg-charcoal sm:min-h-[493px]">
      {reduceMotion ? (
        <Image
          src={POSTER_SRC}
          alt=""
          fill
          priority
          className={HERO_MEDIA_CLASS}
          sizes="100vw"
        />
      ) : (
        <video
          ref={videoRef}
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full",
            HERO_MEDIA_CLASS,
            videoReady ? "opacity-100" : "opacity-0",
          )}
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden
          onEnded={freezeLastFrame}
          onError={freezeLastFrame}
          onPlaying={() => setVideoReady(true)}
          onPlay={(event) => {
            const video = event.currentTarget;
            const tick = () => {
              syncIntro();
              if (frozenRef.current || revealedRef.current) return;
              if ("requestVideoFrameCallback" in video) {
                video.requestVideoFrameCallback(tick);
              }
            };
            if ("requestVideoFrameCallback" in video) {
              video.requestVideoFrameCallback(tick);
            }
          }}
          onLoadedData={(event) => {
            if (!event.currentTarget.paused) {
              setVideoReady(true);
            }
          }}
          onLoadedMetadata={(event) => {
            const duration = event.currentTarget.duration;
            if (!Number.isFinite(duration) || duration <= 0) return;
            window.clearTimeout(safetyTimeoutRef.current);
            safetyTimeoutRef.current = window.setTimeout(
              freezeLastFrame,
              Math.ceil((duration + 0.4) * 1000),
            );
          }}
          onTimeUpdate={syncIntro}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}

      <div
        className={cn("hero-wash absolute inset-0 bg-gradient-to-r from-warm-white/80 from-0% via-warm-white/55 via-[38%] to-transparent to-[58%]", revealed && "is-in")}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl overflow-hidden px-4 pt-[5.1rem] pb-[4.25rem] sm:px-6 sm:pt-[6.8rem] sm:pb-[5.1rem] lg:px-8">
        <div
          className={cn(
            "hero-card max-w-2xl rounded-2xl bg-warm-white/55 p-5 shadow-lg sm:p-7 lg:max-w-xl",
            revealed ? "is-in" : "pointer-events-none",
          )}
          aria-hidden={!revealed}
        >
          <Badge variant="accent" className="mb-5">
            Integrity & Excellence
          </Badge>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
            Integrity. Insight. Innovation.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-navy/80 sm:text-lg">
            LEAF‑C provides multidisciplinary investigative, compliance, and
            training services, combining institutional rigor with deep
            expertise to support governments, enterprises, and justice partners
            worldwide.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/get-started">
              <Button variant="accent" size="md">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="md">
                Sign in
              </Button>
            </Link>
            <Link href="/consultancy">
              <Button variant="outline" size="md">
                Explore Divisions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
