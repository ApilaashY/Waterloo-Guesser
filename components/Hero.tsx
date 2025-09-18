"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './dialogFont.module.css'
import bgStyles from './dialogBg.module.css'
import Link from 'next/link'

const navigation = [
  { name: 'Product', href: '#' },
  { name: 'Features', href: '#' },
  { name: 'Marketplace', href: '#' },
  { name: 'Company', href: '#' },
]

const targetDate = new Date('2025-09-04T00:00:00');

function getTimeRemaining(endDate: Date) {
  const total = endDate.getTime() - new Date().getTime();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds };
}

function CountdownBox({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(endDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.total <= 0) {
    return <div className="text-lg font-bold text-green-400">Countdown finished!</div>;
  }

  return (
    <div className="flex gap-4 justify-center text-white text-lg">
      <div><span className="font-bold text-2xl">{timeLeft.days}</span> d</div>
      <div><span className="font-bold text-2xl">{timeLeft.hours}</span> h</div>
      <div><span className="font-bold text-2xl">{timeLeft.minutes}</span> m</div>
      <div><span className="font-bold text-2xl">{timeLeft.seconds}</span> s</div>
    </div>
  );
}

export default function Hero() {

  return (
    <div className="bg-transparent relative min-h-screen w-full overflow-hidden">
      {/* Blurred night campus background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/loo at night.png"
          alt="UW Campus Night"
          fill
          priority
          className="object-cover"
          // style={{ filter: 'blur(6px) brightness(0.5)' }}
        />
      </div>
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative isolate px-6 pt-4 lg:pt-8 z-20">
        {/* <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div> */}
        <div className="mx-auto max-w-6xl py-12 sm:py-20 lg:py-24 flex flex-col lg:flex-row items-center justify-center gap-12">
          <div className="flex-1 w-full lg:max-w-3xl">
            {/* <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-400 ring-1 ring-white/10 hover:ring-white/20">
                Announcing our next round of funding.{' '}
                <a href="#" className="font-semibold" style={{ color: '#f4b834' }}>
                  <span aria-hidden="true" className="absolute inset-0" />
                  Read more <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div> */}
            <div className="flex items-center justify-center mb-8 pt-5">
              <img src="/UWguesser-logo.png" alt="UW Guesser Logo" className="h-16 rounded-lg shadow-lg" />
            </div>
            <div className="text-center">
              <h1 className="text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl">
                UW Guesser
              </h1>
              <p className="mt-8 text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">
                Lead your faculty to the top of the leaderboard!
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/game"
                  className="rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs"
                  style={{ backgroundColor: '#f4b834' }}
                >
                  Play Now
                </Link>
                <Link href="/leaderboard" className="text-sm/6 font-semibold flex items-center gap-2" style={{ color: '#f4b834' }}>
                  <span className="relative flex items-center">
                    <span className="animate-pulse inline-block h-3 w-3 rounded-full bg-red-500 mr-2" style={{ boxShadow: '0 0 8px 2px #f87171' }}></span>
                    Live Leaderboards
                  </span>
                </Link>
              </div>
            </div>
          </div>
          {/* leaderboard is rendered on the page below the hero */}
          {/* Dialog box with image and text */}
          {/*
          <div className="hidden lg:block absolute right-4 top-36 z-30">
            <div className={`h-24 w-[370px] flex items-center px-4 relative ${bgStyles['dialog-bg']}`}> 
              <img
                src="/dialog egg mascotv2.png"
                alt="Egg Eyes"
                className="h-16 w-16 object-contain mr-4"
                style={{ minWidth: '4rem', zIndex: 1 }}
              />
              <span className={`text-lg font-bold text-yellow-100 break-words ${styles['font-dangrek']}`}
                    style={{ zIndex: 1 }}>
                Why don't you have a crack at it?
              </span>
            </div>
          </div>    
          */}
        </div>
        {/* Subtle bottom right color overlay */}
        {/* <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-2xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-10 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
        </div> */}
      </div>
    </div>
  )
}
