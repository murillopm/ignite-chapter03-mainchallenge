import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router'
import Head from 'next/head'

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiUser, FiCalendar, FiClock} from 'react-icons/fi'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Link from 'next/link';
import Comments from '../../components/Comments';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
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

type LinkPostType = {
  title: string;
  slug: string;
}
interface PostProps {
  post: Post;
  preview: boolean;
  previousPostData: LinkPostType | null;
  nextPostData: LinkPostType | null;
}

export default function Post({ 
  post, 
  preview,
  previousPostData,
  nextPostData, 
}: PostProps) {
  const router = useRouter()

  if(router.isFallback) {
    return <p>Carregando...</p>
  }

  const time = post.data.content.reduce((acc, content) => {
    const heading = content.heading.split(' ').length
    const body = RichText.asText(content.body).split(' ').length
    return heading + body
  }, 0)
  
  const timeString = String(Math.round(time/200) + 1) + ' min'

  return (
    <div className={styles.banner}>
      <Head>
        <title>Post | spacetraveling</title>
      </Head>
      <img src={post.data.banner.url} alt="banner"/>
      <article className={styles.post}>
        <h1>{post.data.title}</h1>
        <div className={styles.postInfo}>
          <span>
            <FiCalendar />
            <p>
              {format(
                new Date(post.first_publication_date), 
                'd MMM y',
                { locale: ptBR }
              )}
            </p>
          </span>
          <span>
            <FiUser />
            <p>{post.data.author}</p>
          </span>
          <span>
            <FiClock />
            <p>{timeString}</p>
          </span>
        </div>
        { post.last_publication_date && 
          post.last_publication_date !== 
          post.first_publication_date && (
            <p className={styles.editInfo}>* editado em {format(
              new Date(post.first_publication_date), 
              'PPPp ',
              { locale: ptBR }
            )}</p>
        )}

        { post.data.content.map((content, index) => (
          <section key={index} className={styles.postSection}>
            <h2>{content.heading}</h2>
            <div 
              dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}}
            />
          </section>
        ))}

        <footer className={styles.linkFooter}>
          { previousPostData && (
            <Link href={`/post/${previousPostData.slug}`}>
              <span>
                <p>{previousPostData.title}</p>
                <p>Post anterior</p>
              </span>
            </Link>
          )}

          { nextPostData && (
            <Link href={`/post/${nextPostData.slug}`}>
              <span>
                <p>{nextPostData.title}</p>
                <p>Pŕoximo post</p>
              </span>
            </Link>
          )}   

        </footer>
        <Comments slug={post.uid}/>

        {preview && (
          <Link href="/api/exit-preview">
            <aside className={commonStyles.previewMode}>
              <a>Sair do modo Preview</a>
            </aside>
          </Link>
        )}        
      </article>
    </div>
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

export const getStaticProps: GetStaticProps = async ({ 
  params,
  preview = false,
}) => {
  const { slug } = params
  
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});
  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      author: response.data.author,
      banner: response.data.banner,
      title: response.data.title,
      subtitle: response.data.subtitle,
      content: response.data.content,
    }
  }

  const previousPost = await prismic.query([Prismic.predicates.at(
    'document.type', 'post'
  )], {
    pageSize: 1,
    orderings: '[document.first_publication_date desc]',
    after: response.id
  })

  const previousPostData = previousPost.results?.map(post => {
    return {
      title: post.data?.title, 
      slug: post.uid
    }
  })

  const nextPost = await prismic.query([Prismic.predicates.at(
    'document.type', 'post'
  )], {
    pageSize: 1,
    orderings: '[document.first_publication_date]',
    after: response.id
  })

  const nextPostData = nextPost.results?.map(post => {
    return {
      title: post.data?.title, 
      slug: post.uid
    }
  })

  return {
    props: { 
      post, 
      preview, 
      previousPostData: previousPostData[0] ?? null,
      nextPostData: nextPostData[0] ?? null,
    },
    //revalidate: 60
  }
};
