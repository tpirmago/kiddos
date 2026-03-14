import type { HeroType } from '../types/types'
import cat from '../assets/cat.png'
import dog from '../assets/dog.png'
import sloth from '../assets/sloth.png'
import lion from '../assets/lion.png'
import leopard from '../assets/leopard.png'
import zebra from '../assets/zebra.png'
import panda from '../assets/panda.png'
import monkey from '../assets/monkey.png'


export const HERO_IMAGES: Record<HeroType, string> = {
  cat: cat,
  dog: dog,
  sloth: sloth,
  lion: lion,
  leopard: leopard,
  zebra: zebra,
  panda: panda,
  monkey: monkey,
}

const SIZE: Record<string, string> = {
  sm:  'w-10 h-10 text-xl',
  md:  'w-14 h-14 text-3xl',
  lg:  'w-20 h-20 text-5xl',
  xl:  'w-28 h-28 text-6xl',
}

interface Props {
  hero: HeroType
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function HeroAvatar({ hero, size = 'md' }: Props) {
  return (
    <div className={`${SIZE[size]} rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0`}>
      <img src={HERO_IMAGES[hero]} alt={hero} className="w-12 h-12"/>
    </div>
  )
}
