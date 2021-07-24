import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter()
  const path = router.asPath === '/' ? true : false

  return (
    <>
      <Header isHome={path}/>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp;
