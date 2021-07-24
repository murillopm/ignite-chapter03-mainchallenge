import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import { FiUser, FiCalendar} from 'react-icons/fi'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

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
  
  function handleLoadPost() {
    fetch(hasNextPage)
      .then(response => response.json())
      .then(data => {
        const newPosts = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date), 
              'd MMM y',
              { locale: ptBR }
            ),
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
      <main>
        {posts.map(post => (
          <section key={post.uid} className={styles.homeSections}>
            <h1>{post.data.title}</h1>
            <p>{post.data.subtitle}</p>
            <div>
              <span>
                <FiCalendar/>
                <p>{post.first_publication_date}</p>
              </span>
              <span>
                <FiUser/>
                <p>{post.data.author}</p>
              </span>
            </div>
          </section>
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
  const postsResponse = await prismic.query(Prismic.predicates.at(
    'document.type', 'post'
  ), {
    pageSize: 1,
  })

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date), 
        'd MMM y',
        { locale: ptBR }
      ),
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
