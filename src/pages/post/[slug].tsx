import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router'
import Head from 'next/head'

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter()

  if(router.isFallback) {
    return <p>Carregando...</p>
  }
  return (
    <>
      <Head>
        <title>Post | spacetraveling</title>
      </Head>
      <img src={post.data.banner.url} alt="banner" />
      <article className={commonStyles.page}>
        <h1>{post.data.title}</h1>
        <div>
          <span>
            {format(
              new Date(post.first_publication_date), 
              'd MMM y',
              { locale: ptBR }
            )}
          </span>
          <span>{post.data.author}</span>
          <span>tempo estimado</span>
        </div>
          {post.data.content.map((content, index) => (
            <section key={index}>
              <h2>{content.heading}</h2>
              {content.body.map((body, index) => (
                <p key={index}>{body.text}</p>
              ))}
            </section>
        ))}
      </article>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    { pageSize: 2 }
  );

  const paths = posts.results.map(post => {
    return {
      params: { slug: post.uid}
    }
  })
  
  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params
  
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});
  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      author: response.data.author,
      banner: response.data.banner,
      title: response.data.title,
      subtitle: response.data.subtitle,
      content: response.data.content,
    }
  }
  //console.log(RichText.asHtml(post.data.content[0].body))

  return {
    props: { post },
    //revalidate: 60
  }
};
