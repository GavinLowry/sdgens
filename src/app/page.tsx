import Image from 'next/image'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <span>
      <Image
        src="/dot.png"
        alt="dot"
        width={40}
        height={40}
        priority
      />
        Home
      </span>
    </main>
  )
}
