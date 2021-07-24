import Link from 'next/link'

import styles from './header.module.scss'

interface HeaderProps {
  isHome: boolean;
}

export default function Header({ isHome }: HeaderProps) {
  const style = isHome ? styles.headerHome : styles.headerPost
  return (
    <header className={style}>
      <Link href="/">
        <a>
          <img src="/images/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
