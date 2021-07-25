import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'
import Head from 'next/head'
import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import { FiUser, FiCalendar} from 'react-icons/fi'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string | null;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results)
  const [hasNextPage, setHasNextPage] = useState<string | null>(postsPagination.next_page)
  const router = useRouter()
  
  function handleClickPost(slug: string) {
    router.push(`/post/${slug}`)
  }
  
  function handleLoadPost() {
    fetch(hasNextPage)
      .then(response => response.json())
      .then(data => {
        const newPosts = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            }
          }
        })
        setPosts(state => [...state, ...newPosts])
        setHasNextPage(data.next_page)
      })
  }

  return(
    <div className={commonStyles.page}>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={styles.main}>
        {posts.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a>
              <section>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div>
                  <span>
                    <FiCalendar/>
                    <p>
                      {format(
                        new Date(post.first_publication_date), 
                        'd MMM y',
                        { locale: ptBR }
                      )}
                    </p>
                  </span>
                  <span>
                    <FiUser/>
                    <p>{post.data.author}</p>
                  </span>
                </div>
              </section>
            </a>
          </Link>
        ))}
        {hasNextPage && (
          <button 
            className={styles.loadButton}
            onClick={handleLoadPost}
          >
            <p>Carregar mais posts</p>
          </button>
        )}
      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([Prismic.predicates.at(
    'document.type', 'post'
  )], {
    fetch: ['post.title, post.subtitle', 'post.author'],
    pageSize: 2,
  })
  //console.log(postsResponse)

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date/*format(
        new Date(post.first_publication_date), 
        'd MMM y',
        { locale: ptBR }
      )*/,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page
      }
    },
    //revalidate: 30
  }
};
